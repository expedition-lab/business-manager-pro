import { cookies } from "next/headers";
import { createClient } from "./server";

export async function getUserFromServer() {
  const sb = createClient(cookies());
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email || "" };
}
