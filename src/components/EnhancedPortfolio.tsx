import { useState, useEffect } from 'react'
import { ArrowUpRight, Github, Linkedin, Terminal, Moon, Sun, ChevronDown, Mail, Phone, MapPin, Clock, FileText, Code2 } from 'lucide-react'
import { motion, AnimatePresence, type MotionProps } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'

type ColorTheme = 'green' | 'blue' | 'purple' | 'red' | 'orange' | 'pink' | 'cyan' | 'rainbow'
type TerminalStyle = 'modern' | 'retro' | 'minimal' | 'glass' | 'neon' | 'matrix' | 'cyberpunk' | 'gradient' |
  'vaporwave' | 'paper'
type ButtonType = 'close' | 'minimize' | 'maximize'

interface WindowStyle {
  window: string
  header: string
  buttons: string
  button: string
  title: string
  content: string
  animation: Pick<MotionProps, 'initial' | 'animate' | 'transition'>
}

const SECTIONS = ['home', 'about', 'projects', 'career', 'contact']
const TERMINAL_STYLES: TerminalStyle[] = ['modern', 'retro', 'minimal', 'glass', 'neon', 'matrix', 'cyberpunk', 'gradient', 'vaporwave', 'paper']

// "rainbow" is not a Tailwind color, so it falls back to violet for utility classes.
const twColor = (theme: ColorTheme) => (theme === 'rainbow' ? 'violet' : theme)

const getWindowStyles = (color: string): Record<TerminalStyle, WindowStyle> => ({
  modern: {
    window: `bg-black/80 backdrop-blur-sm rounded-lg border border-${color}-500/20`,
    header: `px-4 py-2 border-b border-${color}-500/20`,
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded-full",
    title: `text-sm text-${color}-400 font-mono`,
    content: "p-4",
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    }
  },
  retro: {
    window: "bg-zinc-900 rounded border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]",
    header: "px-4 py-2 border-b-2 border-green-500/50 bg-zinc-800",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded",
    title: "text-sm text-green-500 font-mono uppercase tracking-wider",
    content: "p-4 text-green-500",
    animation: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  },
  minimal: {
    window: "bg-zinc-900/50 rounded-sm border border-zinc-800",
    header: "px-3 py-1.5 border-b border-zinc-800",
    buttons: "hidden",
    button: "",
    title: "text-xs text-zinc-500 font-mono",
    content: "p-3",
    animation: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 }
    }
  },
  glass: {
    window: "bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg",
    header: "px-4 py-2 border-b border-white/20",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded-full bg-white/20",
    title: "text-sm text-white/70 font-mono",
    content: "p-4",
    animation: {
      initial: { opacity: 0, backdropFilter: "blur(0px)" },
      animate: { opacity: 1, backdropFilter: "blur(12px)" },
      transition: { duration: 0.7 }
    }
  },
  neon: {
    window: "bg-black/90 rounded-lg border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    header: "px-4 py-2 border-b-2 border-purple-500/50 bg-black/50",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded-full animate-pulse",
    title: "text-sm text-purple-400 font-mono uppercase tracking-widest",
    content: "p-4 text-purple-300",
    animation: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5 }
    }
  },
  matrix: {
    window: "bg-black rounded-lg border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] overflow-hidden",
    header: "px-4 py-2 border-b border-green-500/30 bg-black/90",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded-full bg-green-500/50",
    title: "text-sm text-green-400 font-mono glitch",
    content: "p-4 text-green-400 matrix-bg",
    animation: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { type: "spring", stiffness: 200 }
    }
  },
  cyberpunk: {
    window: "bg-black/80 rounded-lg border-l-4 border-r-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    header: "px-4 py-2 border-b-2 border-yellow-500/50 bg-yellow-500/10",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded cyberpunk-glow",
    title: "text-sm text-yellow-500 font-mono uppercase tracking-widest",
    content: "p-4 text-yellow-100",
    animation: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: "spring", stiffness: 200 }
    }
  },
  gradient: {
    window: "bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 backdrop-blur-md rounded-lg border border-white/10",
    header: "px-4 py-2 border-b border-white/10 bg-white/5",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded-full gradient-glow",
    title: "text-sm text-white/80 font-mono",
    content: "p-4 text-white/90",
    animation: {
      initial: { opacity: 0, rotate: -2 },
      animate: { opacity: 1, rotate: 0 },
      transition: { type: "spring", stiffness: 200 }
    }
  },
  vaporwave: {
    window: "bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-lg border-2 border-pink-400/30",
    header: "px-4 py-2 border-b-2 border-pink-400/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded-full shadow-lg shadow-pink-500/50",
    title: "text-sm text-pink-300 font-mono tracking-widest",
    content: "p-4 text-pink-200",
    animation: {
      initial: { opacity: 0, rotate: -2 },
      animate: { opacity: 1, rotate: 0 },
      transition: { type: "spring", stiffness: 200 }
    }
  },
  paper: {
    window: "bg-stone-50 rounded-lg border border-stone-200 shadow-md",
    header: "px-4 py-2 bg-stone-100 border-b border-stone-200",
    buttons: "flex gap-2",
    button: "w-3 h-3 rounded-full shadow-sm",
    title: "text-sm text-stone-600 font-mono",
    content: "p-4 text-stone-800",
    animation: {
      initial: { opacity: 0, y: -5 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.2 }
    }
  }
})

