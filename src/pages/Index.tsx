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
  ArrowRight,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ─── Data Constants ─── */

type Category = "env" | "auth" | "ads" | "viral" | "media" | "ui";

interface SDKBlock {
  name: string;
  dir: string;
  api: string;
  category: Category;
  size?: "lg" | "wide";
}

const CATEGORY_META: Record<
  Category,
  { label: string; icon: React.ReactNode; colorClass: string; bgClass: string; dotClass: string }
> = {
  env: {
    label: "환경 & 플랫폼",
    icon: <Monitor className="h-4 w-4" />,
    colorClass: "text-[hsl(var(--block-env))]",
    bgClass: "bg-[hsl(var(--block-env-bg))] border-[hsl(var(--block-env)/.3)]",
    dotClass: "bg-[hsl(var(--block-env))]",
  },
  auth: {
    label: "인증 & 스토리지",
    icon: <ShieldCheck className="h-4 w-4" />,
    colorClass: "text-[hsl(var(--block-auth))]",
    bgClass: "bg-[hsl(var(--block-auth-bg))] border-[hsl(var(--block-auth)/.3)]",
    dotClass: "bg-[hsl(var(--block-auth))]",
  },
  ads: {
    label: "광고 & 수익화",
    icon: <Megaphone className="h-4 w-4" />,
    colorClass: "text-[hsl(var(--block-ads))]",
    bgClass: "bg-[hsl(var(--block-ads-bg))] border-[hsl(var(--block-ads)/.3)]",
    dotClass: "bg-[hsl(var(--block-ads))]",
  },
  viral: {
    label: "바이럴 & 공유",
    icon: <Share2 className="h-4 w-4" />,
    colorClass: "text-[hsl(var(--block-viral))]",
    bgClass: "bg-[hsl(var(--block-viral-bg))] border-[hsl(var(--block-viral)/.3)]",
    dotClass: "bg-[hsl(var(--block-viral))]",
  },
  media: {
    label: "미디어 & 디바이스",
    icon: <Camera className="h-4 w-4" />,
    colorClass: "text-[hsl(var(--block-media))]",
    bgClass: "bg-[hsl(var(--block-media-bg))] border-[hsl(var(--block-media)/.3)]",
    dotClass: "bg-[hsl(var(--block-media))]",
  },
  ui: {
    label: "UI & 네비게이션",
    icon: <Navigation className="h-4 w-4" />,
    colorClass: "text-[hsl(var(--block-ui))]",
    bgClass: "bg-[hsl(var(--block-ui-bg))] border-[hsl(var(--block-ui)/.3)]",
    dotClass: "bg-[hsl(var(--block-ui))]",
  },
};

