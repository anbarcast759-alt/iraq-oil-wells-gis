import { NextResponse } from "next/server";
import { getWellsDataset } from "@/services/googleSheets";
import { answerLocally } from "@/services/localAssistant";

export async function POST(request: Request) {
  const { question } = (await request.json()) as { question?: string };

  if (!question || !question.trim()) {
    return NextResponse.json({ error: "Question is empty." }, { status: 400 });
  }

  try {
    const { wells } = await getWellsDataset();
    const result = answerLocally(question, wells);
    return NextResponse.json({ answer: result.text, wells: result.wells });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
