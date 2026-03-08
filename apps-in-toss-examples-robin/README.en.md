# AppsInToss Examples (Robin Edition)

[![SDK](https://img.shields.io/badge/SDK-2.0.1-blue)](https://developers-apps-in-toss.toss.im)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![Examples](https://img.shields.io/badge/Examples-29-orange)](./)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)

> Production-quality WebView mini-app examples for the AppsInToss (Toss) platform, based on SDK 2.0.1.

[한국어 README](./README.md)

## Why This Project?

The [official examples](https://github.com/toss/apps-in-toss-examples) use SDK 1.5~1.6 with basic patterns. This project provides:

- **SDK 2.0.1** — Latest APIs (IntegratedAd v2, TossAds banner, etc.)
- **Production patterns** — Error handling, retry logic, type safety
- **Real-world scenarios** — Fullstack examples with server (Express + SQLite)
- **Modern stack** — React 19, Tailwind CSS 4, Zustand 5

## Quick Start

```bash
# Single-feature example
cd with-rewarded-ad && npm install && npm run dev

# Fullstack scenario
cd scenario-attendance-reward && npm run install:all && npm run dev
```

## Examples

### Single-Feature (23)
See [Korean README](./README.md) for full list.

### Fullstack Scenarios (6)
| Example | Description | SDK APIs |
|---------|-------------|----------|
| scenario-attendance-reward | Attendance + Rewarded Ad | loadFullScreenAd, Storage |
| scenario-lottery-reward | Lottery + Ad + Promotion | loadFullScreenAd, executePromotion |
| scenario-mission-system | Missions + Rewards | Storage, executePromotion |
| scenario-share-viral | Share Viral + Rewards | contactsViral, Storage |
| scenario-milestone-withdraw | Milestones + Withdraw | Storage, executePromotion |
| scenario-onboarding-coach | Onboarding + Coach Marks | Storage, getOperationalEnvironment |

## License
MIT
