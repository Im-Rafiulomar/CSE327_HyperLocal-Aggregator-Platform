# HyperLocal Aggregator Platform

AI-powered multi-vendor marketplace connecting local shops and online retailers.

- **Frontend**: React + TanStack Start (Vite), TypeScript, Tailwind CSS
- **Backend**: Node.js + Express + MongoDB (Mongoose), JWT auth with refresh-token rotation
- **AI**: shopping assistant, image (visual) product search, voice search, review summarization and fake-review detection

---

## 1. Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 18 or newer | https://nodejs.org (or install via nvm) |
| npm | comes with Node | `bun` also works for the frontend |
| MongoDB | 6 or newer | local install, or a free MongoDB Atlas cluster |

Check your versions:

```bash
node -v
npm -v
mongod --version   # skip if you use MongoDB Atlas
```

---

## 2. Get the code

Unzip the downloaded archive (or clone the repository), then open a terminal in the project folder:

```bash
cd hyperlocal-aggregator
```

Folder layout:

```text
.
├── src/          frontend (React + TanStack Start)
├── server/       backend (Express + MongoDB)
├── public/
└── package.json  frontend scripts
```

---

## 3. Start MongoDB

**Option A — local MongoDB**

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows: start the "MongoDB Server" service, or run mongod.exe
```

Connection string: `mongodb://127.0.0.1:27017/hyperlocal`

**Option B — MongoDB Atlas**

1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → add a user; Network Access → allow your IP.
3. Copy the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/hyperlocal`

---

## 4. Set up the backend

```bash
cd server
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm install
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/hyperlocal

JWT_SECRET=<long random string>
JWT_REFRESH_SECRET=<another long random string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CLIENT_ORIGIN=http://localhost:8080
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Optional — enable real AI features

The assistant, image detection and voice search work with any OpenAI-compatible
gateway (OpenAI, Groq, OpenRouter, Ollama). Add to `server/.env`:

```env
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_VISION_MODEL=gpt-4o-mini
AI_TRANSCRIBE_MODEL=whisper-1
AI_KEY_HEADER=Authorization
```

Without a key the app still runs — the AI services fall back to built-in
rule-based logic (browser Web Speech API for voice, local label matching for images).

### Load demo data

```bash
npm run seed
```

This creates the demo catalogue, sellers, coupons and two accounts:

| Email | Password | Role |
| --- | --- | --- |
| buyer@hyperlocal.test | Password123 | buyer |
| seller@hyperlocal.test | Password123 | seller |

### Run the API

```bash
npm run dev      # nodemon, restarts on change
# or: npm start
```

API is now at **http://localhost:5000** — check http://localhost:5000/api/health

---

## 5. Set up the frontend

Open a **second terminal** in the project root:

```bash
npm install      # or: bun install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev      # or: bun run dev
```

Open **http://localhost:8080**

> If the API is not running, the site still loads using bundled mock data,
> but login, cart, orders and the seller dashboard need the backend.

---

## 6. Try the features

1. **Sign in** with `buyer@hyperlocal.test` / `Password123` → profile, wishlist, orders, rewards.
2. **Sign in** with `seller@hyperlocal.test` / `Password123` → seller dashboard, create a listing, update order status.
3. **Search** — type a query, or use the mic (voice search) and camera (image product detection) buttons in the search bar.
4. **AI assistant** — the floating chat button: try "track my order", "phones under 20000", "compare these".
5. **Product page** — seller comparison, AI review summary, fake-review flags.
6. **Language switch** — English / বাংলা toggle in the header.

---

## 7. Production build

```bash
# frontend
npm run build          # output in .output / dist
npm run preview

# backend
cd server
NODE_ENV=production npm start
```

Set `CLIENT_ORIGIN` in `server/.env` to your deployed frontend URL and point
`VITE_API_URL` at your deployed API before building.

---

## 8. Troubleshooting

| Problem | Fix |
| --- | --- |
| `MONGO_URI is not set` | Create `server/.env` from `.env.example`. |
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB is not running — start it (section 3). |
| CORS error in the browser | `CLIENT_ORIGIN` must match the frontend URL exactly (`http://localhost:8080`). |
| Login works but reload signs you out | The refresh cookie is httpOnly and origin-scoped — use `localhost` (not `127.0.0.1`) on both sides. |
| Port 5000 or 8080 already in use | Change `PORT` in `server/.env`, or stop the other process. |
| Empty catalogue | Run `npm run seed` inside `server/`. |
| Voice/camera not working | Browsers require `localhost` or HTTPS and permission prompts must be allowed. |

---

## 9. Architecture notes

Both layers are class-based and follow SOLID with explicit design patterns:

**Backend (`server/src`)**
- `repositories/` — Repository pattern over Mongoose (`BaseRepository`, `ProductRepository`, …)
- `services/auth/` — `AuthService` + `TokenService` (Dependency Inversion)
- `services/search/` — Strategy pattern (`Text`, `Voice`, `Visual`) behind `SearchService`
- `services/recommendation/` — pluggable `Scorer` rules in `RecommendationEngine` (Open/Closed)
- `services/assistant/` — Chain of Responsibility over intent handlers
- `services/review/` — rule objects behind `ReviewAnalyzer`
- `services/ai/` — `AiProvider` factory with an OpenAI-compatible provider and a null fallback

**Frontend (`src/lib`)**
- `http/HttpClient.ts` — transport only, retries a 401 through refresh
- `http/TokenStore.ts` — singleton access-token store with observers
- `api/repositories.ts` — one repository class per resource
- `api/client.ts` — composition root; `api.ts` is the facade used by components
- `media/` — `VoiceRecorder` and `CameraCapture` strategies for voice/image capture

Full API endpoint reference: [`server/README.md`](server/README.md).
