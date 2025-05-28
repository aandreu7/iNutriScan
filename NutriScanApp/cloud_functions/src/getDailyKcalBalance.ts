// cloud_functions/src/getDailyKcalBalance.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
import { db } from './firebase';

/*
Returns user's daily kcal balance.
*/

export const getDailyKcalBalance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userDocRef = db.collection('users').doc(userId);

  // FIXING NEEDED HERE !!!!!!!
  try {
    const todayDate = new Date().toISOString().slice(0, 10);

    const userCollections = await userDocRef.listCollections();

    // IT DETECTS COLLECTIONS FROM PAST DAYS. FIX.
    const todayCollection = userCollections.find(col => col.id.startsWith(todayDate));

    let consumedKcal = 0;
    let burntKcal = 0;

    if (todayCollection) {
      const nutrientsDoc = await todayCollection.doc('nutrients').get();
      if (nutrientsDoc.exists) {
        consumedKcal = nutrientsDoc.data()?.kcal ?? 0;
        burntKcal = nutrientsDoc.data()?.burnt_kcal ?? 0;
      }
    }

    const userDoc = await userDocRef.get();
    const kcalTarget = userDoc.exists ? userDoc.data()?.kcal_target ?? 0 : 0;

    return { burntKcal, kcalTarget, consumedKcal };
  } catch (error) {
    console.error('Error getting daily kcal balance:', error);
    throw new functions.https.HttpsError('internal', 'Error getting daily kcal balance');
  }
});