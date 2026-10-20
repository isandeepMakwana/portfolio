export type ProjectAccent = 'violet' | 'cyan' | 'green'

export interface BuiltItem {
  title: string
  text: string
}

export interface Project {
  id: string
  slug: string
  title: string
  shortTitle: string
  meta: string
  accent: ProjectAccent
  description: string
  useCase: string
  howItWorks: string
  role: string
  built: BuiltItem[]
  tech: string[]
}

export const PROJECTS: Project[] = [
  {
    id: '01',
    slug: 'mindpilot',
    title: 'MindPilot — AI Assistant (Ask & Agent modes)',
    shortTitle: 'MindPilot',
    meta: 'Python + Java · LLM / MCP · 2026',
    accent: 'violet',
    description: 'The AI assistant shipped with a new ColorOS release: "Ask" mode answers questions with multiple LLMs, and "Agent" mode completes real tasks by calling partner services as tools.',
    useCase: 'In Ask mode a user asks a question and gets a streamed answer, or compares answers from several models side by side. In Agent mode the user says something like "order a paneer wrap from a nearby place" and the assistant searches restaurants, builds the cart, shows the bill and places the order only after the user confirms.',
    howItWorks: 'Ask mode is a Python FastAPI service that routes each query by intent, calls several LLM providers in parallel and streams the result over Server-Sent Events. Agent mode is a Java Spring Boot gateway that talks to partner tools over the Model Context Protocol (MCP), handles partner OAuth sign-in and keeps the list of allowed tools.',
    role: 'Feature developer on a large multi-team codebase',
    built: [
      { title: 'MCP food-ordering agent', text: 'Prototyped a food-ordering AI agent over MCP in Python: an LLM planner picks the tool and fills its arguments from each tool\'s JSON schema, with a keyword-scored fallback when the model\'s confidence is low.' },
      { title: 'Human-in-the-loop gate', text: 'The agent reviews the cart and itemised bill with the user and refuses to check out without explicit confirmation.' },
      { title: 'OAuth 2.1 + PKCE', text: 'Partner sign-in with expiring token storage, plus query routing that auto-selects the food connector from the user\'s message.' },
      { title: 'Java Agent gateway', text: 'Added MCP prompts and resources APIs, fixed an OAuth service startup dependency cycle, and wrote live OAuth integration tests.' },
      { title: 'Country-level model controls', text: 'Shipped an admin API and UI, plus request middleware that hides blocked LLMs per country, backed by unit tests.' },
    ],
    tech: ['Python', 'FastAPI', 'LLM tool calling', 'MCP', 'OAuth 2.1 / PKCE', 'SSE streaming', 'Java 17', 'Spring Boot', 'MongoDB', 'Redis', 'pytest'],
  },
  {
    id: '02',
    slug: 'flight-alerts',
    title: 'Flight Alerts Cloud',
    shortTitle: 'Flight Alerts',
    meta: 'Python · FastAPI · 2026',
    accent: 'cyan',
    description: 'Cloud backend that tracks a traveller\'s flights and pushes real-time status updates to their phone.',
    useCase: 'A traveller adds a flight from the phone app, a forwarded booking SMS or a booking email. From then on they get a push notification when the flight is delayed, the gate changes, or it is cancelled — without opening an airline app.',
    howItWorks: 'A FastAPI service stores subscriptions in MongoDB, receives signed status callbacks from a third-party flight-data provider and also polls it on a schedule. Real changes are pushed through Firebase Cloud Messaging; Redis holds caches and locks so the service runs safely on several workers and hosts.',
    role: 'Built the first version of the service; core contributor',
    built: [
      { title: 'Service from scratch', text: 'FastAPI app, MongoDB/Redis data model, Docker Compose setup, and the core subscribe, flight-detail and provider-callback APIs.' },
      { title: 'Instant webhook acks', text: 'Moved callback cache invalidation and push delivery into background tasks so provider webhooks are acknowledged immediately.' },
      { title: 'Batch state reads', text: 'Added batch flight-state reads with a short-lived Redis cache, replacing one database round trip per flight when loading a user\'s trips.' },
      { title: 'Distributed lock', text: 'Built SMS-schedule sync guarded by a Redis distributed lock, so only one instance runs it across a multi-worker deployment.' },
      { title: 'Client contract & CI', text: 'Defined a typed error model and status codes for the mobile client; set up pre-commit, mypy and the CI pipeline.' },
    ],
    tech: ['Python 3.12', 'FastAPI', 'Pydantic', 'MongoDB', 'Redis', 'Firebase Cloud Messaging', 'Webhooks (HMAC)', 'Docker', 'pytest', 'CI/CD'],
  },
  {
    id: '03',
    slug: 'train-alerts',
    title: 'Train Alerts Cloud',
    shortTitle: 'Train Alerts',
    meta: 'Python · FastAPI · 2026',
    accent: 'green',
    description: 'Backend for a live "Train Card" on the phone\'s home screen that follows an Indian Railways booking from chart preparation to arrival.',
    useCase: 'A user subscribes with their 10-digit PNR. The Train Card then shows chart status, coach and berth, platform, live delay, diversion or cancellation, and taps open the full journey page. Updates arrive as push notifications, and the card hides itself after the trip ends.',
    howItWorks: 'A FastAPI service combines partner webhooks with tiered polling of live running status. Passengers on the same train share one record per train run, a milestone state machine decides what the card shows, and a push is sent only when something the user can see has actually changed.',
    role: 'Core contributor',
    built: [
      { title: 'JWT WebView links', text: 'Replaced a partner API call on every card tap with locally signed JWT WebView links and app deep links (with a Play Store fallback).' },
      { title: 'Cancellation fan-out', text: 'Fully cancelled bookings are unsubscribed automatically and later partner webhooks for them are skipped.' },
      { title: 'Delay alerts', text: 'A change in delay minutes now sends a push even after departure; refined the card\'s milestone and delay-overlay logic.' },
      { title: 'Safe live tracking', text: 'Partner error codes fall back safely and keep the last known delay, with added logging and tests.' },
      { title: 'Subscribe flow & tooling', text: 'Optimised the subscribe flow and passenger data (coach, berth type), built an audit-log tool for support, and made a Train Card demo video in React with Remotion.' },
    ],
    tech: ['Python 3.12', 'FastAPI', 'MongoDB', 'Redis', 'JWT', 'Webhooks (HMAC)', 'Firebase Cloud Messaging', 'Docker', 'pytest', 'React / Remotion'],
  },
]

export const projectHref = (slug: string) => `#/projects/${slug}`