const SDK_BLOCKS: SDKBlock[] = [
  // env
  { name: "환경 감지", dir: "with-env-detection", api: "getOperationalEnvironment()", category: "env" },
  { name: "OS 감지", dir: "with-platform-os", api: "getPlatformOS()", category: "env" },
  { name: "네트워크", dir: "with-network-status", api: "getNetworkStatus()", category: "env" },
  { name: "언어/지역", dir: "with-locale", api: "getLocale()", category: "env" },
  // auth
  { name: "토스 로그인", dir: "with-app-login", api: "appLogin()", category: "auth", size: "lg" },
  { name: "스토리지", dir: "with-storage", api: "Storage.*", category: "auth" },
  // ads
  { name: "보상형 광고", dir: "with-rewarded-ad", api: "loadFullScreenAd()", category: "ads", size: "lg" },
  { name: "전면 광고", dir: "with-interstitial-ad", api: "showFullScreenAd()", category: "ads" },
  { name: "배너 광고", dir: "with-banner-ad", api: "TossAds.attachBanner()", category: "ads", size: "wide" },
  { name: "인앱 결제", dir: "with-in-app-purchase", api: "createOneTimePurchaseOrder()", category: "ads" },
  // viral
  { name: "공유 리워드", dir: "with-share-reward", api: "contactsViral()", category: "viral", size: "lg" },
  { name: "연락처 바이럴", dir: "with-contacts-viral", api: "contactsViral()", category: "viral" },
  { name: "딥링크 공유", dir: "with-share-link", api: "getTossShareLink()", category: "viral" },
  { name: "클립보드", dir: "with-clipboard-text", api: "setClipboardText()", category: "viral" },
  // media
  { name: "카메라", dir: "with-camera", api: "openCamera()", category: "media" },
  { name: "앨범 사진", dir: "with-album-photos", api: "fetchAlbumPhotos()", category: "media" },
  { name: "위치 (1회)", dir: "with-location-once", api: "getCurrentLocation()", category: "media" },
  { name: "위치 추적", dir: "with-location-tracking", api: "startUpdateLocation()", category: "media" },
  { name: "햅틱", dir: "with-haptic-feedback", api: "generateHapticFeedback()", category: "media" },
  // ui
  { name: "네비게이션바", dir: "with-navigation-bar", api: "addAccessoryButton()", category: "ui", size: "wide" },
  { name: "뒤로가기", dir: "with-back-event", api: "useBackEvent()", category: "ui" },
  { name: "권한 요청", dir: "with-permission", api: "getPermission()", category: "ui" },
  { name: "푸시 알림", dir: "with-push-notification", api: "REST API", category: "ui" },
];

interface Scenario {
  name: string;
  desc: string;
  blocks: Category[];
}

const SCENARIOS: Scenario[] = [
  { name: "출석체크 리워드", desc: "출석 + 보상형 광고 + 캘린더", blocks: ["auth", "ads", "ads"] },
  { name: "복권 뽑기", desc: "복권 + 광고 + 프로모션 리워드", blocks: ["ads", "viral"] },
  { name: "미션 시스템", desc: "미션 + 진행도 + 보상 수령", blocks: ["auth", "ads"] },
  { name: "공유 바이럴", desc: "공유 + 일일 제한 + 리워드", blocks: ["viral", "auth"] },
  { name: "마일스톤 출금", desc: "마일스톤 + 포인트 출금", blocks: ["auth", "ads"] },
  { name: "온보딩 코치", desc: "온보딩 + 코치마크 오버레이", blocks: ["auth", "env"] },
];

interface Skill {
  name: string;
  trigger: string;
}

const SKILLS: Skill[] = [
  { name: "appintoss-login", trigger: "로그인, 인증" },
  { name: "appintoss-rewarded-ad", trigger: "보상형 광고" },
  { name: "appintoss-banner-ad", trigger: "배너 광고" },
  { name: "appintoss-promotion-reward", trigger: "리워드, 포인트" },
  { name: "appintoss-nongame-launch-checklist", trigger: "출시, 검수" },
  { name: "appintoss-smart-message", trigger: "푸시, 메시지" },
  { name: "appintoss-tds-mobile", trigger: "TDS, 디자인" },
];

const DOC_LINKS = [
  { label: "SDK Overview", url: "https://developers-apps-in-toss.toss.im/llms.txt" },
  { label: "광고 가이드", url: "https://developers-apps-in-toss.toss.im/ads/develop.html" },
  { label: "프로모션", url: "https://developers-apps-in-toss.toss.im/promotion/develop.html" },
  { label: "로그인", url: "https://developers-apps-in-toss.toss.im/login/develop.html" },
  { label: "TDS Mobile", url: "https://tossmini-docs.toss.im/tds-mobile" },
];

const TECH_STACK = ["Vite 6", "React 19", "TypeScript", "Tailwind CSS", "shadcn-ui", "SDK 2.0.1"];

/* ─── Components ─── */

