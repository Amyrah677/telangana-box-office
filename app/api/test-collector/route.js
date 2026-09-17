import { NextResponse } from "next";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Telangana Box Office collector is working!"
  });
}
