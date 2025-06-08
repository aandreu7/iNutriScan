// cloud_functions/src/firebase.ts
// @aandreu7

/*
  Firebase Initialization

  - Initializes the Firebase Admin SDK app.
  - Exports a Firestore database instance for use in cloud functions.
*/

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
export const db = getFirestore();