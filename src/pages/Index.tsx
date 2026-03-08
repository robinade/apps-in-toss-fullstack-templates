import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Blocks,
  Rocket,
  Puzzle,
  Layers,
  Monitor,
  ShieldCheck,
  Megaphone,
  Share2,
  Camera,
  Navigation,
  Sparkles,
  ExternalLink,
  Zap,
  BookOpen,
  ArrowDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─── Types & Data ─── */

type Category = "env" | "auth" | "ads" | "viral" | "media" | "ui";

interface SDKBlock {
  name: string;
  dir: string;
  api: string;
  category: Category;
  /** Bento sizing: lg = 2×2, wide = 2×1, tall = 1×2 */
  size?: "lg" | "wide" | "tall";
}

const CAT: Record<
  Category,
  { label: string; icon: React.ReactNode; fg: string; bg: string; dot: string; glow: string }
> = {
  env: {
    label: "환경 & 플랫폼",
    icon: <Monitor className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-env))]",
    bg: "bg-[hsl(var(--block-env-bg))]",
    dot: "bg-[hsl(var(--block-env))]",
    glow: "shadow-[0_0_20px_hsl(var(--block-env)/.15)]",
  },
  auth: {
    label: "인증 & 스토리지",
    icon: <ShieldCheck className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-auth))]",
    bg: "bg-[hsl(var(--block-auth-bg))]",
    dot: "bg-[hsl(var(--block-auth))]",
    glow: "shadow-[0_0_20px_hsl(var(--block-auth)/.15)]",
  },
  ads: {
    label: "광고 & 수익화",
    icon: <Megaphone className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-ads))]",
    bg: "bg-[hsl(var(--block-ads-bg))]",
    dot: "bg-[hsl(var(--block-ads))]",
    glow: "shadow-[0_0_20px_hsl(var(--block-ads)/.15)]",
  },
  viral: {
    label: "바이럴 & 공유",
    icon: <Share2 className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-viral))]",
    bg: "bg-[hsl(var(--block-viral-bg))]",
    dot: "bg-[hsl(var(--block-viral))]",
    glow: "shadow-[0_0_20px_hsl(var(--block-viral)/.15)]",
  },
  media: {
    label: "미디어 & 디바이스",
    icon: <Camera className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-media))]",
    bg: "bg-[hsl(var(--block-media-bg))]",
    dot: "bg-[hsl(var(--block-media))]",
    glow: "shadow-[0_0_20px_hsl(var(--block-media)/.15)]",
  },
  ui: {
    label: "UI & 네비게이션",
    icon: <Navigation className="h-4 w-4" />,
    fg: "text-[hsl(var(--block-ui))]",
    bg: "bg-[hsl(var(--block-ui-bg))]",
    dot: "bg-[hsl(var(--block-ui))]",
    glow: "shadow-[0_0_20px_hsl(var(--block-ui)/.15)]",
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
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
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

function BlockCard({ block, index }: { block: SDKBlock; index: number }) {
  const c = CAT[block.category];
  const sizeClass =
    block.size === "lg"
      ? "col-span-2 row-span-2"
      : block.size === "wide"
        ? "col-span-2"
        : block.size === "tall"
          ? "row-span-2"
          : "";

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 ${c.bg} ${c.glow} p-4 transition-shadow ${sizeClass}`}
    >
      {/* Subtle noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className={`mb-1.5 flex items-center gap-1.5 ${c.fg}`}>
        {c.icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60">{c.label}</span>
      </div>

      <p className={`font-semibold leading-tight ${c.fg} ${block.size === "lg" ? "text-xl" : "text-sm"}`}>
        {block.name}
      </p>

      <code className="mt-1.5 block font-mono text-[10px] text-foreground/40 truncate">{block.api}</code>

      {(block.size === "lg" || block.size === "tall") && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5">
          <BookOpen className="h-3 w-3 text-foreground/30" />
          <span className="font-mono text-[10px] text-foreground/40">{block.dir}</span>
        </div>
      )}
    </motion.div>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const uniqueBlocks = [...new Set(scenario.blocks)];
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-shadow hover:shadow-lg"
    >
      <span className="text-2xl">{scenario.emoji}</span>
      <h4 className="mt-2 text-sm font-bold text-foreground">{scenario.name}</h4>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{scenario.desc}</p>
      <div className="mt-3 flex items-center gap-1.5">
        {uniqueBlocks.map((cat, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${CAT[cat].dot}`} />
        ))}
        <span className="ml-1 text-[10px] text-muted-foreground">
          {uniqueBlocks.map((c) => CAT[c].label.split(" ")[0]).join(" + ")}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ▸ HERO — Editorial asymmetric layout */}
      <Section className="relative px-5 pt-16 pb-12 sm:px-8 sm:pt-28 sm:pb-20">
        {/* Background gradient orb */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: `radial-gradient(ellipse, hsl(var(--hero-gradient-from)) 0%, hsl(var(--hero-gradient-to)) 50%, transparent 70%)`,
          }}
        />

        <div className="relative mx-auto max-w-3xl">
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1 backdrop-blur-sm">
            <Blocks className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">SDK 2.0.1 · Granite 1.0+</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-black tracking-tight text-foreground sm:text-6xl sm:leading-[1.05]"
          >
            레고처럼 조립하는
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              토스 미니앱
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            23개 SDK 블록과 6개 풀스택 시나리오.
            <br />
            필요한 기능만 골라 붙이면 미니앱이 된다.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
            {["Vite 6", "React 19", "TypeScript", "Tailwind CSS", "shadcn-ui"].map((t) => (
              <span
                key={t}
                className="rounded-md border border-border/50 bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground/70 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 flex justify-center sm:justify-start">
            <ArrowDown className="h-5 w-5 text-muted-foreground/40 animate-bounce" />
          </motion.div>
        </div>
      </Section>

      {/* ▸ WORKFLOW — 3 steps, asymmetric cards */}
      <Section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <motion.h2 variants={fadeUp} className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5"
            >
              <span className="absolute top-3 right-4 font-mono text-4xl font-black text-foreground/[0.04]">
                {item.num}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {item.icon}
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ▸ SDK BLOCK MAP — Bento Mosaic */}
      <Section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
        <motion.div variants={fadeUp} className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">SDK 블록 카탈로그</h2>
            <p className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
              {SDK_BLOCKS.length}개의 레고 블록
            </p>
          </div>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {(Object.keys(CAT) as Category[]).map((cat) => (
              <span key={cat} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${CAT[cat].fg} ${CAT[cat].bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${CAT[cat].dot}`} />
                {CAT[cat].label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Bento Grid — asymmetric, anti-grid composition */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(100px,auto)]"
        >
          {SDK_BLOCKS.map((block, i) => (
            <BlockCard key={block.dir} block={block} index={i} />
          ))}
        </motion.div>
      </Section>

      {/* ▸ SCENARIOS — Editorial card grid */}
      <Section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <motion.div variants={fadeUp} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">풀스택 시나리오</h2>
          <p className="mt-1 text-2xl font-black text-foreground">조합 레시피 {SCENARIOS.length}가지</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.name} scenario={s} />
          ))}
        </div>
      </Section>

      {/* ▸ AI SKILLS */}
      <Section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <motion.div variants={fadeUp} className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">AI 스킬</h2>
          <p className="mt-1 text-xl font-black text-foreground">
            <Sparkles className="mr-1 inline h-5 w-5 text-primary" />
            슬래시 명령어 {SKILLS.length}개
          </p>
        </motion.div>
        <motion.div variants={stagger} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SKILLS.map((sk) => (
            <motion.div
              key={sk.name}
              variants={fadeUp}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3 transition-colors hover:bg-accent/30"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-primary" />
                <code className="text-sm font-semibold text-foreground">/{sk.name}</code>
              </div>
              <Badge variant="secondary" className="text-[10px] font-medium">{sk.trigger}</Badge>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ▸ FOOTER */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">공식 문서</p>
          <div className="flex flex-wrap gap-2">
            {DOC_LINKS.map((d) => (
              <a
                key={d.label}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/30"
              >
                {d.label}
                <ExternalLink className="h-3 w-3 opacity-30" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-[11px] text-muted-foreground/60">
            이 페이지는 프로젝트 소개용입니다 · 실제 미니앱 개발 시 교체하세요
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
