/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as leaveRequests from "../leaveRequests.js";
import type * as medicalRecords from "../medicalRecords.js";
import type * as patients from "../patients.js";
import type * as prescriptions from "../prescriptions.js";
import type * as router from "../router.js";
import type * as scheduleTemplates from "../scheduleTemplates.js";
import type * as shiftTransfers from "../shiftTransfers.js";
import type * as staff from "../staff.js";
import type * as transferRecords from "../transferRecords.js";
import type * as transferRequests from "../transferRequests.js";
import type * as workSchedules from "../workSchedules.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  auth: typeof auth;
  dashboard: typeof dashboard;
  http: typeof http;
  leaveRequests: typeof leaveRequests;
  medicalRecords: typeof medicalRecords;
  patients: typeof patients;
  prescriptions: typeof prescriptions;
  router: typeof router;
  scheduleTemplates: typeof scheduleTemplates;
  shiftTransfers: typeof shiftTransfers;
  staff: typeof staff;
  transferRecords: typeof transferRecords;
  transferRequests: typeof transferRequests;
  workSchedules: typeof workSchedules;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
