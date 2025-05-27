// cloud_functions/src/createPlan.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
import { db } from './firebase';

/*
Creates new fields on user's document when a new plan is configured through triggers.
*/

export const createANewPlan = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    const targetChanged = beforeData?.target !== afterData?.target;
    const weightChanged = beforeData?.weight !== afterData?.weight;
    const heightChanged = beforeData?.height !== afterData?.height;

    if (!targetChanged && !weightChanged && !heightChanged) {
      return null;
    }

    const userId = context.params.userId;
    const target = afterData.target;
    const userDocRef = db.collection('users').doc(userId);
    const userInfo = {
      weight: afterData.weight,
      height: afterData.height,
      age: afterData.age,
      sex: afterData.sex,
    };

    try {
      const planDoc = await db.collection('plans').doc(target).get();

      if (!planDoc.exists) {
        console.log(`Plan ${target} not found`);
        return null;
      }

      const planData = planDoc.data();
      const exercises = Object.entries(planData || {});
      let fullExerciseString = '';

      for (const [exerciseName, baseParams] of exercises) {
        const adaptedParams = adaptExerciseParams(baseParams as string, userInfo);
        fullExerciseString += `${exerciseName} ${adaptedParams}\n`;
      }

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

  if (user.age < 25) {
    adaptedIntensity *= 1.2;
    adaptedReps += 1;
  } else if (user.age > 50) {
    adaptedIntensity *= 0.6;
    adaptedReps -= 1;
  }

  if (user.sex === false) {
    adaptedIntensity *= 0.94;
  }

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

  const kcal = estimateKcal(adaptedMinutes, discreteIntensity, user);
  return `${adaptedMinutes}/${adaptedReps}/${discreteIntensity}/${kcal}/n`;
}

function estimateKcal(duration: number, intensity: number, user: { weight: number; height: number; age: number; sex: boolean }): number {
  const metBase = intensity === 1 ? 3 : intensity === 2 ? 5 : 8;
  const kcalPerMinute = (metBase * 3.5 * user.weight) / 200;
  const totalKcal = kcalPerMinute * duration;
  return Math.round(totalKcal);
}