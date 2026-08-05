"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2, MapPin } from "lucide-react";
import type { Well } from "@/types/well";
import { useHighlight } from "@/context/HighlightContext";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  /** Wells (with valid coordinates) the answer is about. */
  wells?: Well[];
}

const SUGGESTED_QUESTIONS = [
  "الصخور المصدرية لشرق بغداد",
  "حقول تكوين الزبير",
  "الحقول الغازية",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { highlightWells } = useHighlight();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `⚠️ ${data.error ?? "حدث خطأ."}` },
        ]);
        return;
      }

      const wellsWithCoords: Well[] = (data.wells ?? []).filter(
        (w: Well) => w.lat !== null && w.lng !== null
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer, wells: wellsWithCoords },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ تعذّر الوصول للمساعد. حاول مرة ثانية." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function showOnMap(wells: Well[]) {
    highlightWells(wells.map((w) => w.slug));
    // The full map with all wells only lives on the home page — if the
    // person is on a different page (e.g. a well detail page), send
    // them there. WellsExplorer's own effect handles the scroll/zoom
    // once it mounts and reads the (already-set) highlight from context.
    if (pathname !== "/") {
      router.push("/");
    }
    setOpen(false);
  }

  return (
    <div dir="rtl" className="fixed bottom-6 right-6 z-50 font-arabic">
      {open && (
        <div className="mb-3 w-[360px] max-w-[90vw] h-[560px] max-h-[80vh] glass-card bg-brand-navy flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-start justify-between p-4 border-b border-white/10">
            <div>
              <p className="font-semibold text-brand-gold">مساعد الحقول الجيولوجي</p>
              <p className="text-xs text-white/50 mt-0.5">
                اسأل عن أي حقل نفطي أو غازي في قاعدة البيانات
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-white/60">
                أهلاً بك! اسألني عن أي حقل نفطي أو غازي بقاعدة البيانات، أو أي
                سؤال جيولوجي عام.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "mr-auto max-w-[85%]" : "ml-auto max-w-[95%]"}>
                <div
                  className={`text-sm rounded-xl2 px-3 py-2 whitespace-pre-line ${
                    m.role === "user" ? "bg-brand-gold text-brand-navy" : "bg-white/10"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "assistant" && m.wells && m.wells.length > 0 && (
                  <button
                    onClick={() => showOnMap(m.wells!)}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-brand-gold hover:text-brand-gold-light"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    حدّد على الخريطة الرئيسية
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-white/40 text-sm ml-auto">
                <Loader2 className="w-4 h-4 animate-spin" />
                يفكر…
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendQuestion(q)}
                  className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuestion(input);
            }}
            className="p-3 border-t border-white/10 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-gold text-brand-navy rounded-lg p-2 disabled:opacity-50"
              aria-label="إرسال"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-brand-gold text-brand-navy shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="مساعد الحقول الجيولوجي"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
