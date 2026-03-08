import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Blocks, Rocket, Puzzle, Layers, Monitor, ShieldCheck,
  Megaphone, Share2, Camera, Navigation, Sparkles,
  ExternalLink, Zap, BookOpen, ArrowDown, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─── Types & Data ─── */

type Category = "env" | "auth" | "ads" | "viral" | "media" | "ui";

interface SDKBlock {
  name: string;
  dir: string;
  api: string;
  category: Category;
  size?: "lg" | "wide" | "tall";
}

const CAT: Record<Category, {
  label: string; icon: React.ReactNode;
  fg: string; bg: string; dot: string; glow: string; border: string;
}> = {
  env: {
    label: "환경 & 플랫폼",
    icon: <Monitor className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-env))]",
    bg: "bg-[hsl(var(--block-env-bg))]",
    dot: "bg-[hsl(var(--block-env))]",
    glow: "shadow-[0_0_30px_hsl(var(--block-env)/.18)]",
    border: "border-[hsl(var(--block-env)/.25)]",
  },
  auth: {
    label: "인증 & 스토리지",
    icon: <ShieldCheck className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-auth))]",
    bg: "bg-[hsl(var(--block-auth-bg))]",
    dot: "bg-[hsl(var(--block-auth))]",
    glow: "shadow-[0_0_30px_hsl(var(--block-auth)/.18)]",
    border: "border-[hsl(var(--block-auth)/.25)]",
  },
  ads: {
    label: "광고 & 수익화",
    icon: <Megaphone className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-ads))]",
    bg: "bg-[hsl(var(--block-ads-bg))]",
    dot: "bg-[hsl(var(--block-ads))]",
    glow: "shadow-[0_0_30px_hsl(var(--block-ads)/.18)]",
    border: "border-[hsl(var(--block-ads)/.25)]",
  },
  viral: {
    label: "바이럴 & 공유",
    icon: <Share2 className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-viral))]",
    bg: "bg-[hsl(var(--block-viral-bg))]",
    dot: "bg-[hsl(var(--block-viral))]",
    glow: "shadow-[0_0_30px_hsl(var(--block-viral)/.18)]",
    border: "border-[hsl(var(--block-viral)/.25)]",
  },
  media: {
    label: "미디어 & 디바이스",
    icon: <Camera className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-media))]",
    bg: "bg-[hsl(var(--block-media-bg))]",
    dot: "bg-[hsl(var(--block-media))]",
    glow: "shadow-[0_0_30px_hsl(var(--block-media)/.18)]",
    border: "border-[hsl(var(--block-media)/.25)]",
  },
  ui: {
    label: "UI & 네비게이션",
    icon: <Navigation className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-ui))]",
    bg: "bg-[hsl(var(--block-ui-bg))]",
    dot: "bg-[hsl(var(--block-ui))]",
    glow: "shadow-[0_0_30px_hsl(var(--block-ui)/.18)]",
    border: "border-[hsl(var(--block-ui)/.25)]",
  },
};

