export function featuresReleased() {
  return process.env.RELEASE?.trim().toUpperCase() === "TRUE";
}

export const releaseUnavailable = {
  error: "This feature is not available yet.",
  code: "WAITLIST_ONLY",
} as const;
