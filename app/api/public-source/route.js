import { NextResponse } from "next/server";

export async function GET() {
  const sourceUrl = process.env.PUBLIC_SOURCE_URL;

  if (!sourceUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "PUBLIC_SOURCE_URL is not configured",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        Accept: "application/json",
        ...(process.env.PUBLIC_SOURCE_TOKEN
          ? {
              Authorization: `Bearer ${process.env.PUBLIC_SOURCE_TOKEN}`,
            }
          : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Source returned HTTP ${response.status}`,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      fetched_at: new Date().toISOString(),
      items: Array.isArray(data?.items) ? data.items : [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Source fetch failed",
      },
      { status: 502 }
    );
  }
}
