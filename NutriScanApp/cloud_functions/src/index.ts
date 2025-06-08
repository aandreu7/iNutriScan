// cloud_functions/src/index.ts
// @aandreu7

/*
 * This file serves as the central export point for all Cloud Functions in the project.
 * By aggregating and exporting the functions here, Firebase can automatically
 * detect and deploy them. This approach keeps the code organized and maintainable,
 * allowing easy addition or removal of functions.
 */

import { createUserDocument } from './register';
import { createANewPlan } from './createPlan';
import { onExerciseCompleted } from './onExerciseCompleted';
import { getDailyKcalBalance } from './getDailyKcalBalance';

export { createUserDocument, createANewPlan, onExerciseCompleted, getDailyKcalBalance };