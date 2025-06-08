// cloud_functions/src/getDailyKcalBalance.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
import { db } from './firebase';

/*
Returns user's daily kcal balance.
*/

export const getDailyKcalBalance = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userDocRef = db.collection('users').doc(userId);

  try {
    // Get current date in YYYY-MM-DD format
    const todayDate = new Date().toISOString().slice(0, 10);

    // List all subcollections under the user's document
    const userCollections = await userDocRef.listCollections();

    // Find today's collection (named starting with the date string)
    const todayCollection = userCollections.find(col => col.id.startsWith(todayDate));

    let consumedKcal = 0;
    let burntKcal = 0;

    if (todayCollection) {
      // Retrieve the 'nutrients' document inside today's collection
      const nutrientsDoc = await todayCollection.doc('nutrients').get();
      if (nutrientsDoc.exists) {
        // Extract consumed and burnt kcal from the document, defaulting to 0 if missing
        consumedKcal = nutrientsDoc.data()?.kcal ?? 0;
        burntKcal = nutrientsDoc.data()?.burnt_kcal ?? 0;
      }
    }

    // Get user's kcal target from the user document
    const userDoc = await userDocRef.get();
    const kcalTarget = userDoc.exists ? userDoc.data()?.kcal_target ?? 0 : 0;

    // Return the kcal balance info
    return { burntKcal, kcalTarget, consumedKcal };
  } catch (error) {
    console.error('Error getting daily kcal balance:', error);
    throw new functions.https.HttpsError('internal', 'Error getting daily kcal balance');
  }
});