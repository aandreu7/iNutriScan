// cloud_functions/src/index.ts
// @aandreu7

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import { createUserDocument } from './register';
import { createANewPlan } from './createPlan';

export { createUserDocument, createANewPlan };