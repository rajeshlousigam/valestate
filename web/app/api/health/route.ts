import { NextResponse } from "next/server";

// Web liveness probe (docs/20). Distinct from the API's own /v1/health.
export async function GET() {
  return NextResponse.json({ status: "ok", service: "housepoint-web" });
}
