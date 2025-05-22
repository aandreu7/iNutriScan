// cloud_functions/src/firebase.ts
// @aandreu7

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
export const db = getFirestore();

