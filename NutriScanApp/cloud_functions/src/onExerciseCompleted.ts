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
    const beforePlan = change.before.data().exercise_plan_string;
    const afterPlan = change.after.data().exercise_plan_string;

    if (!beforePlan || !afterPlan) return;

    const beforeEntries = beforePlan.split('\n').filter(Boolean);
    const afterEntries = afterPlan.split('\n').filter(Boolean);

    let totalNewKcal = 0;

    for (let i = 0; i < afterEntries.length; i++) {
      const afterParts = afterEntries[i].split(' ');
      const beforeParts = beforeEntries[i]?.split(' ');

      if (!afterParts[1]) continue;

      const [, , , kcal, status] = afterParts[1].split('/');
      const afterStatus = status;
      const beforeStatus = beforeParts?.[1]?.split('/')[4];

      if (beforeStatus === 'n' && afterStatus === 'c') {
        totalNewKcal += parseInt(kcal);
      }
    }

    if (totalNewKcal === 0) return;

    const userId = context.params.userId;

    const userRef = db.collection('users').doc(userId);
    const collections = await userRef.listCollections();

    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    let targetCollection = collections.find(col => timestampRegex.test(col.id));

    if (!targetCollection) {
      const newTimestamp = new Date().toISOString().slice(0, 19);
      targetCollection = userRef.collection(newTimestamp);
    }

    const nutrientsRef = targetCollection.doc('nutrients');
    const nutrientsSnap = await nutrientsRef.get();

    const prevKcal = nutrientsSnap.exists ? nutrientsSnap.data()?.burnt_kcal || 0 : 0;

    await nutrientsRef.set(
      { burnt_kcal: prevKcal + totalNewKcal },
      { merge: true }
    );
  });
