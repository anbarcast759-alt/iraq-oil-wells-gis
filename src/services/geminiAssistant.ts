import type { Well } from "@/types/well";

/**
 * Turns the live dataset into a compact text block the model can read.
 * Fine for a field with tens/low-hundreds of wells; if this project
 * later covers all of Iraq's oil fields, this should be replaced with
 * a retrieval step (only send wells relevant to the question) instead
 * of the whole dataset every request.
 */
function buildContext(wells: Well[]): string {
  if (wells.length === 0) return "The database currently has no wells.";

  return wells
    .map((w, i) => {
      const fields = [
        `Well_Name: ${w.Well_Name || "—"}`,
        `Field: ${w.Field || "—"}`,
        `Governorate: ${w.Governorate || "—"}`,
        `TD_Depth: ${w.TD_Depth || "—"}`,
        `TVD: ${w.TVD || "—"}`,
        `Productive_Formation: ${w.Productive_Formation || "—"}`,
        `Reservoir: ${w.Reservoir || "—"}`,
        `Well_Type: ${w.Well_Type || "—"}`,
        `Well_Status: ${w.Well_Status || "—"}`,
        `Rig: ${w.Rig || "—"}`,
        `Operator: ${w.Operator || "—"}`,
        `Remarks: ${w.Remarks || "—"}`,
      ].join(", ");
      return `${i + 1}. ${fields}`;
    })
    .join("\n");
}

const SYSTEM_INSTRUCTION = `You are a geological/petroleum assistant for the Iraq Oil Wells GIS Platform.
Answer ONLY using the well data provided below — never invent wells, formations, or values that aren't in it.
If the data doesn't contain the answer, say so plainly instead of guessing.
Answer in the same language the question was asked in (Arabic question -> Arabic answer, English -> English).
Keep answers concise and factual.`;

export async function askGeologicalAssistant(
  question: string,
  wells: Well[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set on the server. Add it to .env.local (see .env.example)."
    );
  }

  const context = buildContext(wells);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Well database:\n${context}\n\nQuestion: ${question}`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
