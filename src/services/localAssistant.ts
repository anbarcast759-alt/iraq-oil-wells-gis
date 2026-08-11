import type { Well } from "@/types/well";
import { findNearbyWells } from "@/utils/spacing";

export interface AssistantAnswer {
  text: string;
  /** Wells the answer is about, so the UI can plot them on a map. */
  wells: Well[];
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function describeWell(w: Well): string {
  const lines = [
    `البئر: ${w.Well_Name || w.slug}`,
    w.Field && `الحقل: ${w.Field}`,
    w.Governorate && `المحافظة: ${w.Governorate}`,
    w.Productive_Formation && `التكوين المنتج: ${w.Productive_Formation}`,
    w.Reservoir && `الخزان: ${w.Reservoir}`,
    w.TD_Depth && `العمق الكلي (TD): ${w.TD_Depth}`,
    w.TVD && `TVD: ${w.TVD}`,
    w.Well_Type && `نوع البئر: ${w.Well_Type}`,
    w.Lithology && `صخارية التكوين: ${w.Lithology}`,
    w.Rig && `الحفارة: ${w.Rig}`,
    w.Operator && `المشغّل: ${w.Operator}`,
    w.Remarks && `ملاحظات: ${w.Remarks}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function uniqueValues(wells: Well[], field: keyof Well): string[] {
  return Array.from(
    new Set(
      wells
        .map((w) => w[field])
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    )
  );
}

/**
 * Free, no-API-key assistant: matches the question against real values
 * already in the sheet (well names, fields, formations, reservoirs,
 * operators, rigs) and answers from that data directly — including
 * which wells the answer is about, so the caller can plot them on a
 * map. It won't understand free-form phrasing the way a real LLM
 * would, but it never costs money, never rate-limits, and never
 * invents an answer that isn't backed by the sheet.
 */
export function answerLocally(question: string, wells: Well[]): AssistantAnswer {
  const q = norm(question);

  if (wells.length === 0) {
    return { text: "ما فيه أي آبار مسجّلة بقاعدة البيانات حاليًا.", wells: [] };
  }

  if (/(كم|عدد).{0,10}(بئر|ابار|آبار)|total wells|how many wells/i.test(q)) {
    return { text: `عدد الآبار المسجّلة حاليًا: ${wells.length}.`, wells: [] };
  }

  const PROXIMITY_KEYWORDS = /قريب|جنب|مجاور|بجانب|near|nearby|close to/i;
  if (PROXIMITY_KEYWORDS.test(q)) {
    const target = wells.find((w) => w.Well_Name && q.includes(norm(w.Well_Name)));
    if (target) {
      const nearby = findNearbyWells(target, wells, 500);
      if (nearby.length === 0) {
        return {
          text: `ما فيه آبار أخرى قريبة من ${target.Well_Name || target.slug} ضمن 500 متر.`,
          wells: [target],
        };
      }
      return {
        text:
          `الآبار القريبة من ${target.Well_Name || target.slug} (ضمن 500 متر):\n` +
          nearby
            .map((n) => `- ${n.well.Well_Name || n.well.slug}: ${n.distanceMeters.toFixed(0)} متر`)
            .join("\n"),
        wells: [target, ...nearby.map((n) => n.well)],
      };
    }
  }

  const wellMatch = wells.find(
    (w) => w.Well_Name && q.includes(norm(w.Well_Name))
  );
  if (wellMatch) return { text: describeWell(wellMatch), wells: [wellMatch] };

  const fields = uniqueValues(wells, "Field");
  const fieldMatch = fields.find((f) => q.includes(norm(f)));
  if (fieldMatch) {
    const inField = wells.filter((w) => w.Field === fieldMatch);
    return {
      text:
        `الآبار بحقل "${fieldMatch}" (${inField.length}):\n` +
        inField
          .map((w) => `- ${w.Well_Name || w.slug} (${w.Productive_Formation || "تكوين غير محدد"})`)
          .join("\n"),
      wells: inField,
    };
  }

  const formations = uniqueValues(wells, "Productive_Formation");
  const formationMatch = formations.find((f) => q.includes(norm(f)));
  if (formationMatch) {
    const inFormation = wells.filter((w) => w.Productive_Formation === formationMatch);
    return {
      text:
        `الآبار بتكوين "${formationMatch}" (${inFormation.length}):\n` +
        inFormation
          .map((w) => `- ${w.Well_Name || w.slug} (${w.Field || "حقل غير محدد"})`)
          .join("\n"),
      wells: inFormation,
    };
  }

  const reservoirs = uniqueValues(wells, "Reservoir");
  const reservoirMatch = reservoirs.find((r) => q.includes(norm(r)));
  if (reservoirMatch) {
    const inReservoir = wells.filter((w) => w.Reservoir === reservoirMatch);
    return {
      text:
        `الآبار بخزان "${reservoirMatch}" (${inReservoir.length}):\n` +
        inReservoir.map((w) => `- ${w.Well_Name || w.slug}`).join("\n"),
      wells: inReservoir,
    };
  }

  const operators = uniqueValues(wells, "Operator");
  const operatorMatch = operators.find((o) => q.includes(norm(o)));
  if (operatorMatch) {
    const byOperator = wells.filter((w) => w.Operator === operatorMatch);
    return {
      text:
        `آبار المشغّل "${operatorMatch}" (${byOperator.length}):\n` +
        byOperator.map((w) => `- ${w.Well_Name || w.slug}`).join("\n"),
      wells: byOperator,
    };
  }

  const rigs = uniqueValues(wells, "Rig");
  const rigMatch = rigs.find((r) => q.includes(norm(r)));
  if (rigMatch) {
    const byRig = wells.filter((w) => w.Rig === rigMatch);
    return {
      text:
        `الآبار المحفورة بواسطة الحفارة "${rigMatch}" (${byRig.length}):\n` +
        byRig.map((w) => `- ${w.Well_Name || w.slug}`).join("\n"),
      wells: byRig,
    };
  }

  return {
    text: [
      "ما قدرت أوجد تطابق مباشر بسؤالك مع بيانات قاعدة البيانات.",
      "جرب تذكر اسم بئر، حقل، تكوين، خزان، حفارة، أو مشغّل موجود بالبيانات فعليًا.",
      fields.length > 0 ? `الحقول المتوفرة: ${fields.join("، ")}` : "",
      formations.length > 0 ? `التكوينات المتوفرة: ${formations.join("، ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    wells: [],
  };
}