const SDK_BLOCKS: SDKBlock[] = [
  { name: "토스 로그인", dir: "with-app-login", api: "appLogin()", category: "auth", size: "lg" },
  { name: "보상형 광고", dir: "with-rewarded-ad", api: "loadFullScreenAd()", category: "ads", size: "tall" },
  { name: "환경 감지", dir: "with-env-detection", api: "getOperationalEnvironment()", category: "env" },
  { name: "OS 감지", dir: "with-platform-os", api: "getPlatformOS()", category: "env" },
  { name: "공유 리워드", dir: "with-share-reward", api: "contactsViral()", category: "viral", size: "wide" },
  { name: "스토리지", dir: "with-storage", api: "Storage.*", category: "auth" },
  { name: "전면 광고", dir: "with-interstitial-ad", api: "showFullScreenAd()", category: "ads" },
  { name: "배너 광고", dir: "with-banner-ad", api: "TossAds.attachBanner()", category: "ads", size: "wide" },
  { name: "네트워크", dir: "with-network-status", api: "getNetworkStatus()", category: "env" },
  { name: "언어/지역", dir: "with-locale", api: "getLocale()", category: "env" },
  { name: "인앱 결제", dir: "with-in-app-purchase", api: "createOneTimePurchaseOrder()", category: "ads" },
  { name: "연락처 바이럴", dir: "with-contacts-viral", api: "contactsViral()", category: "viral" },
  { name: "딥링크 공유", dir: "with-share-link", api: "getTossShareLink()", category: "viral" },
  { name: "클립보드", dir: "with-clipboard-text", api: "setClipboardText()", category: "viral" },
  { name: "카메라", dir: "with-camera", api: "openCamera()", category: "media" },
  { name: "앨범 사진", dir: "with-album-photos", api: "fetchAlbumPhotos()", category: "media" },
  { name: "위치 (1회)", dir: "with-location-once", api: "getCurrentLocation()", category: "media" },
  { name: "위치 추적", dir: "with-location-tracking", api: "startUpdateLocation()", category: "media" },
  { name: "햅틱", dir: "with-haptic-feedback", api: "generateHapticFeedback()", category: "media" },
  { name: "네비게이션바", dir: "with-navigation-bar", api: "addAccessoryButton()", category: "ui", size: "wide" },
  { name: "뒤로가기", dir: "with-back-event", api: "useBackEvent()", category: "ui" },
  { name: "권한 요청", dir: "with-permission", api: "getPermission()", category: "ui" },
  { name: "푸시 알림", dir: "with-push-notification", api: "REST API", category: "ui" },
];

interface Scenario {
  name: string;
  emoji: string;
  desc: string;
  blocks: Category[];
}

const SCENARIOS: Scenario[] = [
  { name: "출석체크 리워드", emoji: "📅", desc: "출석 + 보상형 광고 + 캘린더", blocks: ["auth", "ads"] },
  { name: "복권 뽑기", emoji: "🎰", desc: "복권 + 광고 + 프로모션 리워드", blocks: ["ads", "viral"] },
  { name: "미션 시스템", emoji: "🎯", desc: "미션 + 진행도 + 보상 수령", blocks: ["auth", "ads"] },
  { name: "공유 바이럴", emoji: "🔗", desc: "공유 + 일일 제한 + 리워드", blocks: ["viral", "auth"] },
  { name: "마일스톤 출금", emoji: "💰", desc: "마일스톤 + 포인트 출금", blocks: ["auth", "ads"] },
  { name: "온보딩 코치", emoji: "🧭", desc: "온보딩 + 코치마크 오버레이", blocks: ["auth", "env"] },
];

const SKILLS = [
  { name: "appintoss-login", trigger: "로그인" },
  { name: "appintoss-rewarded-ad", trigger: "보상형 광고" },
  { name: "appintoss-banner-ad", trigger: "배너 광고" },
  { name: "appintoss-promotion-reward", trigger: "리워드" },
  { name: "appintoss-nongame-launch-checklist", trigger: "출시 검수" },
  { name: "appintoss-smart-message", trigger: "푸시 메시지" },
  { name: "appintoss-tds-mobile", trigger: "TDS 디자인" },
];

const DOC_LINKS = [
  { label: "SDK Overview", url: "https://developers-apps-in-toss.toss.im/llms.txt" },
  { label: "광고 가이드", url: "https://developers-apps-in-toss.toss.im/ads/develop.html" },
  { label: "프로모션", url: "https://developers-apps-in-toss.toss.im/promotion/develop.html" },
  { label: "로그인", url: "https://developers-apps-in-toss.toss.im/login/develop.html" },
  { label: "TDS Mobile", url: "https://tossmini-docs.toss.im/tds-mobile" },
];

/* ─── Animation helpers ─── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Sub-components ─── */

