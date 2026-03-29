/**
 * Validates `Authorization: Bearer <INTERNAL_API_KEY>` for internal / admin API routes.
 */
export function isInternalBearerAuthorized(request: Request): boolean {
  // Keep this module Edge-safe: do not import Node-only path/config modules.
  if (process.env.ENV === "PROD") {
    return false;
  }
  const key = process.env.INTERNAL_API_KEY;
  if (key == null || key === "") {
    return false;
  }
  return request.headers.get("Authorization") === `Bearer ${key}`;
}
