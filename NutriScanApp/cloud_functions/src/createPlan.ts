// cloud_functions/src/createPlan.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
//import { db } from './firebase';

/*
Creates new fields on user's document when a new plan is configured through triggers.
*/

export const createANewPlan = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (beforeData?.target !== afterData?.target && afterData?.target) {
      console.log(`User ${context.params.userId} updated target to: ${afterData.target}`);
    }
    return null;
  });