function BlockCard({ block }: { block: SDKBlock }) {
  const meta = CATEGORY_META[block.category];
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-3 transition-all hover:scale-[1.02] hover:shadow-md ${meta.bgClass} ${
        block.size === "lg" ? "sm:col-span-2 sm:row-span-2" : block.size === "wide" ? "sm:col-span-2" : ""
      }`}
    >
      <div className={`mb-1 flex items-center gap-1.5 ${meta.colorClass}`}>
        {meta.icon}
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{meta.label}</span>
      </div>
      <p className={`text-base font-bold ${meta.colorClass}`}>{block.name}</p>
      <code className="mt-1 block text-[11px] font-mono opacity-60 truncate">{block.api}</code>
      {block.size === "lg" && (
        <div className="mt-2 text-xs opacity-50">📁 {block.dir}</div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const uniqueBlocks = [...new Set(scenario.blocks)];
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {uniqueBlocks.map((cat, i) => (
            <span key={i} className={`h-3 w-3 rounded-full ${CATEGORY_META[cat].dotClass}`} />
          ))}
        </div>
        <h4 className="text-sm font-bold text-foreground">{scenario.name}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{scenario.desc}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */

const Index = () => {
  const groupedBlocks: Record<Category, SDKBlock[]> = { env: [], auth: [], ads: [], viral: [], media: [], ui: [] };
  SDK_BLOCKS.forEach((b) => groupedBlocks[b.category].push(b));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 pt-12 pb-8 text-center sm:pt-20 sm:pb-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Blocks className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            AppsInToss Fullstack Templates
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            레고 조립하듯 필요한 SDK 블록만 골라 붙여
            <br className="hidden sm:block" /> 토스 미니앱을 만든다
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {TECH_STACK.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs font-medium">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { step: "1", icon: <Rocket className="h-5 w-5" />, title: "Boilerplate", desc: "UI 기반 틀을 잡는다" },
            { step: "2", icon: <Puzzle className="h-5 w-5" />, title: "SDK 블록 조합", desc: "필요한 기능을 끼운다" },
            { step: "3", icon: <Layers className="h-5 w-5" />, title: "시나리오 참고", desc: "풀스택 패턴을 따른다" },
          ].map((item, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {i < 2 && (
                  <ArrowRight className="absolute right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground/40 sm:block" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-4xl" />

      {/* SDK Block Map — Bento Grid */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">SDK 블록 카탈로그</h2>
          <Badge variant="outline" className="ml-auto text-xs">{SDK_BLOCKS.length}개</Badge>
        </div>

        {(Object.keys(groupedBlocks) as Category[]).map((cat) => {
          const blocks = groupedBlocks[cat];
          if (blocks.length === 0) return null;
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} className="mb-6">
              <div className={`mb-2 flex items-center gap-1.5 ${meta.colorClass}`}>
                {meta.icon}
                <span className="text-sm font-semibold">{meta.label}</span>
                <span className="text-xs opacity-50">({blocks.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {blocks.map((b) => (
                  <BlockCard key={b.dir} block={b} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Separator className="mx-auto max-w-4xl" />

      {/* Scenarios */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">풀스택 시나리오</h2>
          <Badge variant="outline" className="ml-auto text-xs">{SCENARIOS.length}개</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.name} scenario={s} />
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-4xl" />

      {/* AI Skills */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">AI 스킬</h2>
          <Badge variant="outline" className="ml-auto text-xs">{SKILLS.length}개</Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SKILLS.map((sk) => (
            <div
              key={sk.name}
              className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <code className="text-sm font-mono text-foreground">/{sk.name}</code>
              </div>
              <Badge variant="secondary" className="text-[10px]">{sk.trigger}</Badge>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-4xl" />

      {/* Footer */}
      <footer className="mx-auto max-w-4xl px-4 py-10">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">📎 공식 문서</h3>
        <div className="flex flex-wrap gap-2">
          {DOC_LINKS.map((d) => (
            <a
              key={d.label}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
            >
              {d.label}
              <ExternalLink className="h-3 w-3 opacity-40" />
            </a>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          이 페이지는 프로젝트 소개용입니다. 실제 미니앱 개발 시 교체하세요.
        </p>
      </footer>
    </div>
  );
};

export default Index;