const DEFAULT_BUTTON_COLORS: Record<ButtonType, string> = { close: 'bg-red-500', minimize: 'bg-yellow-500', maximize: 'bg-green-500' }

const BUTTON_COLORS: Partial<Record<TerminalStyle, Record<ButtonType, string>>> = {
  modern: DEFAULT_BUTTON_COLORS,
  retro: { close: 'bg-green-500/50', minimize: 'bg-green-500/50', maximize: 'bg-green-500/50' },
  glass: { close: 'bg-white/20', minimize: 'bg-white/20', maximize: 'bg-white/20' },
  neon: { close: 'bg-purple-500', minimize: 'bg-purple-400', maximize: 'bg-purple-300' },
  matrix: { close: 'bg-green-500', minimize: 'bg-green-400', maximize: 'bg-green-300' },
  cyberpunk: { close: 'bg-yellow-500', minimize: 'bg-yellow-400', maximize: 'bg-yellow-300' },
  gradient: { close: 'bg-gradient-to-r from-purple-500 to-pink-500', minimize: 'bg-gradient-to-r from-pink-500 to-red-500', maximize: 'bg-gradient-to-r from-red-500 to-orange-500' },
  vaporwave: { close: 'bg-pink-500', minimize: 'bg-purple-500', maximize: 'bg-blue-500' },
  paper: { close: 'bg-red-400', minimize: 'bg-amber-400', maximize: 'bg-emerald-400' },
}

const getButtonColor = (style: TerminalStyle, type: ButtonType) => (BUTTON_COLORS[style] ?? DEFAULT_BUTTON_COLORS)[type]

const COLOR_THEMES: Record<ColorTheme, { primary: string }> = {
  green: { primary: 'rgb(34, 197, 94)' },
  blue: { primary: 'rgb(59, 130, 246)' },
  purple: { primary: 'rgb(168, 85, 247)' },
  red: { primary: 'rgb(239, 68, 68)' },
  orange: { primary: 'rgb(249, 115, 22)' },
  pink: { primary: 'rgb(236, 72, 153)' },
  cyan: { primary: 'rgb(34, 211, 238)' },
  rainbow: { primary: 'linear-gradient(to right, #ff0000, #00ff00, #0000ff)' }
}

interface Project {
  id: string
  title: string
  meta: string
  description: string
  useCase: string
  howItWorks: string
  role: string
  built: string[]
  tech: string[]
}