/** Noise overlay for tactile texture */
const NoiseOverlay = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  }} />
);

function BlockCard({ block }: { block: SDKBlock }) {
  const c = CAT[block.category];
  const isLg = block.size === "lg";
  const isWide = block.size === "wide";
  const isTall = block.size === "tall";

  const sizeClass = isLg
    ? "col-span-2 row-span-2"
    : isWide
      ? "col-span-2"
      : isTall
        ? "row-span-2"
        : "";

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
      className={`group relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} ${c.glow} transition-all duration-300 ${sizeClass} ${isLg ? "p-6" : "p-4"}`}
    >
      <NoiseOverlay />

      {/* Decorative gradient corner for featured cards */}
      {(isLg || isTall) && (
        <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-[40px] ${c.dot}`} />
      )}

      <div className={`relative z-10 flex h-full flex-col ${isLg ? "justify-between" : ""}`}>
        <div>
          <div className={`mb-2 flex items-center gap-1.5 ${c.fg}`}>
            {c.icon}
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">{c.label}</span>
          </div>

          <p className={`font-black leading-tight ${c.fg} ${isLg ? "text-2xl" : isWide ? "text-base" : "text-sm"}`}>
            {block.name}
          </p>

          <code className={`mt-2 block font-mono text-foreground/35 truncate ${isLg ? "text-xs" : "text-[10px]"}`}>
            {block.api}
          </code>
        </div>

        {(isLg || isTall) && (
          <div className="mt-4 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/[0.06] px-2.5 py-1">
              <BookOpen className="h-3 w-3 text-foreground/30" />
              <span className="font-mono text-[10px] text-foreground/40">{block.dir}</span>
            </div>
            <ChevronRight className={`h-3.5 w-3.5 ${c.fg} opacity-0 -translate-x-1 transition-all group-hover:opacity-60 group-hover:translate-x-0`} />
          </div>
        )}

        {isLg && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-8 rounded-full ${c.dot} opacity-60`} />
            <span className={`inline-block h-1.5 w-4 rounded-full ${c.dot} opacity-30`} />
            <span className={`inline-block h-1.5 w-2 rounded-full ${c.dot} opacity-15`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const uniqueBlocks = [...new Set(scenario.blocks)];
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 transition-all hover:shadow-xl hover:shadow-primary/5"
    >
      <NoiseOverlay />
      <div className="relative z-10">
        <span className="text-3xl">{scenario.emoji}</span>
        <h4 className="mt-2.5 text-sm font-black text-foreground">{scenario.name}</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{scenario.desc}</p>
        <div className="mt-3 flex items-center gap-2">
          {uniqueBlocks.map((cat, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${CAT[cat].dot} ring-2 ring-background`} />
          ))}
          <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
            {uniqueBlocks.map((c) => CAT[c].label.split(" ")[0]).join(" + ")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ▸ HERO */}
      <Section className="relative px-5 pt-20 pb-14 sm:px-8 sm:pt-32 sm:pb-24">
        {/* Dual gradient orbs */}
        <div className="pointer-events-none absolute top-0 left-1/3 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-30 blur-[120px]"
          style={{ background: `radial-gradient(ellipse, hsl(var(--hero-gradient-from)) 0%, transparent 70%)` }}
        />
        <div className="pointer-events-none absolute top-20 right-0 h-[400px] w-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: `radial-gradient(ellipse, hsl(var(--hero-gradient-to)) 0%, transparent 70%)` }}
        />

        <div className="relative mx-auto max-w-3xl">
          <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
            <Blocks className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">SDK 2.0.1 · Granite 1.0+</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-[2.75rem] font-black tracking-tight text-foreground leading-[1.08] sm:text-[4rem]"
          >
            레고처럼 조립하는
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_ease-in-out_infinite]">
              토스 미니앱
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            <strong className="text-foreground">23</strong>개 SDK 블록과 <strong className="text-foreground">6</strong>개 풀스택 시나리오.
            <br />
            필요한 기능만 골라 붙이면 미니앱이 된다.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-2">
            {["Vite 6", "React 19", "TypeScript", "Tailwind CSS", "shadcn-ui"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-border/50 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground/60 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex justify-center sm:justify-start">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown className="h-5 w-5 text-muted-foreground/30" />
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ▸ WORKFLOW — 3 steps */}
      <Section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
        <motion.h2 variants={fadeUp} className="mb-8 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
          워크플로우
        </motion.h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: <Rocket className="h-6 w-6" />, title: "Boilerplate", desc: "UI 기반 틀을 잡는다", num: "01" },
            { icon: <Puzzle className="h-6 w-6" />, title: "SDK 블록 조합", desc: "필요한 기능을 끼운다", num: "02" },
            { icon: <Layers className="h-6 w-6" />, title: "시나리오 참고", desc: "풀스택 패턴을 따른다", num: "03" },
          ].map((item) => (
            <motion.div
              key={item.num}
              variants={fadeUp}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <NoiseOverlay />
              <span className="absolute top-2 right-3 font-mono text-5xl font-black text-foreground/[0.03] select-none">
                {item.num}
              </span>
              <div className="relative z-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  {item.icon}
                </div>
                <p className="mt-4 text-sm font-black text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ▸ SDK BLOCK MAP — Bento Mosaic */}
      <Section className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <motion.div variants={fadeUp} className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">SDK 블록 카탈로그</h2>
            <p className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
              {SDK_BLOCKS.length}개의 레고 블록
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CAT) as Category[]).map((cat) => (
              <span key={cat} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${CAT[cat].fg} ${CAT[cat].bg} ${CAT[cat].border} border`}>
                <span className={`h-1.5 w-1.5 rounded-full ${CAT[cat].dot}`} />
                {CAT[cat].label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(110px,auto)]"
        >
          {SDK_BLOCKS.map((block) => (
            <BlockCard key={block.dir} block={block} />
          ))}
        </motion.div>
      </Section>

      {/* ▸ SCENARIOS */}
      <Section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
        <motion.div variants={fadeUp} className="mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">풀스택 시나리오</h2>
          <p className="mt-2 text-3xl font-black text-foreground">조합 레시피 {SCENARIOS.length}가지</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.name} scenario={s} />
          ))}
        </div>
      </Section>

      {/* ▸ AI SKILLS */}
      <Section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
        <motion.div variants={fadeUp} className="mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">AI 스킬</h2>
          <p className="mt-2 text-2xl font-black text-foreground">
            <Sparkles className="mr-1.5 inline h-5 w-5 text-primary" />
            슬래시 명령어 {SKILLS.length}개
          </p>
        </motion.div>
        <motion.div variants={stagger} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SKILLS.map((sk) => (
            <motion.div
              key={sk.name}
              variants={fadeUp}
              whileHover={{ x: 6, transition: { duration: 0.15 } }}
              className="group flex items-center justify-between rounded-xl border border-border/40 bg-card px-4 py-3.5 transition-all hover:bg-accent/10 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <code className="text-sm font-bold text-foreground">/{sk.name}</code>
              </div>
              <Badge variant="secondary" className="text-[10px] font-semibold">{sk.trigger}</Badge>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ▸ FOOTER */}
      <footer className="border-t border-border/30 bg-card/30 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">공식 문서</p>
          <div className="flex flex-wrap gap-2.5">
            {DOC_LINKS.map((d) => (
              <a
                key={d.label}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/40 bg-background/80 px-3.5 py-2 text-xs font-semibold text-foreground/70 transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/20"
              >
                {d.label}
                <ExternalLink className="h-3 w-3 opacity-30" />
              </a>
            ))}
          </div>
          <p className="mt-10 text-center text-[11px] text-muted-foreground/40">
            이 페이지는 프로젝트 소개용입니다 · 실제 미니앱 개발 시 교체하세요
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
