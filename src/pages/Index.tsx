import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Github, Globe, User, Menu, X, Search,
  Blocks, Rocket, Puzzle, Layers, Monitor, ShieldCheck,
  Megaphone, Share2, Camera, Navigation, Sparkles,
  ExternalLink, Zap, BookOpen, ChevronRight, ArrowRight,
  LogIn, BarChart3, Gift, ClipboardCheck, MessageSquare, Palette,
  Cog, PlayCircle, CheckCircle2, Bug, FileText, Wand2,
  Brain, Video, Database, Globe2, PenTool, Eye,
} from "lucide-react";
import heroBgShape from "@/assets/hero-bg-shape.png";
import logo from "@/assets/logo.png";

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
  color: string; dot: string;
}> = {
  env: { label: "환경 & 플랫폼", icon: <Monitor className="h-4 w-4" />, color: "hsl(217 91% 60%)", dot: "bg-[hsl(217_91%_60%)]" },
  auth: { label: "인증 & 스토리지", icon: <ShieldCheck className="h-4 w-4" />, color: "hsl(160 84% 39%)", dot: "bg-[hsl(160_84%_39%)]" },
  ads: { label: "광고 & 수익화", icon: <Megaphone className="h-4 w-4" />, color: "hsl(32 95% 52%)", dot: "bg-[hsl(32_95%_52%)]" },
  viral: { label: "바이럴 & 공유", icon: <Share2 className="h-4 w-4" />, color: "hsl(340 82% 58%)", dot: "bg-[hsl(340_82%_58%)]" },
  media: { label: "미디어 & 디바이스", icon: <Camera className="h-4 w-4" />, color: "hsl(270 76% 56%)", dot: "bg-[hsl(270_76%_56%)]" },
  ui: { label: "UI & 네비게이션", icon: <Navigation className="h-4 w-4" />, color: "hsl(186 94% 41%)", dot: "bg-[hsl(186_94%_41%)]" },
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

type SkillCategory = "sdk" | "harness" | "superpower";

const SKILL_CAT: Record<SkillCategory, { label: string; color: string; dot: string }> = {
  sdk: { label: "앱인토스 SDK", color: "hsl(217 91% 60%)", dot: "bg-[hsl(217_91%_60%)]" },
  harness: { label: "Harness 워크플로우", color: "hsl(160 84% 39%)", dot: "bg-[hsl(160_84%_39%)]" },
  superpower: { label: "범용 Superpowers", color: "hsl(270 76% 56%)", dot: "bg-[hsl(270_76%_56%)]" },
};

interface Skill {
  name: string;
  trigger: string;
  desc: string;
  cat: SkillCategory;
  icon: React.ReactNode;
}

const SKILLS: Skill[] = [
  // SDK (9개)
  { name: "appintoss-login", trigger: "로그인", desc: "OAuth2, mTLS, JWT", cat: "sdk", icon: <LogIn className="h-3.5 w-3.5" /> },
  { name: "appintoss-rewarded-ad", trigger: "보상형 광고", desc: "AdMob 연동", cat: "sdk", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { name: "appintoss-banner-ad", trigger: "배너 광고", desc: "TossAds v2", cat: "sdk", icon: <Megaphone className="h-3.5 w-3.5" /> },
  { name: "appintoss-promotion-reward", trigger: "리워드", desc: "토스포인트 지급", cat: "sdk", icon: <Gift className="h-3.5 w-3.5" /> },
  { name: "appintoss-nongame-launch-checklist", trigger: "출시 검수", desc: "11단계 체크리스트", cat: "sdk", icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
  { name: "appintoss-smart-message", trigger: "푸시 메시지", desc: "마케팅 소재 생성", cat: "sdk", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { name: "appintoss-tds-mobile", trigger: "TDS 디자인", desc: "비게임 필수", cat: "sdk", icon: <Palette className="h-3.5 w-3.5" /> },
  { name: "appintoss-coachmark-tutorial", trigger: "온보딩", desc: "코치마크 · 튜토리얼", cat: "sdk", icon: <Eye className="h-3.5 w-3.5" /> },
  { name: "appintoss-docs", trigger: "SDK 레퍼런스", desc: "전체 API 문서", cat: "sdk", icon: <BookOpen className="h-3.5 w-3.5" /> },
  // Harness (4개)
  { name: "harness-workflow", trigger: "워크플로우", desc: "7단계 마스터", cat: "harness", icon: <Cog className="h-3.5 w-3.5" /> },
  { name: "harness-init", trigger: "초기화", desc: "반려방지 세팅", cat: "harness", icon: <PlayCircle className="h-3.5 w-3.5" /> },
  { name: "harness-progress", trigger: "진행상황", desc: "점진적 구현", cat: "harness", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { name: "harness-validate", trigger: "검증", desc: "NEVER/ALWAYS 체크", cat: "harness", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  // Superpowers (10개)
  { name: "superpower-brainstorming", trigger: "브레인스토밍", desc: "아이디어 → 디자인", cat: "superpower", icon: <Brain className="h-3.5 w-3.5" /> },
  { name: "superpower-writing-plans", trigger: "계획 수립", desc: "구현 플랜 작성", cat: "superpower", icon: <FileText className="h-3.5 w-3.5" /> },
  { name: "superpower-executing-plans", trigger: "계획 실행", desc: "배치별 실행·리뷰", cat: "superpower", icon: <Rocket className="h-3.5 w-3.5" /> },
  { name: "superpower-systematic-debugging", trigger: "디버깅", desc: "체계적 근본원인 분석", cat: "superpower", icon: <Bug className="h-3.5 w-3.5" /> },
  { name: "frontend-design", trigger: "프론트엔드", desc: "프로덕션급 UI 생성", cat: "superpower", icon: <Wand2 className="h-3.5 w-3.5" /> },
  { name: "web-design-guidelines", trigger: "UI 감사", desc: "웹 인터페이스 가이드라인", cat: "superpower", icon: <PenTool className="h-3.5 w-3.5" /> },
  { name: "remotion-best-practices", trigger: "Remotion", desc: "React 비디오 생성", cat: "superpower", icon: <Video className="h-3.5 w-3.5" /> },
  { name: "supabase-postgres-best-practices", trigger: "Postgres", desc: "DB 성능 최적화", cat: "superpower", icon: <Database className="h-3.5 w-3.5" /> },
  { name: "vercel-react-best-practices", trigger: "React", desc: "성능 최적화 패턴", cat: "superpower", icon: <Globe2 className="h-3.5 w-3.5" /> },
  { name: "prompt-engineering-patterns", trigger: "프롬프트", desc: "LLM 프롬프트 패턴", cat: "superpower", icon: <Sparkles className="h-3.5 w-3.5" /> },
];

const DOC_LINKS = [
  { label: "개발자 센터", url: "https://developers-apps-in-toss.toss.im" },
  { label: "SDK Overview", url: "https://developers-apps-in-toss.toss.im/llms.txt" },
  { label: "SDK Full Docs", url: "https://developers-apps-in-toss.toss.im/llms-full.txt" },
  { label: "광고 가이드", url: "https://developers-apps-in-toss.toss.im/ads/develop.html" },
  { label: "프로모션", url: "https://developers-apps-in-toss.toss.im/promotion/develop.html" },
  { label: "로그인", url: "https://developers-apps-in-toss.toss.im/login/develop.html" },
  { label: "공유리워드", url: "https://developers-apps-in-toss.toss.im/bedrock/reference/framework/친구초대/contactsViral.html" },
  { label: "인앱결제", url: "https://developers-apps-in-toss.toss.im/bedrock/reference/framework/인앱결제/IAP.html" },
  { label: "권한", url: "https://developers-apps-in-toss.toss.im/bedrock/reference/framework/권한/permission.html" },
  { label: "네비게이션바", url: "https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.html" },
  { label: "TDS Mobile", url: "https://tossmini-docs.toss.im/tds-mobile" },
];

/* ─── Animation helpers ─── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} id={id} initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.section>
  );
}

/* ─── Product Pin (SDK block floating callout) ─── */

function SDKPin({ block, position, direction = "right" }: {
  block: { name: string; api: string };
  position: string;
  direction?: "left" | "right";
}) {
  const content = (
    <div>
      <p className="text-primary-foreground text-sm tracking-[0.15em] font-medium">{block.name}</p>
      <p className="text-primary-foreground/60 text-sm mt-0.5 font-mono">{block.api}</p>
    </div>
  );
  const line = <div className="w-16 h-px bg-primary-foreground/30" />;
  const circle = <div className="w-2.5 h-2.5 rounded-full border-2 border-primary-foreground/50 animate-[pulse-dot_2s_ease-in-out_infinite]" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className={`hidden md:flex absolute items-center gap-3 z-10 ${position}`}
    >
      {direction === "left" ? <>{content}{line}{circle}</> : <>{circle}{line}{content}</>}
    </motion.div>
  );
}

/* ─── Block Card ─── */

function BlockCard({ block }: { block: SDKBlock }) {
  const c = CAT[block.category];
  const isLg = block.size === "lg";
  const isWide = block.size === "wide";
  const isTall = block.size === "tall";

  const sizeClass = isLg ? "col-span-2 row-span-2" : isWide ? "col-span-2" : isTall ? "row-span-2" : "";

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 ${sizeClass} ${isLg ? "p-6" : "p-4"}`}
      style={{ boxShadow: `0 0 30px ${c.color.replace("hsl", "hsla").replace(")", " / 0.1)")}` }}
    >
      {(isLg || isTall) && (
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-15 blur-[40px]" style={{ background: c.color }} />
      )}

      <div className={`relative z-10 flex h-full flex-col ${isLg ? "justify-between" : ""}`}>
        <div>
          <div className="mb-2 flex items-center gap-1.5" style={{ color: c.color }}>
            {c.icon}
            <span className="text-xst-bold uppercase tracking-[0.15em] opacity-70">{c.label}</span>
          </div>

          <p className={`font-black leading-tight ${isLg ? "text-2xl" : isWide ? "text-base" : "text-sm"}`} style={{ color: c.color }}>
            {block.name}
          </p>

          <code className={`mt"mt-2 block font-mono text-xs text-foreground/25 truncate"          {block.api}
          </code>
        </div>

        {(isLg || isTall) && (
          <div className="mt-4 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/[0.06] px-2.5 py-1">
              <BookOpen className="h-3 w-3 text-foreground/25" />
              <span className="font-mono text-[10px] text-foreground/30">{block.dir}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-40 group-hover:translate-x-0" style={{ color: c.color }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Scenario Card ─── */

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const uniqueBlocks = [...new Set(scenario.blocks)];
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/20"
    >
      <div className="relative z-10">
        <span className="text-3xl">{scenario.emoji}</span>
        <h4 className="mt-2.5 text-sm font-black text-foreground font-[family-name:var(--font-display)]">{scenario.name}</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{scenario.desc}</p>
        <div className="mt-3 flex items-center gap-2">
          {uniqueBlocks.map((cat, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${CAT[cat].dot} ring-2 ring-background`} />
          ))}
          <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
            {uniqueBlocks.map((ct) => CAT[ct].label.split(" ")[0]).join(" + ")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ▸ HERO — Full-screen video with masked background */}
      <section className="relative h-screen overflow-hidden" style={{ backgroundColor: 'hsl(0 0% 100%)' }}>
        {/* Masked video layer */}
        <div
          className="absolute inset-0 md:ml-[4px] z-0 hero-mask"
          style={{ '--hero-mask': `url(${heroBgShape})` } as React.CSSProperties}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260303_175853_da9ead9c-0e05-40d9-b9bd-06a9b5a73d27.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* UI content layer */}
        <div className="relative w-full h-full z-10">
          {/* Navigation */}
          <nav className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-4 pt-4 md:px-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-primary rounded-full w-12 h-12 md:w-[5.5rem] md:h-[5.5rem] flex items-center justify-center"
            >
              <img src={logo} alt="Logo" className="h-6 md:h-10 object-contain" />
            </motion.div>

            {/* Desktop nav */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden md:flex items-center gap-3 -mt-1 -mr-2"
            >
              <a href="https://github.com/user/apps-in-toss-fullstack-templates" target="_blank" rel="noopener noreferrer" className="bg-primary rounded-full w-[5.5rem] h-[5.5rem] flex items-center justify-center text-primary-foreground hover:bg-secondary transition-colors">
                <Github className="w-7 h-7" />
              </a>
              <a href="https://developers-apps-in-toss.toss.im" target="_blank" rel="noopener noreferrer" className="bg-primary rounded-full w-[5.5rem] h-[5.5rem] flex items-center justify-center text-primary-foreground hover:bg-secondary transition-colors">
                <Globe className="w-7 h-7" />
              </a>
              <a href="https://www.threads.com/@robin_just_ship_it" target="_blank" rel="noopener noreferrer" className="bg-primary rounded-full flex items-center gap-4 pl-2 pr-7 text-primary-foreground h-[5.5rem] hover:opacity-80 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-primary-foreground flex items-center justify-center text-primary">
                  <User className="w-7 h-7" />
                </div>
                <span className="text-lg font-medium tracking-wide">Contact</span>
              </a>
            </motion.div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden bg-primary rounded-full w-12 h-12 flex items-center justify-center text-primary-foreground"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile menu */}
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden absolute top-20 left-4 right-4 z-30 bg-primary rounded-2xl p-4 flex flex-col gap-3"
            >
              {[
                { icon: <Github className="w-5 h-5" />, label: "GitHub", href: "https://github.com/user/apps-in-toss-fullstack-templates" },
                { icon: <Globe className="w-5 h-5" />, label: "개발자 센터", href: "https://developers-apps-in-toss.toss.im" },
                { icon: <User className="w-5 h-5" />, label: "Contact", href: "https://www.threads.com/@robin_just_ship_it" },
              ].map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-primary-foreground py-3 px-4 hover:bg-primary-foreground/10 rounded-xl transition-colors">
                  {item.icon} <span className="tracking-wide">{item.label}</span>
                </a>
              ))}
            </motion.div>
          )}

          {/* SDK Floating Pins (desktop only) */}
          <SDKPin
            block={{ name: "SDK 2.0.1", api: "Granite 1.0+" }}
            position="left-[8%] top-[18%]"
            direction="left"
          />
          <SDKPin
            block={{ name: "23 BLOCKS", api: "with-*" }}
            position="right-[8%] top-[42%]"
            direction="right"
          />
          <SDKPin
            block={{ name: "6 SCENARIOS", api: "scenario-*" }}
            position="right-[8%] top-[58%]"
            direction="right"
          />

          {/* Shop Now button — top right under nav (desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="hidden md:block absolute top-[7.5rem] right-10 z-10"
          >
            <a
              href="https://developers-apps-in-toss.toss.im"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-8 py-4 rounded-full font-[family-name:var(--font-display)] text-sm tracking-[0.15em] uppercase hover:bg-primary-foreground/90 transition-colors"
            >
              Docs
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Hero headline — bottom left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[8%] left-[3%] z-10"
          >
            <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl lg:text-8xl font-normal leading-[0.9] tracking-tight text-primary-foreground uppercase">
              Build<br />
              Mini-Apps,<br />
              Like Lego.
            </h1>
          </motion.div>

          {/* Browse blocks button — bottom right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute bottom-0 right-0 z-10"
          >
            <a
              href="#blocks"
              className="block bg-primary text-primary-foreground rounded-tl-[1.5rem] px-8 py-4 md:px-12 md:py-6 font-[family-name:var(--font-display)] text-base md:text-lg tracking-[0.2em] uppercase hover:bg-secondary transition-colors"
            >
              <span className="md:hidden">Explore</span>
              <span className="hidden md:inline">Explore Blocks</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ▸ HARNESS WORKFLOW — 7 steps */}
      <Section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
        <motion.h2 variants={fadeUp} className="mb-3 text-[10px] font-[family-name:var(--font-display)] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Harness Engineering
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-10 text-lg text-muted-foreground max-w-2xl">
          처음부터 심사 반려 없이 만드는 <span className="text-foreground font-semibold">7단계 구조화 워크플로우</span>
        </motion.p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { icon: <User className="h-5 w-5" />, title: "요구사항", num: "01" },
            { icon: <ShieldCheck className="h-5 w-5" />, title: "초기화", num: "02" },
            { icon: <Puzzle className="h-5 w-5" />, title: "SDK 선택", num: "03" },
            { icon: <Layers className="h-5 w-5" />, title: "TDS 디자인", num: "04" },
            { icon: <Rocket className="h-5 w-5" />, title: "점진적 구현", num: "05" },
            { icon: <Search className="h-5 w-5" />, title: "검증 루프", num: "06" },
            { icon: <Sparkles className="h-5 w-5" />, title: "최종 심사", num: "07" },
          ].map((item) => (
            <motion.div
              key={item.num}
              variants={fadeUp}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-foreground/20"
            >
              <span className="absolute top-1 right-2 font-[family-name:var(--font-display)] text-3xl font-black text-foreground/[0.04] select-none">
                {item.num}
              </span>
              <div className="relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/10 text-foreground transition-colors group-hover:bg-foreground/15">
                  {item.icon}
                </div>
                <p className="mt-3 text-xs font-black text-foreground font-[family-name:var(--font-display)]">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ▸ SDK BLOCK CATALOG */}
      <Section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8" id="blocks">
        <motion.div variants={fadeUp} className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[10px] font-[family-name:var(--font-display)] font-black uppercase tracking-[0.3em] text-muted-foreground">SDK Block Catalog</h2>
            <p className="mt-3 text-3xl font-[family-name:var(--font-display)] font-black text-foreground sm:text-4xl">
              {SDK_BLOCKS.length} Blocks
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CAT) as Category[]).map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border border-border bg-card">
                <span className={`h-1.5 w-1.5 rounded-full ${CAT[cat].dot}`} />
                <span className="text-muted-foreground">{CAT[cat].label}</span>
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
      <Section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <motion.div variants={fadeUp} className="mb-6">
          <h2 className="text-[10px] font-[family-name:var(--font-display)] font-black uppercase tracking-[0.3em] text-muted-foreground">AI Skills</h2>
          <p className="mt-3 text-3xl font-[family-name:var(--font-display)] font-black text-foreground">
            <Sparkles className="mr-2 inline h-5 w-5 text-foreground/50" />
            {SKILLS.length} Commands
          </p>
        </motion.div>

        {/* Category legend */}
        <motion.div variants={fadeUp} className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(SKILL_CAT) as SkillCategory[]).map((cat) => {
            const c = SKILL_CAT[cat];
            const count = SKILLS.filter((s) => s.cat === cat).length;
            return (
              <span key={cat} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border border-border bg-card">
                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                <span className="text-muted-foreground">{c.label}</span>
                <span className="text-muted-foreground/40">({count})</span>
              </span>
            );
          })}
        </motion.div>

        {/* Skills grouped by category */}
        {(Object.keys(SKILL_CAT) as SkillCategory[]).map((cat) => {
          const c = SKILL_CAT[cat];
          const catSkills = SKILLS.filter((s) => s.cat === cat);
          return (
            <div key={cat} className="mb-5 last:mb-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5" style={{ color: c.color }}>
                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                {c.label}
              </p>
              <motion.div variants={stagger} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {catSkills.map((sk) => (
                  <motion.div
                    key={sk.name}
                    variants={fadeUp}
                    whileHover={{ x: 6, transition: { duration: 0.15 } }}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-foreground/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${c.color.replace("hsl", "hsla").replace(")", " / 0.15)")}`, color: c.color }}>
                        {sk.icon}
                      </div>
                      <div className="min-w-0">
                        <code className="text-xs font-bold text-foreground block truncate">/{sk.name}</code>
                        <span className="text-[10px] text-muted-foreground/60">{sk.desc}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full shrink-0 ml-2">{sk.trigger}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </Section>

      {/* ▸ FOOTER */}
      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <p className="mb-6 text-[10px] font-[family-name:var(--font-display)] font-black uppercase tracking-[0.3em] text-muted-foreground">Documentation</p>
          <div className="flex flex-wrap gap-2.5">
            {DOC_LINKS.map((d) => (
              <a
                key={d.label}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground/60 transition-all hover:text-foreground hover:border-foreground/30"
              >
                {d.label}
                <ExternalLink className="h-3 w-3 opacity-30" />
              </a>
            ))}
          </div>
          <p className="mt-12 text-center text-[11px] text-muted-foreground/40 font-[family-name:var(--font-display)] tracking-wider uppercase">
            AppsInToss Fullstack Templates · SDK 2.0.1 · Granite 1.0+ · React 19 · Vite 6
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
