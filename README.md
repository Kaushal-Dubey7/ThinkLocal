# 🧠 ThinkLocal

> Your AI second brain — 100% private, 100% local. No cloud. No servers. No API keys.

ThinkLocal is a smart note-taking web app powered by AI models running **entirely in your browser** using the [RunAnywhere Web SDK](https://runanywhere.ai). Your thoughts never leave your device.

---

## ✨ Features

- **📝 Smart Notes** — Create, edit, and organize notes with titles, content, and tags
- **✨ AI Summarize** — One-click AI summary of any note using a local LLM
- **🏷️ Auto-Tag** — Automatically generate 3–5 tags for notes using on-device AI
- **🎙️ Voice Input** — Speak your thoughts; local speech-to-text transcribes them instantly
- **💬 AI Chat** — Chat with your notes — ask questions, get insights, all offline
- **🔒 100% Private** — Zero data transmitted. All AI runs via WebAssembly in your browser
- **⚡ Offline First** — Works without internet after the first model download

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| On-device LLM | `@runanywhere/web-llamacpp` (LFM2-350M via llama.cpp WASM) |
| Speech-to-Text | `@runanywhere/web-onnx` (Whisper via sherpa-onnx WASM) |
| Model Storage | OPFS (Origin Private File System) — cached in browser |
| Notes Storage | localStorage |
| SDK Core | `@runanywhere/web` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Chrome 96+ or Edge 96+ (recommended for best performance)

### Installation

```bash
# Clone the repo
git clone https://github.com/Kaushal-Dubey7/private-thought-ai.git
cd private-thought-ai

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

> **Note:** The app must be opened directly (not inside an iframe preview like StackBlitz or CodeSandbox) for full multi-threaded WASM performance.

### First Run

1. Click **"Initialize AI Engine"** on the loading screen
2. The LFM2-350M model (~250MB) downloads once from HuggingFace and is cached in your browser's OPFS storage
3. It never re-downloads on refresh — it's yours permanently

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AIChat.tsx          # Right panel — chat with your notes
│   ├── ModelLoader.tsx     # First-run onboarding + download screen
│   ├── NoteEditor.tsx      # Center panel — write, summarize, tag, voice
│   ├── NotesSidebar.tsx    # Left panel — notes list
│   └── StatusBar.tsx       # Bottom bar — model status, speed, privacy badge
├── hooks/
│   ├── useSDK.ts           # SDK initialization + model download state
│   ├── useSTT.ts           # Speech-to-text recording hook
│   └── useTextGen.ts       # Streaming text generation hook
├── lib/
│   └── runanywhere.ts      # SDK init, model catalog, lazy imports
├── pages/
│   └── Index.tsx           # Main app layout
└── store/
    └── notes.ts            # Notes CRUD + localStorage persistence
```

---

## 🧠 AI Models Used

| Model | Size | Purpose | Source |
|---|---|---|---|
| LFM2-350M Q4_K_M | ~250MB | Text generation (summarize, tag, chat) | [LiquidAI/LFM2-350M-GGUF](https://huggingface.co/LiquidAI/LFM2-350M-GGUF) |
| Whisper Tiny | ~150MB | Speech-to-text transcription | sherpa-onnx via RunAnywhere |

All models run via **WebAssembly** — no GPU required, no cloud calls made.

---

## 🔒 Privacy by Architecture

ThinkLocal is built on a simple principle: **if data never leaves the device, it can never be leaked.**

- All AI inference happens inside your browser tab via WASM
- Notes are stored only in your browser's localStorage
- Models are stored only in your browser's OPFS (sandboxed, private)
- No analytics, no telemetry, no backend servers
- Works fully offline after the first model download

You can verify this yourself — open Chrome DevTools → Network tab → watch zero AI requests go out.

---

## ⚙️ Build & Deploy

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Requirements

Your hosting server **must** set these HTTP headers for multi-threaded WASM:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

**Vercel** — add a `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "credentialless" }
      ]
    }
  ]
}
```

**Netlify** — add a `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "credentialless"
```

---

## 🌐 Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 120+ | ✅ Full support (recommended) |
| Edge 120+ | ✅ Full support |
| Firefox 119+ | ✅ Supported (no WebGPU) |
| Safari 17+ | ⚠️ Basic support (limited OPFS) |
| Mobile browsers | ⚠️ Limited (memory constraints) |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 8080 |
| `npm run build` | Production build with WASM assets copied |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |

---

## 🏆 Built For

**HackXtreme** — Problem Statement #1: AI-Powered Productivity Tools

Built using the [RunAnywhere Web SDK](https://docs.runanywhere.ai/web/introduction) to demonstrate that the future of AI is on-device — private, instant, and always available.

---

## 📚 Resources

- [RunAnywhere Docs](https://docs.runanywhere.ai)
- [Web SDK Guide](https://docs.runanywhere.ai/web/introduction)
- [Web Starter App](https://github.com/RunanywhereAI/web-starter-app)
- [RunAnywhere Discord](https://discord.com/invite/N359FBbDVd)

---

## 📄 License

MIT
