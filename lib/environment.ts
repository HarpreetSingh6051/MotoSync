export const apiBase = (process.env.EXPO_PUBLIC_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");
export const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
export const apiUrl = (path: string) => {
  if (!apiBase)
    throw new Error("Set EXPO_PUBLIC_API_BASE_URL and rebuild the app.");
  return `${apiBase}/${path.replace(/^\/+/, "")}`;
};
