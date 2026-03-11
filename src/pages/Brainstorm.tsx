import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Mockup: Direction A — Cinematic Scroll Journey ─── */
function DirectionA() {
  return (
    <div className="space-y-0">
      {/* Hero snap section */}
      <div className="relative h-[420px] bg-gradient-to-b from-[hsl(0,0%,8%)] to-[hsl(0,0%,0%)] rounded-2xl overflow-hidden border border-[hsl(0,0%,15%)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[hsl(0,0%,40%)] text-xs tracking-[0.3em] uppercase mb-4 font-[family-name:var(--font-display)]">Full-screen snap sections</p>
            <h2 className="text-5xl font-bold text-[hsl(0,0%,100%)] font-[family-name:var(--font-display)] leading-tight">
              BUILD<br/>MINI-APPS,<br/>LIKE LEGO.
            </h2>
            <div className="mt-6 flex items-center gap-2 justify-center text-[hsl(0,0%,40%)]">
              <div className="w-2 h-2 rounded-full bg-[hsl(0,0%,100%)]" />
              <div className="w-2 h-2 rounded-full bg-[hsl(0,0%,30%)]" />
              <div className="w-2 h-2 rounded-full bg-[hsl(0,0%,30%)]" />
              <div className="w-2 h-2 rounded-full bg-[hsl(0,0%,30%)]" />
              <span className="text-xs ml-2">snap-scroll dots</span>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-5 h-8 rounded-full border-2 border-[hsl(0,0%,30%)] flex items-start justify-center pt-1">
            <div className="w-1 h-2 bg-[hsl(0,0%,60%)] rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Horizontal timeline mockup */}
      <div className="mt-4 p-6 rounded-2xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,4%)]">
        <p className="text-xs text-[hsl(0,0%,40%)] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-display)]">Horizontal scroll timeline</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {["요구사항", "초기화", "SDK 선택", "TDS", "구현", "검증", "심사"].map((step, i) => (
            <div key={i} className="flex-shrink-0 w-32">
              <div className="h-24 rounded-xl bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,18%)] flex flex-col items-center justify-center gap-2 relative">
                <span className="text-2xl font-bold text-[hsl(0,0%,12%)] font-[family-name:var(--font-display)] absolute top-1 right-2">0{i+1}</span>
                <span className="text-sm text-[hsl(0,0%,70%)] font-medium relative z-10">{step}</span>
              </div>
              {i < 6 && <div className="h-px bg-gradient-to-r from-[hsl(0,0%,20%)] to-transparent mt-2 ml-16" />}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA mockup */}
      <div className="mt-4 p-4 rounded-2xl border border-[hsl(217,91%,60%)] bg-[hsl(217,91%,60%,0.08)] flex items-center justify-between">
        <div>
          <p className="text-xs text-[hsl(0,0%,40%)] uppercase tracking-wider">Sticky bottom bar</p>
          <p className="text-sm text-[hsl(0,0%,70%)] mt-1">스크롤 시 하단에 고정 REMIX CTA</p>
        </div>
        <div className="bg-[hsl(0,0%,100%)] text-[hsl(0,0%,0%)] px-6 py-2.5 rounded-full text-sm font-bold tracking-wider">⟳ REMIX NOW</div>
      </div>
    </div>
  );
}

/* ─── Mockup: Direction B — Editorial Storytelling Flow ─── */
function DirectionB() {
  const [activeFilter, setActiveFilter] = useState("all");
  return (
    <div className="space-y-4">
      {/* Section transition gradient mockup */}
      <div className="rounded-2xl overflow-hidden border border-[hsl(0,0%,15%)]">
        <div className="h-32 bg-[hsl(0,0%,0%)] flex items-end px-6 pb-4">
          <span className="text-xs text-[hsl(0,0%,30%)] tracking-widest uppercase font-[family-name:var(--font-display)]">Hero Section ↑</span>
        </div>
        {/* Gradient transition zone */}
        <div className="h-24 bg-gradient-to-b from-[hsl(0,0%,0%)] via-[hsl(0,0%,3%)] to-[hsl(0,0%,6%)] flex items-center justify-center relative">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[hsl(0,0%,20%)] to-transparent" />
          <span className="relative bg-[hsl(0,0%,4%)] px-4 py-1 rounded-full text-xs text-[hsl(160,84%,39%)] border border-[hsl(160,84%,39%,0.2)]">✦ 부드러운 그라데이션 전환</span>
        </div>
        <div className="h-32 bg-[hsl(0,0%,6%)] flex items-start px-6 pt-4">
          <span className="text-xs text-[hsl(0,0%,30%)] tracking-widest uppercase font-[family-name:var(--font-display)]">↓ Next Section</span>
        </div>
      </div>

      {/* Zigzag workflow stepper */}
      <div className="p-6 rounded-2xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,4%)]">
        <p className="text-xs text-[hsl(0,0%,40%)] tracking-[0.2em] uppercase mb-6 font-[family-name:var(--font-display)]">지그재그 비주얼 스텝퍼</p>
        <div className="space-y-3">
          {[
            { num: "01", title: "요구사항 정의", desc: "어떤 미니앱을 만들지 명확히", side: "left" },
            { num: "02", title: "반려방지 초기화", desc: "granite.config + 브랜딩 세팅", side: "right" },
            { num: "03", title: "SDK 블록 선택", desc: "with-* 예제에서 조합 선택", side: "left" },
          ].map((step) => (
            <div key={step.num} className={`flex items-center gap-4 ${step.side === "right" ? "flex-row-reverse text-right" : ""}`}>
              <div className="w-12 h-12 rounded-xl bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,20%)] flex items-center justify-center text-lg font-bold text-[hsl(0,0%,25%)] font-[family-name:var(--font-display)] flex-shrink-0">
                {step.num}
              </div>
              <div className="flex-1">
                <div className="h-px bg-gradient-to-r from-[hsl(0,0%,20%)] to-transparent mb-2" style={{ direction: step.side === "right" ? "rtl" : "ltr" }} />
                <p className="text-sm font-bold text-[hsl(0,0%,90%)]">{step.title}</p>
                <p className="text-xs text-[hsl(0,0%,45%)]">{step.desc}</p>
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-[hsl(0,0%,30%)]">⋮ 4~7단계 계속</p>
        </div>
      </div>

      {/* Interactive filter tabs */}
      <div className="p-6 rounded-2xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,4%)]">
        <p className="text-xs text-[hsl(0,0%,40%)] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-display)]">인터랙티브 필터 탭 + 호버 프리뷰</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: "all", label: "전체", color: "hsl(0,0%,60%)" },
            { id: "env", label: "환경", color: "hsl(217,91%,60%)" },
            { id: "auth", label: "인증", color: "hsl(160,84%,39%)" },
            { id: "ads", label: "광고", color: "hsl(32,95%,52%)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: activeFilter === tab.id ? tab.color : "hsl(0,0%,10%)",
                color: activeFilter === tab.id ? "hsl(0,0%,0%)" : "hsl(0,0%,50%)",
                borderWidth: 1,
                borderColor: activeFilter === tab.id ? tab.color : "hsl(0,0%,18%)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: "토스 로그인", color: "hsl(160,84%,39%)" },
            { name: "보상형 광고", color: "hsl(32,95%,52%)" },
            { name: "환경 감지", color: "hsl(217,91%,60%)" },
          ].map((block) => (
            <motion.div
              key={block.name}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${block.color.replace("hsl", "hsla").replace(")", ",0.2)")}` }}
              className="p-3 rounded-xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,7%)] cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full mb-2" style={{ background: block.color }} />
              <p className="text-xs font-bold" style={{ color: block.color }}>{block.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mid-page CTA */}
      <div className="p-6 rounded-2xl border border-[hsl(0,0%,20%)] bg-gradient-to-r from-[hsl(0,0%,5%)] to-[hsl(0,0%,8%)] flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[hsl(0,0%,90%)]">23개 블록을 조합해서 바로 시작하세요</p>
          <p className="text-xs text-[hsl(0,0%,45%)] mt-1">문맥에 맞는 중간 CTA</p>
        </div>
        <div className="bg-[hsl(0,0%,100%)] text-[hsl(0,0%,0%)] px-5 py-2 rounded-full text-xs font-bold tracking-wider flex items-center gap-2">
          ⟳ REMIX
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup: Direction C — Interactive Playground ─── */
function DirectionC() {
  const words = ["출석체크 앱", "바이럴 리워드", "커머스 앱", "게임 미니앱"];
  const [wordIdx, setWordIdx] = useState(0);

  return (
    <div className="space-y-4">
      {/* Typing animation hero */}
      <div className="h-48 rounded-2xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,4%)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs text-[hsl(0,0%,40%)] tracking-widest uppercase mb-3 font-[family-name:var(--font-display)]">타이핑 애니메이션 히어로</p>
          <h2 className="text-3xl font-bold text-[hsl(0,0%,100%)] font-[family-name:var(--font-display)]">
            Build{" "}
            <span className="relative">
              <motion.span
                key={wordIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[hsl(160,84%,50%)]"
              >
                {words[wordIdx]}
              </motion.span>
              <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="ml-0.5 text-[hsl(160,84%,50%)]">|</motion.span>
            </span>
          </h2>
          <div className="flex gap-1 mt-4 justify-center">
            {words.map((w, i) => (
              <button key={i} onClick={() => setWordIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === wordIdx ? "bg-[hsl(160,84%,50%)]" : "bg-[hsl(0,0%,20%)]"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Draggable lego blocks */}
      <div className="p-6 rounded-2xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,4%)]">
        <p className="text-xs text-[hsl(0,0%,40%)] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-display)]">드래그 가능한 레고 블록 조합</p>
        <div className="flex gap-2 items-end justify-center">
          {[
            { name: "로그인", h: 60, color: "hsl(160,84%,39%)" },
            { name: "광고", h: 80, color: "hsl(32,95%,52%)" },
            { name: "스토리지", h: 50, color: "hsl(160,84%,39%)" },
            { name: "공유", h: 70, color: "hsl(340,82%,58%)" },
          ].map((block) => (
            <motion.div
              key={block.name}
              whileHover={{ y: -8, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border-2 cursor-grab flex items-center justify-center"
              style={{
                width: 80,
                height: block.h,
                borderColor: block.color,
                background: block.color.replace("hsl", "hsla").replace(")", ",0.12)"),
              }}
            >
              <span className="text-xs font-bold" style={{ color: block.color }}>{block.name}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 h-16 rounded-xl border-2 border-dashed border-[hsl(0,0%,20%)] flex items-center justify-center">
          <span className="text-xs text-[hsl(0,0%,30%)]">여기에 블록을 드래그하여 미니앱 조합</span>
        </div>
      </div>

      {/* Expandable scenario preview */}
      <div className="p-6 rounded-2xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,4%)]">
        <p className="text-xs text-[hsl(0,0%,40%)] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-display)]">확장형 시나리오 프리뷰</p>
        <div className="rounded-xl border border-[hsl(0,0%,18%)] bg-[hsl(0,0%,7%)] overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm font-bold text-[hsl(0,0%,90%)]">출석체크 리워드</p>
                <p className="text-xs text-[hsl(0,0%,45%)]">클릭하면 블록 조합 시각화</p>
              </div>
            </div>
            <span className="text-[hsl(0,0%,30%)]">▾</span>
          </div>
          <div className="border-t border-[hsl(0,0%,15%)] p-4 bg-[hsl(0,0%,5%)]">
            <div className="flex gap-2 items-center">
              <div className="px-2.5 py-1 rounded-lg bg-[hsl(160,84%,39%,0.15)] text-[hsl(160,84%,39%)] text-xs font-bold">login</div>
              <span className="text-[hsl(0,0%,25%)]">→</span>
              <div className="px-2.5 py-1 rounded-lg bg-[hsl(160,84%,39%,0.15)] text-[hsl(160,84%,39%)] text-xs font-bold">storage</div>
              <span className="text-[hsl(0,0%,25%)]">→</span>
              <div className="px-2.5 py-1 rounded-lg bg-[hsl(32,95%,52%,0.15)] text-[hsl(32,95%,52%)] text-xs font-bold">rewarded-ad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Brainstorm Page ─── */
export default function Brainstorm() {
  const [selected, setSelected] = useState<"A" | "B" | "C">("B");

  const directions = {
    A: { label: "Cinematic Scroll", desc: "풀스크린 snap + 가로 타임라인 + Sticky CTA", difficulty: "높음", impact: "매우 높음", Component: DirectionA },
    B: { label: "Editorial Story", desc: "그라데이션 전환 + 지그재그 스텝퍼 + 필터 탭 + 중간 CTA", difficulty: "중간", impact: "높음", Component: DirectionB },
    C: { label: "Interactive Play", desc: "타이핑 히어로 + 레고 드래그 + 확장 프리뷰", difficulty: "매우 높음", impact: "매우 높음", Component: DirectionC },
  };

  const dir = directions[selected];

  return (
    <div className="min-h-screen bg-[hsl(0,0%,0%)] text-[hsl(0,0%,100%)]">
      {/* Header */}
      <header className="border-b border-[hsl(0,0%,12%)] bg-[hsl(0,0%,3%)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-[hsl(0,0%,50%)] font-[family-name:var(--font-display)] tracking-wider uppercase">Visual Brainstorming</h1>
            <p className="text-xs text-[hsl(0,0%,35%)] mt-0.5">루트 페이지 디자인 개선 — 3가지 방향 비교</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[hsl(160,84%,50%)]" />
            <span className="text-xs text-[hsl(160,84%,50%)]">Live</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Direction selector tabs */}
        <div className="flex gap-3 mb-8">
          {(["A", "B", "C"] as const).map((key) => {
            const d = directions[key];
            const isActive = selected === key;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className="flex-1 p-4 rounded-2xl border-2 transition-all text-left"
                style={{
                  borderColor: isActive ? "hsl(0,0%,100%)" : "hsl(0,0%,15%)",
                  background: isActive ? "hsl(0,0%,8%)" : "hsl(0,0%,3%)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: isActive ? "hsl(0,0%,100%)" : "hsl(0,0%,15%)", color: isActive ? "hsl(0,0%,0%)" : "hsl(0,0%,50%)" }}>
                    {key}
                  </span>
                  <span className="text-sm font-bold" style={{ color: isActive ? "hsl(0,0%,100%)" : "hsl(0,0%,50%)" }}>
                    {d.label}
                  </span>
                  {key === "B" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(160,84%,39%,0.2)] text-[hsl(160,84%,50%)] font-bold">추천</span>
                  )}
                </div>
                <p className="text-xs text-[hsl(0,0%,40%)] leading-relaxed">{d.desc}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] text-[hsl(0,0%,35%)]">난이도: <span className="text-[hsl(0,0%,60%)]">{d.difficulty}</span></span>
                  <span className="text-[10px] text-[hsl(0,0%,35%)]">임팩트: <span className="text-[hsl(0,0%,60%)]">{d.impact}</span></span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mockup content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <dir.Component />
          </motion.div>
        </AnimatePresence>

        {/* Decision bar */}
        <div className="mt-8 p-5 rounded-2xl border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,3%)] text-center">
          <p className="text-xs text-[hsl(0,0%,40%)] mb-2">채팅에서 선택하세요</p>
          <p className="text-sm text-[hsl(0,0%,70%)]">
            Direction <span className="text-[hsl(0,0%,100%)] font-bold">{selected}</span> ({dir.label}) 선택 →{" "}
            <span className="text-[hsl(160,84%,50%)]">"Direction {selected}로 진행해줘"</span> 라고 말씀해주세요
          </p>
        </div>
      </div>
    </div>
  );
}
