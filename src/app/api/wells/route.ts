import { NextResponse } from "next/server";
import { getWellsDataset } from "@/services/googleSheets";

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("refresh") === "1";

  try {
    const dataset = await getWellsDataset({ force });
    return NextResponse.json(dataset);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
