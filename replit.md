# Shadowbound: La Noche Eterna

## Overview
A React-based game application built with Vite, TypeScript, and Tailwind CSS. The app features multiple game views including Arena, Battle, Gacha, Merchant, Profile, Rankings, Reports, Tavern, and Welcome views.

## Tech Stack
- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI Integration**: Google Gemini API (@google/genai)
- **Icons**: Lucide React

## Project Structure
```
.
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── index.html           # HTML template
├── index.css            # Global styles
├── types.ts             # TypeScript type definitions
├── components/
│   ├── Layout/          # Layout components (Sidebar, MobileNav, ViewHeader)
│   ├── UI/              # UI components (GameCard, ItemIcon, ToastSystem, etc.)
│   └── Views/           # View components (ArenaView, BattleView, etc.)
├── data/                # Game data (constants, items)
├── hooks/               # Custom React hooks (useGameState)
├── services/            # Services (eventBus, geminiService)
└── utils/               # Utilities (gameEngine, storage)
```

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build` (outputs to dist/)
- **Preview**: `npm run preview`

## Environment Variables
- `GEMINI_API_KEY`: API key for Google Gemini AI integration (optional)

## Deployment
Configured for static deployment with `npm run build` outputting to the `dist` directory.
