/**
 * Mock implementations of every Wails-bound method.
 * Read methods return fixture data; mutations return a no-op success response.
 * State does NOT change between calls (read-only fixtures).
 */
import { main } from "../../wailsjs/go/models";
import * as f from "./fixtures";

const ok = (data: unknown): main.Response =>
  main.Response.createFrom({ status: 200, msg: "", data });

const noop = (): main.Response => ok(null);

// ── Mutations (no-op success) ────────────────────────────────────────────────

export const AbsentApplication = async (_: number): Promise<main.Response> => noop();
export const AbsentRegistration = async (_: number): Promise<main.Response> => noop();
export const Backup = async (_: string): Promise<main.Response> => noop();
export const ClearApplicationStatus = async (_: number): Promise<main.Response> => noop();
export const ClearRegistrationStatus = async (_: number): Promise<main.Response> => noop();
export const CloseRollCall = async (_: number): Promise<main.Response> => noop();
export const CreateRollCall = async (_: number): Promise<main.Response> => noop();
export const DeleteApprovedSelection = async (): Promise<main.Response> => noop();
export const DeleteCall = async (_: number): Promise<main.Response> => noop();
export const DeleteInterestedSelection = async (): Promise<main.Response> => noop();
export const DeleteRollCall = async (_: number): Promise<main.Response> => noop();
export const DeleteRollcall = async (_: number): Promise<main.Response> => noop();
export const Destroy = async (): Promise<main.Response> => noop();
export const EmailPDF = async (_1: number, _2: string, _3: string): Promise<main.Response> => noop();
export const EnrollApplication = async (_: number): Promise<main.Response> => noop();
export const EnrollRegistration = async (_: number): Promise<main.Response> => noop();
export const EnrollmentPDF = async (_1: number, _2: string, _3: string): Promise<main.Response> => noop();
export const ExportCSV = async (_: string): Promise<main.Response> => noop();
export const LoadApprovedSelection = async (_1: number, _2: string): Promise<main.Response> => noop();
export const LoadInterestedSelection = async (_1: number, _2: string): Promise<main.Response> => noop();
export const LoadWaitlistSelection = async (_1: number, _2: string): Promise<main.Response> => noop();
export const OpenCall = async (_: number): Promise<main.Response> => noop();
export const OpenRollCall = async (_: number): Promise<main.Response> => noop();
export const Restore = async (_: string): Promise<main.Response> => noop();
export const TeacherPDF = async (_1: string, _2: string): Promise<main.Response> => noop();
export const WebsitePDF = async (_1: number, _2: string, _3: string): Promise<main.Response> => noop();

// ── File dialogs (stub paths) ────────────────────────────────────────────────

export const OpenFileDialog = async (_1: string, _2: string, _3: string): Promise<string> =>
  "/mock/arquivo.csv";

export const SaveFileDialog = async (_1: string, _2: string, _3: string, _4: string): Promise<string> =>
  "/mock/arquivo.csv";

// ── Read methods (fixture data) ──────────────────────────────────────────────

export const FetchApprovedSelection = async (): Promise<main.Response> =>
  ok(f.approvedSelection);

export const FetchInterestedSelection = async (): Promise<main.Response> =>
  ok(f.waitlistSelection);

export const FetchRollCalls = async (): Promise<main.Response> =>
  ok(f.mockCalls);

export const FetchSemesters = async (): Promise<main.Response> =>
  ok(f.mockSemesters);

export const FetchRegistrations = async (): Promise<main.Response> =>
  ok(f.mockRegistrations);

export const FetchRegistrationsBySelectionID = async (_: number): Promise<main.Response> =>
  ok(f.mockRegistrations);

export const FetchRegistrationsByCallID = async (_: number): Promise<main.Response> =>
  ok(f.mockRegistrations);

export const FetchRegistrationsByCourseID = async (_: number): Promise<main.Response> =>
  ok(f.mockRegistrations);

export const FetchApplicationsByRollCall = async (_: number): Promise<main.Response> =>
  ok(f.mockRegistrations);

export const FetchRegistration = async (id: number): Promise<main.Response> => {
  const detail =
    f.mockRegistrationDetails.find((d) => d.Registration.ID === id) ??
    f.mockRegistrationDetails[0];
  return ok(detail);
};
