# Piano Quotidien

> *Tracker de pratique — 30 minutes par jour*

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Mobile--First-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Service--Worker-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## A quoi ca sert ?

**Piano Quotidien** est une application web progressive (PWA) conçue pour aider les pianistes à maintenir une pratique régulière de **30 minutes par jour**. Elle offre un minuteur de séance, un suivi visuel par calendrier et des statistiques de progression.

---

## Caractéristiques

- **Minuteur 30 min** — démarrage, pause, réinitialisation avec barre de progression
- **Calendrier mensuel** — visualisation des jours joués, navigation mois par mois
- **Statistiques** — série en cours, total des séances, séances du mois
- **Thème clair / sombre** — détection automatique du système + cookie persistant (zéro flash)
- **Mobile-first** — touch targets 44px, safe-area insets, optimisé iOS & Android
- **Hors-ligne** — service worker avec stratégies cache-first / network-first
- **Persistance serveur** — sessions stockées dans `data/sessions.json` via API REST
- **Cookies HTTP** — thème lu côté serveur pour un rendu sans flash dès le premier octet

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 App Router |
| UI | React 18 — composants serveur + client |
| Langage | TypeScript 5.9 strict |
| Styles | CSS3 mobile-first, variables CSS, `@media (hover: hover)` |
| Persistance | Fichier JSON côté serveur (`fs` Node.js) |
| PWA | Service Worker + Web App Manifest |
| Cookies | `next/headers` côté serveur, `document.cookie` côté client |
| Icônes | SVG + `ImageResponse` Next.js (PNG 32x32, 180x180) |

---

## Structure du projet

```
piano-tracker/
│
├── app/                          # App Router Next.js
│   ├── layout.tsx                # Root layout — cookie thème + SW registrar
│   ├── page.tsx                  # Server Component — charge sessions + thème
│   ├── globals.css               # Styles globaux mobile-first
│   ├── icon.tsx                  # Favicon PNG 32x32 (généré)
│   ├── apple-icon.tsx            # Apple touch icon 180x180 (généré)
│   ├── manifest.ts               # Web App Manifest PWA
│   └── api/
│       └── sessions/
│           ├── route.ts          # GET  /api/sessions
│           └── [date]/
│               └── route.ts      # POST /api/sessions/:date
│                                 # DELETE /api/sessions/:date
│
├── components/
│   ├── PianoTracker.tsx          # Client Component principal (hooks + UI)
│   └── ServiceWorkerRegistrar.tsx# Enregistrement du service worker
│
├── lib/
│   └── sessions-store.ts         # Lecture / écriture sessions.json
│
├── public/
│   ├── favicon/
│   │   └── icon.svg              # Icône SVG piano (toutes résolutions)
│   └── sw.js                     # Service Worker
│
├── data/                         # Créé automatiquement au runtime
│   └── sessions.json             # Dates des séances jouées (gitignored)
│
├── .gitignore
├── next.config.js                # Headers service worker
├── package.json
└── tsconfig.json
```

---

## API REST

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/sessions` | Retourne toutes les dates jouées |
| `POST` | `/api/sessions/YYYY-MM-DD` | Marque une date comme jouée |
| `DELETE` | `/api/sessions/YYYY-MM-DD` | Retire une date |

---

## Installation & démarrage

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev
# → http://localhost:3000

# Build de production
npm run build
npm run start
```

---

## Service Worker — stratégies de cache

| Requête | Stratégie |
|---|---|
| `/api/*` | Network-first → fallback cache (données fraîches) |
| `/_next/static/*` | Cache-first (assets immutables versionnés) |
| Navigation HTML | Network-first → fallback offline |
| Reste | Stale-while-revalidate |

---

<div align="center">

© **Giusmili product** — 2026

*Fait avec Next.js & passion du piano*

</div>
