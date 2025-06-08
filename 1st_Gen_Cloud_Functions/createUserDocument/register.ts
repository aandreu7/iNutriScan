// cloud_functions/src/register.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
import { db } from './firebase';

/*
Creates a new document on Firestore when a new user is registered.
This Cloud Function is activated by Firebase's new user trigger.
*/

export const createUserDocument = functions.auth.user().onCreate((user) => {
  const uid = user.uid;
  const email = user.email || null;
  const displayName = user.displayName || null;

  const userRef = db.collection("users").doc(uid);
  return userRef.set({
    email,
    name: displayName,
    createdAt: new Date(),
  });
});
