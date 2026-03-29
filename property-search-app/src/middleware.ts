import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isInternalBearerAuthorized } from "@/lib/auth/internal-bearer";

export function middleware(request: NextRequest) {
  if (!isInternalBearerAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
