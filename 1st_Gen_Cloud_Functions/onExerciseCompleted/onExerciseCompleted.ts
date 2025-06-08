// cloud_functions/src/onExerciseCompleted.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
import { db } from './firebase';

/*
Updates kcal burnt by user, in case it checks any exercise as completed.
*/

export const onExerciseCompleted = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    // Extract the exercise plan strings before and after the update
    const beforePlan = change.before.data().exercise_plan_string;
    const afterPlan = change.after.data().exercise_plan_string;

    // Exit early if either plan is missing
    if (!beforePlan || !afterPlan) return;

    // Split the plans into individual exercise entries
    const beforeEntries = beforePlan.split('\n').filter(Boolean);
    const afterEntries = afterPlan.split('\n').filter(Boolean);

    let totalNewKcal = 0;

    // Iterate over exercises to detect newly completed ones
    for (let i = 0; i < afterEntries.length; i++) {
      const afterParts = afterEntries[i].split(' ');
      const beforeParts = beforeEntries[i]?.split(' ');

      // Skip malformed entries
      if (!afterParts[1]) continue;

      // Parse kcal and status from the after entry following the specific format
      const [, , , kcal, status] = afterParts[1].split('/');
      const afterStatus = status;
      const beforeStatus = beforeParts?.[1]?.split('/')[4];

      if (beforeStatus === 'n' && afterStatus === 'c') {
        totalNewKcal += parseInt(kcal);
      }
    }

    // Exit if no new completed exercises detected
    if (totalNewKcal === 0) return;

    const userId = context.params.userId;

    const userRef = db.collection('users').doc(userId);
    const collections = await userRef.listCollections();

    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    let targetCollection = collections.find(col => timestampRegex.test(col.id));

    // If today's collection does not exist, create a new one with current timestamp
    if (!targetCollection) {
      const newTimestamp = new Date().toISOString().slice(0, 19);
      targetCollection = userRef.collection(newTimestamp);
    }

    const nutrientsRef = targetCollection.doc('nutrients');
    const nutrientsSnap = await nutrientsRef.get();

    // Get previous burnt kcal, default to 0 if not found
    const prevKcal = nutrientsSnap.exists ? nutrientsSnap.data()?.burnt_kcal || 0 : 0;

    // Update the nutrients document, merging the new burnt kcal total
    await nutrientsRef.set(
      { burnt_kcal: prevKcal + totalNewKcal },
      { merge: true }
    );
  });