const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'MindPilot — AI Assistant (Ask & Agent modes)',
    meta: 'Python + Java · LLM / MCP · 2026',
    description: 'The AI assistant shipped with a new ColorOS release: "Ask" mode answers questions with multiple LLMs, and "Agent" mode completes real tasks by calling partner services as tools.',
    useCase: 'In Ask mode a user asks a question and gets a streamed answer, or compares answers from several models side by side. In Agent mode the user says something like "order a paneer wrap from a nearby place" and the assistant searches restaurants, builds the cart, shows the bill and places the order only after the user confirms.',
    howItWorks: 'Ask mode is a Python FastAPI service that routes each query by intent, calls several LLM providers in parallel and streams the result over Server-Sent Events. Agent mode is a Java Spring Boot gateway that talks to partner tools over the Model Context Protocol (MCP), handles partner OAuth sign-in and keeps the list of allowed tools.',
    role: 'Feature developer on a large multi-team codebase',
    built: [
      'Prototyped a food-ordering AI agent over MCP in Python: an LLM planner picks the tool and fills its arguments from each tool\'s JSON schema, with a keyword-scored fallback when the model\'s confidence is low.',
      'Added human-in-the-loop safety: the agent reviews the cart and itemised bill with the user and refuses to check out without explicit confirmation.',
      'Implemented partner sign-in with OAuth 2.1 + PKCE and expiring token storage, plus query routing that auto-selects the food connector from the user\'s message.',
      'Extended the Java Agent gateway with MCP prompts and resources APIs, fixed an OAuth service startup dependency cycle, and wrote live OAuth integration tests.',
      'Shipped country-level model availability controls: admin API and UI, plus request middleware that hides blocked LLMs per country, backed by unit tests.',
    ],
    tech: ['Python', 'FastAPI', 'LLM tool calling', 'MCP', 'OAuth 2.1 / PKCE', 'SSE streaming', 'Java 17', 'Spring Boot', 'MongoDB', 'Redis', 'pytest'],
  },
  {
    id: '02',
    title: 'Flight Alerts Cloud',
    meta: 'Python · FastAPI · 2026',
    description: 'Cloud backend that tracks a traveller\'s flights and pushes real-time status updates to their phone.',
    useCase: 'A traveller adds a flight from the phone app, a forwarded booking SMS or a booking email. From then on they get a push notification when the flight is delayed, the gate changes, or it is cancelled — without opening an airline app.',
    howItWorks: 'A FastAPI service stores subscriptions in MongoDB, receives signed status callbacks from a third-party flight-data provider and also polls it on a schedule. Real changes are pushed through Firebase Cloud Messaging; Redis holds caches and locks so the service runs safely on several workers and hosts.',
    role: 'Built the first version of the service; core contributor',
    built: [
      'Started the service from scratch: FastAPI app, MongoDB/Redis data model, Docker Compose setup, and the core subscribe, flight-detail and provider-callback APIs.',
      'Moved callback cache invalidation and push delivery into background tasks so provider webhooks are acknowledged immediately.',
      'Added batch flight-state reads with a short-lived Redis cache, replacing one database round trip per flight when loading a user\'s trips.',
      'Built SMS-schedule sync guarded by a Redis distributed lock, so only one instance runs it across a multi-worker deployment.',
      'Defined a typed error model and status codes for the mobile client contract; set up pre-commit, mypy and the CI pipeline.',
    ],
    tech: ['Python 3.12', 'FastAPI', 'Pydantic', 'MongoDB', 'Redis', 'Firebase Cloud Messaging', 'Webhooks (HMAC)', 'Docker', 'pytest', 'CI/CD'],
  },
  {
    id: '03',
    title: 'Train Alerts Cloud',
    meta: 'Python · FastAPI · 2026',
    description: 'Backend for a live "Train Card" on the phone\'s home screen that follows an Indian Railways booking from chart preparation to arrival.',
    useCase: 'A user subscribes with their 10-digit PNR. The Train Card then shows chart status, coach and berth, platform, live delay, diversion or cancellation, and taps open the full journey page. Updates arrive as push notifications, and the card hides itself after the trip ends.',
    howItWorks: 'A FastAPI service combines partner webhooks with tiered polling of live running status. Passengers on the same train share one record per train run, a milestone state machine decides what the card shows, and a push is sent only when something the user can see has actually changed.',
    role: 'Core contributor',
    built: [
      'Replaced a partner API call on every card tap with locally signed JWT WebView links and app deep links (with a Play Store fallback), removing an external dependency from the tap path.',
      'Implemented cancellation fan-out: fully cancelled bookings are unsubscribed automatically and later partner webhooks for them are skipped.',
      'Fixed delay alerts so a change in delay minutes sends a push even after departure, and refined the card\'s milestone and delay-overlay logic.',
      'Hardened live tracking so partner error codes fall back safely and keep the last known delay, with added logging and tests.',
      'Optimised the subscribe flow and passenger data (coach, berth type), built an audit-log retrieval tool for support, and made an animated product demo of the Train Card in React with Remotion.',
    ],
    tech: ['Python 3.12', 'FastAPI', 'MongoDB', 'Redis', 'JWT', 'Webhooks (HMAC)', 'Firebase Cloud Messaging', 'Docker', 'pytest', 'React / Remotion'],
  },
]

interface WindowProps {
  title: string
  children: React.ReactNode
  isActive?: boolean
  style: TerminalStyle
  colorTheme: ColorTheme
}

