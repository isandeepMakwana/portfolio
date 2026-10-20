export type ProjectAccent = 'violet' | 'cyan' | 'green'

export interface BuiltItem {
  title: string
  text: string
}

export interface HowItWorksPart {
  heading: string
  points: string[]
}

export interface Project {
  id: string
  slug: string
  title: string
  shortTitle: string
  meta: string
  accent: ProjectAccent
  label: string
  tagline: string
  description: string
  storyTitle: string
  howItWorks: HowItWorksPart[]
  howItWorksCaption: string
  decisions: BuiltItem[]
  role: string
  built: BuiltItem[]
  tech: string[]
}

export const PROJECTS: Project[] = [
  {
    id: '01',
    slug: 'mindpilot',
    title: 'AI Mind Pilot',
    shortTitle: 'MindPilot',
    meta: 'ColorOS 16 & 17 · Python + Java · LLM',
    accent: 'violet',
    label: 'ColorOS 16 & 17',
    tagline: 'Ask mode answers. Agent mode gets things done.',
    description:
      'The AI assistant built into ColorOS on OPPO and OnePlus phones: side-by-side answers from Gemini, Perplexity and ChatGPT in Ask mode, and multi-step tasks with Manus and ChatGPT in Agent mode.',
    storyTitle: 'Inside MindPilot',
    howItWorks: [
      {
        heading: 'Ask service · Python',
        points: [
          'Safety check on every question',
          'Detects intent and picks the models',
          'Checks the user\'s quota',
          'Adds the most relevant Mind Space notes',
          'Calls models in parallel and streams answers (SSE)',
          'Swaps in another model if one is slow',
        ],
      },
      {
        heading: 'Agent gateway · Java',
        points: [
          'Creates Manus tasks and streams the plan and next steps to the phone',
          'The on-device agent works on your files; they are not stored in the cloud',
          'OpenAI-compatible chat, responses and images',
          'Free allowance and link-your-own-account (OAuth)',
          'Partner tools over MCP with an allow-list',
        ],
      },
    ],
    howItWorksCaption: 'Two clouds, one assistant: Python for fast multi-model answers, Java for long-running agent tasks.',
    decisions: [
      { title: 'Stream first, then compare', text: 'Answers appear as they are generated, so three models feel fast instead of waiting for the slowest.' },
      { title: 'Personal context with limits', text: 'Only the most relevant Mind Space notes are added, re-ranked and capped so prompts stay small.' },
      { title: 'Fallback on slow models', text: 'If a model takes too long to start answering, another one takes over.' },
      { title: 'Agents need guardrails', text: 'Content safety checks, per-user quotas and an allow-list of tools.' },
    ],
    role: 'Software Engineer III on a multi-team codebase',
    built: [
      { title: 'MCP tooling in the Java gateway', text: 'Added MCP prompts and resources APIs to the Agent gateway and fixed an OAuth service startup dependency cycle.' },
      { title: 'OAuth 2.1 + PKCE account linking', text: 'Partner account linking with expiring token storage, covered by live OAuth integration tests.' },
      { title: 'Country-level model controls', text: 'Shipped an admin API and UI, plus request middleware that hides models blocked in a country, backed by unit tests.' },
    ],
    tech: ['Python', 'FastAPI', 'SSE streaming', 'LLM orchestration', 'MCP', 'Java 17', 'Spring Boot', 'OAuth 2.1 / PKCE', 'MongoDB', 'Redis', 'Kafka'],
  },
  {
    id: '02',
    slug: 'flight-alerts',
    title: 'Flight Alerts Cloud',
    shortTitle: 'Flight Alerts',
    meta: 'ColorOS AI Mind Suggest · Python · FastAPI',
    accent: 'cyan',
    label: 'ColorOS AI Mind Suggest',
    tagline: 'Your flight status, on your home screen, before you think to check.',
    description: 'The cloud service behind live flight cards and push alerts on OPPO and OnePlus phones.',
    storyTitle: 'The full trip · DEL → BOM',
    howItWorks: [
      {
        heading: 'In',
        points: [
          'Phone app, forwarded booking SMS (an LLM reads it) or email check',
          'Signed push callbacks from a flight-data provider',
          'A poller that checks more often as departure nears',
        ],
      },
      {
        heading: 'Core · FastAPI',
        points: [
          'Encrypted traffic from the phone',
          'MongoDB for users, flights and status snapshots',
          'Redis for cache and locks',
          'Compares old and new status',
        ],
      },
      {
        heading: 'Out',
        points: [
          'Firebase Cloud Messaging push only on real changes',
          'Retry job for pushes the phone did not get',
          'Finished flights stop being tracked',
        ],
      },
    ],
    howItWorksCaption: 'Provider pushes are fast; the poller fills the gaps. Either way, only real changes reach the phone.',
    decisions: [
      { title: 'Push + poll', text: 'Provider callbacks are fast, but some never arrive, so a poller fills the gaps.' },
      { title: 'Poll smarter, not more', text: 'Check rarely when a flight is days away and often when it is about to leave. This saves provider calls.' },
      { title: 'Many servers, one job', text: 'Redis locks make sure scheduled jobs run once, even across several machines.' },
      { title: 'Privacy built in', text: 'Device traffic is encrypted and personal data is masked in logs and support tools.' },
    ],
    role: 'Built the first version of the service; core contributor',
    built: [
      { title: 'Service from scratch', text: 'FastAPI app, MongoDB/Redis data model, Docker setup, and the subscribe, flight-detail and provider-callback APIs.' },
      { title: 'Instant webhook acks', text: 'Moved cache refresh and push delivery into background tasks so provider webhooks are acknowledged immediately.' },
      { title: 'Batch status reads', text: 'Batch flight-status reads with a short Redis cache instead of one database call per flight.' },
      { title: 'Distributed lock', text: 'SMS schedule sync guarded by a Redis lock, so only one instance runs it.' },
      { title: 'Client contract & CI', text: 'Typed error model for the phone client; pre-commit, mypy and the CI pipeline.' },
    ],
    tech: ['Python 3.12', 'FastAPI', 'Pydantic', 'MongoDB', 'Redis', 'Firebase Cloud Messaging', 'Signed webhooks', 'Docker', 'pytest'],
  },
  {
    id: '03',
    slug: 'train-alerts',
    title: 'Train Alerts Cloud',
    shortTitle: 'Train Alerts',
    meta: 'MakeMyTrip Train Card · Python · FastAPI',
    accent: 'green',
    label: 'ColorOS AI Mind Suggest · India',
    tagline: 'From PNR to platform: your train trip, live on the home screen.',
    description: 'The cloud service behind the MakeMyTrip Train Card on OPPO and OnePlus phones in India.',
    storyTitle: 'The full trip · Borivali → Kota',
    howItWorks: [
      {
        heading: 'In',
        points: [
          'PNR from the Train Card',
          'Booking and route from MakeMyTrip',
          'Signed PNR and live-status webhooks from MakeMyTrip',
          'A poller, only for trips that are close',
        ],
      },
      {
        heading: 'Core · FastAPI',
        points: [
          'Journeys: one per PNR',
          'Train runs: one per train and date, shared by every booking on it',
          'Milestone engine decides what the card shows now',
        ],
      },
      {
        heading: 'Out',
        points: [
          'Firebase Cloud Messaging push only if the card visibly changed',
          'Signed links open the full journey page',
          'Card hides a day after the trip',
        ],
      },
    ],
    howItWorksCaption: 'Every traveller on a train shares one live record, and the card only changes when something the user can see changes.',
    decisions: [
      { title: 'Share the train, not the work', text: 'One record per train run, linked to every booking on it.' },
      { title: 'A milestone engine decides the card', text: 'Chart, platform, departed, arrived. Delay is shown on top of the current stage, not instead of it.' },
      { title: 'Reference-counted subscriptions', text: 'The partner subscription is cancelled only when the last traveller on that train leaves.' },
      { title: 'Never lose real data', text: 'Observed station times are never overwritten by estimates.' },
    ],
    role: 'Core contributor',
    built: [
      { title: 'Signed WebView links', text: 'Tapping the card opens a locally signed JWT link and app deep link instead of waiting on a partner API call.' },
      { title: 'Cancellation fan-out', text: 'Fully cancelled bookings are unsubscribed automatically and later partner webhooks for them are skipped.' },
      { title: 'Delay alerts after departure', text: 'A change in delay sends a push even after the train leaves; fixed milestone and delay-overlay logic.' },
      { title: 'Safe live tracking', text: 'Partner errors fall back safely and keep the last known delay.' },
      { title: 'Subscribe flow & tooling', text: 'Faster subscribe flow, richer passenger data, an audit-log tool for support, and a Train Card demo video in React (Remotion).' },
    ],
    tech: ['Python 3.12', 'FastAPI', 'MongoDB', 'Redis', 'JWT', 'Signed webhooks', 'Firebase Cloud Messaging', 'Docker', 'pytest'],
  },
]

export const projectHref = (slug: string) => `#/projects/${slug}`
