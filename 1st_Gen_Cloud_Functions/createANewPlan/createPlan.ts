// cloud_functions/src/createPlan.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
import { db } from './firebase';

/*
Creates new fields on user's document when a new plan is configured. Function automatically executed using Firestore triggers.
*/

export const createANewPlan = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if any relevant user fields changed: target, weight or height
    const targetChanged = beforeData?.target !== afterData?.target;
    const weightChanged = beforeData?.weight !== afterData?.weight;
    const heightChanged = beforeData?.height !== afterData?.height;

    // If no field has changed, then is not necessary to do anything
    if (!targetChanged && !weightChanged && !heightChanged) {
      return null;
    }

    // If at least one field has changed, then we have to update the user's Firestore document
    const userId = context.params.userId;
    const target = afterData.target;
    const userDocRef = db.collection('users').doc(userId);

    // Extract user info for adapting exercises
    const userInfo = {
      weight: afterData.weight,
      height: afterData.height,
      age: afterData.age,
      sex: afterData.sex,
    };

    try {
      // Retrieve exercise plan for the user's target
      const planDoc = await db.collection('plans').doc(target).get();

      if (!planDoc.exists) {
        console.log(`Plan ${target} not found`);
        return null;
      }

      const planData = planDoc.data();
      const exercises = Object.entries(planData || {});
      let fullExerciseString = '';

      // Adapt each exercise based on user's info and concatenate results
      for (const [exerciseName, baseParams] of exercises) {
        const adaptedParams = adaptExerciseParams(baseParams as string, userInfo);
        fullExerciseString += `${exerciseName} ${adaptedParams}\n`;
      }

      // All exercises assigned to user are descripted in a single string
      // Update user's document with the generated exercise plan string
      await userDocRef.update({
        exercise_plan_string: fullExerciseString.trim(),
      });

      console.log(`Updated exercise_plan_string for user ${userId}`);
    } catch (error) {
      console.error('Error generating exercise plan string:', error);
    }

    return null;
  });

// Adapts base parameters based on user's profile
function adaptExerciseParams(base: string, user: { weight: number; height: number; age: number; sex: boolean }): string {
  const [minutes, reps, intensity] = base.split('/').map(parseFloat);

  let adaptedMinutes = minutes;
  let adaptedReps = reps;
  let adaptedIntensity = intensity;

  // Modify intensity and reps based on user's age
  if (user.age < 25) {
    adaptedIntensity *= 1.2;
    adaptedReps += 1;
  } else if (user.age > 50) {
    adaptedIntensity *= 0.6;
    adaptedReps -= 1;
  }

  // Adjust intensity for sex
  // Naming convention:
  // Female --> False
  // Male --> True
  if (user.sex === false) {
    adaptedIntensity *= 0.94;
  }

  // Calculate BMI to adjust parameters further
  const heightInMeters = user.height / 100;
  const bmi = user.weight / (heightInMeters * heightInMeters);

  if (bmi < 18.5) {
    // Underweight
    adaptedIntensity *= 0.92;
    adaptedReps += 1;
  } else if (bmi >= 25 && bmi < 30) {
    // Overweight
    adaptedIntensity *= 1.2;
    adaptedReps -= 1;
  } else if (bmi >= 30) {
    // Obesity
    adaptedIntensity *= 1.1;
    adaptedReps -= 2;
  } else {
    // Normal
    adaptedIntensity *= 1.0;
  }

  // === Outlier treatment ===
  if (user.weight > 100) {
    adaptedMinutes += 1;
    adaptedIntensity *= 0.95;
  } else if (user.weight < 50) {
    adaptedIntensity *= 1.05;
  }

  if (user.height > 190) {
    adaptedMinutes += 1;
  } else if (user.height < 155) {
    adaptedMinutes -= 1;
  }

  // === Final corrections ===
  // Ensure reps and minutes are reasonable integers
  adaptedReps = Math.max(1, Math.round(adaptedReps));
  adaptedMinutes = Math.max(1, Math.round(adaptedMinutes));

  // === Discretize intensity into {1, 2, 3} ===
  let discreteIntensity: number;
  if (adaptedIntensity < 0.9) {
    discreteIntensity = 1; // low
  } else if (adaptedIntensity < 1.1) {
    discreteIntensity = 2; // medium
  } else {
    discreteIntensity = 3; // high
  }

  // Estimate calories burned based on adapted parameters
  const kcal = estimateKcal(adaptedMinutes, discreteIntensity, user);
  return `${adaptedMinutes}/${adaptedReps}/${discreteIntensity}/${kcal}/n`;
}

// Estimate kcal burned based on exercise duration, intensity and user's weight
function estimateKcal(duration: number, intensity: number, user: { weight: number; height: number; age: number; sex: boolean }): number {
  // MET values roughly mapped to intensity levels
  const metBase = intensity === 1 ? 3 : intensity === 2 ? 5 : 8;
  const kcalPerMinute = (metBase * 3.5 * user.weight) / 200;
  const totalKcal = kcalPerMinute * duration;
  return Math.round(totalKcal);
}