function Window({ title, children, isActive = false, style, colorTheme }: WindowProps) {
  const currentStyle = getWindowStyles(twColor(colorTheme))[style]

  return (
    <motion.div
      {...currentStyle.animation}
      className={`${currentStyle.window} overflow-hidden ${isActive ? 'ring-1 ring-green-500/20' : ''}`}
    >
      <div className={`flex items-center justify-between ${currentStyle.header}`}>
        <span className={currentStyle.title}>{title}</span>
        <div className={currentStyle.buttons}>
          {style !== 'minimal' && (
            <>
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={`${currentStyle.button} ${getButtonColor(style, 'close')}`}
              />
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={`${currentStyle.button} ${getButtonColor(style, 'minimize')}`}
              />
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={`${currentStyle.button} ${getButtonColor(style, 'maximize')}`}
              />
            </>
          )}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={style}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={currentStyle.content}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive: boolean
  onNavigate: () => void
}

function NavLink({ href, children, isActive, onNavigate }: NavLinkProps) {
  return (
    <motion.a
      href={href}
      className={`relative text-sm uppercase tracking-wider transition-colors
        ${isActive ? 'text-green-500' : 'text-zinc-400 hover:text-green-500'}`}
      onClick={(e) => {
        e.preventDefault()
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
        onNavigate()
      }}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeSection"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-500"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </motion.a>
  )
}

interface NavigationProps {
  activeWindow: string
  isMenuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

function Navigation({ activeWindow, isMenuOpen, onToggleMenu, onCloseMenu, isDarkMode, onToggleDarkMode }: NavigationProps) {
  return (
    <nav aria-label="Main navigation">
      <div className="flex justify-between items-center">
        <Terminal className="text-green-500 w-8 h-8" />
        <button
          className="md:hidden text-zinc-400 hover:text-green-500 transition-colors"
          onClick={onToggleMenu}
          aria-label="Toggle menu"
        >
          <ChevronDown className={`w-6 h-6 transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        <ul className={`md:flex items-center gap-4 text-zinc-400 ${isMenuOpen ? 'block absolute top-full left-0 right-0 bg-black/80 p-4 md:p-0 md:relative md:bg-transparent' : 'hidden'}`}>
          {SECTIONS.map((item) => (
            <li key={item}>
              <NavLink href={`#${item}`} isActive={activeWindow === item} onNavigate={onCloseMenu}>
                {item === 'career' ? 'Career Journey' : item}
              </NavLink>
            </li>
          ))}
          <li className="md:ml-4">
            <motion.a
              href="https://drive.google.com/file/d/1wzmmR0z68oF1bbAdFbrzcoAl6c1ZVeTh/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-black font-semibold rounded-full 
                hover:bg-green-400 transition-colors duration-300"
            >
              <FileText className="w-4 h-4" />
              Resume
            </motion.a>
          </li>
          <li>
            <button
              onClick={onToggleDarkMode}
              className="text-zinc-400 hover:text-green-500 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

interface ThemeControlsProps {
  colorTheme: ColorTheme
  onColorThemeChange: (theme: ColorTheme) => void
  terminalStyle: TerminalStyle
  onTerminalStyleChange: (style: TerminalStyle) => void
  isOpen: boolean
  onToggle: () => void
}

function ThemeControls({ colorTheme, onColorThemeChange, terminalStyle, onTerminalStyleChange, isOpen, onToggle }: ThemeControlsProps) {
  const color = twColor(colorTheme)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : '48px' }}
        className={`bg-black/90 backdrop-blur-md rounded-lg border border-${color}-500/20 
          shadow-lg shadow-${color}-500/10 overflow-hidden
          transition-colors duration-300`}
      >
        <button
          onClick={onToggle}
          className={`w-full px-4 py-2 flex items-center justify-between 
            text-${color}-400 hover:text-${color}-300 
            transition-all duration-300`}
        >
          <span className="text-sm font-mono flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`} />
            Theme Controls
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`p-4 border-t border-${color}-500/20`}
            >
              <div className="space-y-4">
                <h3 className={`text-sm font-mono text-${color}-400`}>Color Theme</h3>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(COLOR_THEMES) as [ColorTheme, { primary: string }][]).map(([theme, colors]) => (
                    <motion.button
                      key={theme}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onColorThemeChange(theme)}
                      className={`w-8 h-8 rounded-full relative 
                        ${colorTheme === theme 
                          ? `ring-2 ring-${twColor(theme)}-400 ring-offset-2 ring-offset-black` 
                          : ''}`}
                      style={{
                        background: colors.primary,
                        boxShadow: `0 0 20px ${theme === 'rainbow' 
                          ? 'rgba(124, 58, 237, 0.2)' 
                          : colors.primary}40`
                      }}
                    >
                      {colorTheme === theme && (
                        <motion.div
                          layoutId="selectedColor"
                          className={`absolute inset-0 rounded-full border-2 border-${twColor(theme)}-400`}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className={`text-sm font-mono text-${color}-400`}>Terminal Style</h3>
                <div className="grid grid-cols-2 gap-2">
                  {TERMINAL_STYLES.map((style) => (
                    <motion.button
                      key={style}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTerminalStyleChange(style)}
                      className={`px-3 py-2 rounded-md text-xs font-mono transition-all duration-300
                        ${terminalStyle === style 
                          ? `bg-${color}-500 text-black font-medium shadow-md shadow-${color}-500/20` 
                          : `text-${color}-400 hover:text-${color}-300 bg-black/50 hover:bg-black/70`}`}
                    >
                      {style}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function EnhancedPortfolio() {
  const [activeWindow, setActiveWindow] = useState('home')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [terminalStyle, setTerminalStyle] = useState<TerminalStyle>('modern')
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green')
  const [isThemeControlsOpen, setIsThemeControlsOpen] = useState(false)

  useEffect(() => {
    // Handle scroll to update active window
    const handleScroll = () => {
      const currentSection = SECTIONS.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      if (currentSection) {
        setActiveWindow(currentSection)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Add initial loading animation
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const toggleDarkMode = () => {
    const nextIsDarkMode = !isDarkMode
    setIsDarkMode(nextIsDarkMode)
    setTerminalStyle(nextIsDarkMode ? 'modern' : 'paper')
  }

  const getThemeColor = (opacity = 1) => {
    const colors = {
      green: `rgba(34, 197, 94, ${opacity})`,
      blue: `rgba(59, 130, 246, ${opacity})`,
      purple: `rgba(168, 85, 247, ${opacity})`,
      red: `rgba(239, 68, 68, ${opacity})`,
      orange: `rgba(249, 115, 22, ${opacity})`,
      pink: `rgba(236, 72, 153, ${opacity})`,
      cyan: `rgba(34, 211, 238, ${opacity})`,
      rainbow: `rgba(124, 58, 237, ${opacity})`
    }
    return colors[colorTheme]
  }

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{
        background: isDarkMode 
          ? `linear-gradient(to bottom right, rgb(0, 0, 0), rgba(0, 0, 0, 0.9), ${getThemeColor(0.1)})`
          : `linear-gradient(to bottom right, rgb(255, 255, 255), rgb(243, 244, 246), ${getThemeColor(0.1)})`
      }}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Terminal className="text-green-500 w-12 h-12 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
      {!isLoading && (
        <>
          <ThemeControls
            colorTheme={colorTheme}
            onColorThemeChange={setColorTheme}
            terminalStyle={terminalStyle}
            onTerminalStyleChange={setTerminalStyle}
            isOpen={isThemeControlsOpen}
            onToggle={() => setIsThemeControlsOpen(!isThemeControlsOpen)}
          />
          <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-4">
              <Navigation
                activeWindow={activeWindow}
                isMenuOpen={isMenuOpen}
                onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                onCloseMenu={() => setIsMenuOpen(false)}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            </div>
          </header>

          <main className="container mx-auto px-4 py-20">
            <section id="home" className="min-h-screen flex items-center justify-center py-20 relative">
              {/* Optional: Animated Background Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-purple-500/5" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center z-10 px-4"
              >
                {/* Greeting with Typing Effect */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <span className={`text-lg ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                    👋 Welcome to my portfolio
                  </span>
                </motion.div>

                {/* Main Heading */}
                <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Hi, <span className="text-green-500">I'm</span>{' '}
                  <span className="relative">
                    Sandeep Makwana
                    <motion.span
                      className="absolute -bottom-2 left-0 w-full h-1 bg-green-500/20"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </span>
                </h1>
                <br />
                
                {/* Brief Introduction */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-xl max-w-2xl mx-auto mb-8 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}
                >
                  I'm a Software Engineer III at OPPO & OnePlus, building{' '}
                  <span className="text-green-500 font-semibold">AI agents & LLM features</span> and{' '}
                  <span className="text-green-500 font-semibold">Python backend services</span>,
                  passionate about building elegant solutions to complex problems.
                </motion.p>
                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-4"
                >
                  <motion.a
                    href="#contact"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 bg-green-500 text-black font-bold py-3 px-6 rounded-full 
                      hover:bg-green-400 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Get in touch
                  </motion.a>
                  <motion.a
                    href="https://drive.google.com/file/d/1wzmmR0z68oF1bbAdFbrzcoAl6c1ZVeTh/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 py-3 px-6 rounded-full border-2 border-green-500 
                      text-green-500 font-bold hover:bg-green-500/10 transition-colors duration-300"
                  >
                    <FileText className="w-5 h-5" />
                    Download Resume
                  </motion.a>
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-12 flex justify-center gap-6"
                >
                  {[
                    { icon: Github, href: 'https://github.com/isandeepMakwana', label: 'GitHub' },
                    { icon: Linkedin, href: 'https://www.linkedin.com/in/sandeepmakwana', label: 'LinkedIn' },
                    { icon: Code2, href: 'https://leetcode.com/isandeepMakwana', label: 'LeetCode' },
                    { icon: Mail, href: 'mailto:sandeepmakwana.work@gmail.com', label: 'Email' }
                  ].map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`text-zinc-400 hover:text-green-500 transition-colors duration-300`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-6 h-6" />
                    </motion.a>
                  ))}
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Scroll to explore</span>
                    <ChevronDown className="w-5 h-5 text-green-500" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </section>

            <section id="about" className="py-20">
              <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>About Me</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Window style={terminalStyle} colorTheme={colorTheme} title="about-me.txt" isActive>
                  <div className="font-mono space-y-4 text-zinc-300">
                    <div className="typing-effect">
                      <div className="flex gap-4 items-center hover:bg-zinc-800/50 p-2 rounded transition-colors">
                        <span className="text-zinc-600 select-none">01</span>
                        <span>
                          Hi! I'm <span className="text-green-500 font-semibold">Sandeep Makwana</span>, 
                          a <span className="text-blue-400 font-semibold">Software Engineer III</span> at OPPO & OnePlus.
                        </span>
                      </div>
                      <div className="flex gap-4 items-center hover:bg-zinc-800/50 p-2 rounded transition-colors">
                        <span className="text-zinc-600 select-none">02</span>
                        <span>
                          With <span className="text-yellow-500">4+ years</span> of experience in building
                          <span className="text-purple-400"> scalable applications</span>
                        </span>
                      </div>
                      <div className="flex gap-4 items-center hover:bg-zinc-800/50 p-2 rounded transition-colors">
                        <span className="text-zinc-600 select-none">03</span>
                        <span>
                          Specializing in <span className="text-pink-400">AI agents & LLMs</span> and
                          <span className="text-orange-400"> Python backend systems</span>
                        </span>
                      </div>
                      <div className="flex gap-4 items-center hover:bg-zinc-800/50 p-2 rounded transition-colors">
                        <span className="text-zinc-600 select-none">04</span>
                        <span>
                          Passionate about <span className="text-green-400">clean code</span> and
                          <span className="text-blue-400"> optimal solutions</span>
                        </span>
                      </div>
                      <div className="flex gap-4 items-center hover:bg-zinc-800/50 p-2 rounded transition-colors">
                        <span className="text-zinc-600 select-none">05</span>
                        <span>
                          Recognized as <span className="text-yellow-500">Employee of the Month 7 times</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Window>
                
                <div className="space-y-6">
                  <Window style={terminalStyle} colorTheme={colorTheme} title="skills.json">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-green-500 mb-4 font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Languages & Tools
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'SQL', 'Bash', 'Java'].map(skill => (
                            <motion.span
                              key={skill}
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1.5 bg-zinc-800/70 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700/70 transition-colors cursor-default"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-blue-400 mb-4 font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          Frameworks & Libraries
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {['FastAPI', 'Django', 'Flask', 'Spring Boot', 'Pydantic', 'React', 'Tailwind', 'Pytest', 'Pandas'].map(skill => (
                            <motion.span
                              key={skill}
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1.5 bg-zinc-800/70 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700/70 transition-colors cursor-default"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-yellow-500 mb-4 font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Cloud & DevOps
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {['AWS', 'Docker', 'MongoDB', 'Redis', 'Firebase (FCM)', 'Jenkins', 'Git', 'CI/CD'].map(skill => (
                            <motion.span
                              key={skill}
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1.5 bg-zinc-800/70 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700/70 transition-colors cursor-default"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-pink-400 mb-4 font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                          AI & LLM
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {['LLM Tool Calling', 'AI Agents', 'Model Context Protocol (MCP)', 'Prompt Engineering', 'Multi-LLM Routing', 'SSE Streaming', 'OAuth 2.1 / PKCE'].map(skill => (
                            <motion.span
                              key={skill}
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1.5 bg-zinc-800/70 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700/70 transition-colors cursor-default"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Window>

                  <Window style={terminalStyle} colorTheme={colorTheme} title="achievements.md">
                    <div className="space-y-4">
                      {[
                        { icon: '🏆', color: 'text-green-500', text: 'AWS Certified Solutions Architect - Associate' },
                        { icon: '👥', color: 'text-yellow-500', text: 'Led team of 28 developers with 30% faster delivery' },
                        { icon: '🎯', color: 'text-blue-400', text: '7x Employee of the Month' }
                      ].map((achievement, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                        >
                          <span className="text-xl">{achievement.icon}</span>
                          <span className={`${achievement.color} font-medium`}>{achievement.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </Window>
                </div>
              </div>
            </section>

            <section id="projects" className="py-20">
              <h2 className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Projects</h2>
              <p className={`max-w-3xl mx-auto mb-8 text-center ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                An AI assistant and two event-driven cloud services for a smartphone OS — the problem each one solves, how it works, and what I built.
              </p>
              <Window style={terminalStyle} colorTheme={colorTheme} title="projects.json" isActive>
                <div className="space-y-10">
                  {PROJECTS.map((project) => (
                    <motion.div
                      key={project.id}
                      className="group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <span className="text-zinc-600 font-mono">{project.id}</span>
                          <h3 className={`text-2xl font-bold group-hover:text-green-500 transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {project.title}
                          </h3>
                        </div>
                        <span className="text-zinc-500 text-sm font-mono text-right">{project.meta}</span>
                      </div>
                      <p className={`mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{project.description}</p>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="rounded-lg border border-green-500/10 bg-green-500/5 p-4">
                          <h4 className="text-green-500 text-sm font-semibold uppercase tracking-wider mb-2">Use case</h4>
                          <p className={`text-sm leading-6 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{project.useCase}</p>
                        </div>
                        <div className="rounded-lg border border-blue-500/10 bg-blue-500/5 p-4">
                          <h4 className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">How it works</h4>
                          <p className={`text-sm leading-6 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{project.howItWorks}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-yellow-500 text-sm font-semibold uppercase tracking-wider mb-2">
                          What I built <span className="text-zinc-500 normal-case tracking-normal font-normal">· {project.role}</span>
                        </h4>
                        <ul className="space-y-2">
                          {project.built.map((item) => (
                            <li key={item} className={`flex gap-2 text-sm leading-6 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                              <span className="text-green-500">→</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {project.tech.map((tech) => (
                          <span key={tech} className="px-2 py-1 rounded-full bg-zinc-800/50 text-xs text-zinc-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Window>
            </section>

            <section id="career" className="py-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Career Journey
                </h2>
                <motion.a
                  href="https://drive.google.com/file/d/1wzmmR0z68oF1bbAdFbrzcoAl6c1ZVeTh/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg text-green-500 
                    hover:bg-zinc-700 transition-colors duration-300 border border-green-500/20"
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-mono text-sm">Sandeep_makwana_resume.pdf</span>
                </motion.a>
              </div>
              <Window style={terminalStyle} colorTheme={colorTheme} title="career.json" isActive={activeWindow === 'career'}>
                <div className="space-y-12">
                  {/* OPPO & OnePlus */}
                  <motion.div
                    className="relative pl-8 border-l-2 border-pink-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -left-[9px] top-0">
                      <div className="w-4 h-4 rounded-full bg-pink-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          Software Engineer III
                        </h3>
                        <span className="text-pink-500 font-mono text-sm">Mar 2026 - Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>OPPO & OnePlus</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-500">Hyderabad</span>
                      </div>
                      <ul className="space-y-3 text-zinc-400">
                        <li className="flex gap-2">
                          <span className="text-pink-500">→</span>
                          <span>Prototyped an LLM-powered food-ordering agent over the Model Context Protocol (MCP) for the MindPilot AI assistant, with schema-driven tool calls and a human-in-the-loop checkout gate</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-pink-500">→</span>
                          <span>Shipped country-level LLM availability controls (admin API, UI and middleware) for MindPilot's multi-model Ask mode</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-pink-500">→</span>
                          <span>Built the first version of a FastAPI flight-alert cloud service that pushes real-time flight status to phones via Firebase Cloud Messaging</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-pink-500">→</span>
                          <span>Core contributor to a live train-tracking service: JWT WebView links, cancellation fan-out and delay-alert fixes</span>
                        </li>
                      </ul>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {['Python', 'FastAPI', 'LLM / MCP', 'Java', 'Spring Boot', 'MongoDB', 'Redis', 'FCM', 'Docker'].map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* ConsultAdd Full-time Role */}
                  <motion.div
                    className="relative pl-8 border-l-2 border-green-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -left-[9px] top-0">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          Software Engineer II
                        </h3>
                        <span className="text-green-500 font-mono text-sm">Jul 2022 - Mar 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>ConsultAdd</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-500">Pune</span>
                      </div>
                      <ul className="space-y-3 text-zinc-400">
                        <li className="flex gap-2">
                          <span className="text-green-500">→</span>
                          <span>Designed and deployed AWS data lake solution using S3, Glue, and Athena, enhancing data accessibility</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-500">→</span>
                          <span>Created dynamic React.js components for clinical trials system, improving efficiency by 40%</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-500">→</span>
                          <span>Developed and optimized RESTful APIs using Django and DRF, boosting response times by 25%</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-500">→</span>
                          <span>Managed data migration from AWS S3 to Snowflake, reducing processing time by 50%</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-500">→</span>
                          <span>Built real-time data pipeline using AWS Kinesis, Lambda, and DynamoDB</span>
                        </li>
                      </ul>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {['AWS', 'React', 'Django', 'Python', 'Snowflake', 'Docker', 'CI/CD'].map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* ConsultAdd Internship */}
                  <motion.div
                    className="relative pl-8 border-l-2 border-blue-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -left-[9px] top-0">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          Software Engineer Intern
                        </h3>
                        <span className="text-blue-500 font-mono text-sm">Jan 2022 - Jun 2022</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>ConsultAdd</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-500">Remote</span>
                      </div>
                      <ul className="space-y-3 text-zinc-400">
                        <li className="flex gap-2">
                          <span className="text-blue-500">→</span>
                          <span>Restructured legacy codebase to align with industry best practices</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-500">→</span>
                          <span>Engineered AWS Step Functions for Glue job orchestration</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-500">→</span>
                          <span>Increased unit test coverage from 60% to 80%</span>
                        </li>
                      </ul>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {['AWS', 'Python', 'Step Functions', 'Glue', 'Unit Testing'].map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Education */}
                  <motion.div
                    className="relative pl-8 border-l-2 border-purple-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -left-[9px] top-0">
                      <div className="w-4 h-4 rounded-full bg-purple-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          Bachelor of Technology in Computer Science
                        </h3>
                        <span className="text-purple-500 font-mono text-sm">Graduated Jun 2022</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                          Rajiv Gandhi Proudyogiki Vishwavidyalaya
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-500">Bhopal, MP</span>
                      </div>
                      <div className="text-zinc-400">
                        <span className="text-purple-500 font-semibold">CGPA:</span> 8.6/10.0
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {['Data Structures', 'Algorithms', 'Computer Networks', 'Operating Systems'].map((subject) => (
                          <span key={subject} className="px-2 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Window>
            </section>

            <section id="contact" className="py-20">
              <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Contact</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Window style={terminalStyle} colorTheme={colorTheme} title="contact-form.jsx" isActive>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your name"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-zinc-600"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="your.email@example.com"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-zinc-600"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-1">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Your message here..."
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-zinc-600"
                        required
                      ></textarea>
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-green-500 text-black font-bold py-3 px-4 rounded-md hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Message
                    </motion.button>
                  </form>
                  {/* Quick Response Promise */}
                  <div className="pt-4 border-t border-zinc-800 mt-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>Usually responds within 24 hours</span>
                    </div>
                  </div>
                </Window>

                <Window style={terminalStyle} colorTheme={colorTheme} title="me-online.sh">
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      {[
                        { icon: Mail, label: 'sandeepmakwana.work@gmail.com', href: 'mailto:sandeepmakwana.work@gmail.com' },
                        { icon: Phone, label: '+91 6263216081', href: 'tel:+916263216081' },
                        { icon: MapPin, label: 'Pune, Maharashtra, India', href: null },
                      ].map((contact, index) => (
                        <motion.div
                          key={index}
                          whileHover={contact.href ? { x: 4 } : {}}
                          className={`group flex items-center gap-4 p-2 rounded-md ${contact.href ? 'hover:bg-zinc-800/50' : ''} transition-colors`}
                        >
                          <contact.icon className={`text-zinc-400 ${contact.href ? 'group-hover:text-green-500' : ''} transition-colors`} />
                          {contact.href ? (
                            <a href={contact.href} className="text-zinc-300 group-hover:text-green-500 transition-colors">{contact.label}</a>
                          ) : (
                            <span className="text-zinc-300">{contact.label}</span>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Social Links */}
                    <div className="pt-4 border-t border-zinc-800">
                      <div className="space-y-4">
                        {[
                          { icon: Github, label: 'github.com/isandeepmakwana', href: 'https://github.com/isandeepMakwana' },
                          { icon: Linkedin, label: 'linkedin.com/in/sandeepmakwana', href: 'https://www.linkedin.com/in/sandeepmakwana' },
                          { icon: Code2, label: 'leetcode.com/isandeepMakwana', href: 'https://leetcode.com/isandeepMakwana' },
                        ].map((social, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ x: 4 }}
                            className="group flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
                          >
                            <social.icon className="text-zinc-400 group-hover:text-green-500 transition-colors" />
                            <a href={social.href} className="text-zinc-300 group-hover:text-green-500 transition-colors">{social.label}</a>
                            <ArrowUpRight className="text-zinc-600 w-4 h-4 group-hover:text-green-500 transition-colors ml-auto" />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className="pt-4 border-t border-zinc-800">
                      <motion.div 
                        className="flex items-center gap-3 p-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
                        </div>
                        <span className="text-zinc-300">Available for new opportunities</span>
                      </motion.div>
                    </div>
                  </div>
                </Window>
              </div>
            </section>
          </main>

          <footer className="bg-black/80 backdrop-blur-sm py-8">
            <div className="container mx-auto px-6 text-center">
              <p className="text-zinc-400">Copyright &copy; 2026 Sandeep Makwana. All rights reserved.</p>
            </div>
          </footer>
          <Analytics />
        </>
      )}
    </div>
  )
}
