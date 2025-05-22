// cloud_functions/src/register.ts
// @aandreu7

import * as functions from 'firebase-functions/v1';
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const createUserDocument = functions.auth.user().onCreate((user) => {
  const uid = user.uid;
  const email = user.email || null;
  const displayName = user.displayName || null;

  const userRef = db.collection("users").doc(uid);
  return userRef.set({
    email,r
    name: displayName,
    createdAt: new Date(),
  });
});
