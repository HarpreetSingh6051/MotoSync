import { apiUrl } from "./environment";
import { supabase } from "./supabase";
export async function riderRequest<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  if (!supabase)
    throw new Error("Configure the rider app environment and rebuild.");
  const { data: authData, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!authData.session) throw new Error("Sign in to your rider account.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(apiUrl(path), {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw new Error(
        Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || `Request failed (${response.status})`,
      );
    if (data === null) throw new Error("The API returned an invalid response.");
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      throw new Error("The request timed out. Please retry.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
