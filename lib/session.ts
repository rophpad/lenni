import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export const getSession = cache(async () => {
  const requestHeaders = await headers();
  try {
    return await auth.api.getSession({ headers: requestHeaders });
  } catch {
    await new Promise(resolve => setTimeout(resolve, 500));
    return auth.api.getSession({ headers: requestHeaders });
  }
});

export async function apiUser() {
  const session = await getSession();
  return session?.user ?? null;
}
