/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as comments from "../comments.js";
import type * as indicatorScores from "../indicatorScores.js";
import type * as ltScores from "../ltScores.js";
import type * as parentSurvey from "../parentSurvey.js";
import type * as query_user from "../query_user.js";
import type * as schoolProfile from "../schoolProfile.js";
import type * as schools from "../schools.js";
import type * as studentSurvey from "../studentSurvey.js";
import type * as teacherSurvey from "../teacherSurvey.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  comments: typeof comments;
  indicatorScores: typeof indicatorScores;
  ltScores: typeof ltScores;
  parentSurvey: typeof parentSurvey;
  query_user: typeof query_user;
  schoolProfile: typeof schoolProfile;
  schools: typeof schools;
  studentSurvey: typeof studentSurvey;
  teacherSurvey: typeof teacherSurvey;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
