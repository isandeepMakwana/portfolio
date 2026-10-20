import { useState, useEffect, type FormEvent } from 'react'
import { ArrowRight, ArrowUp, ArrowUpRight, Award, Github, Linkedin, Terminal, Moon, Sun, ChevronDown, Mail, Phone, MapPin, Clock, FileText, Code2, Target, Users } from 'lucide-react'
import { motion, AnimatePresence, MotionConfig, useMotionValueEvent, useScroll, useSpring, type MotionProps } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { PROJECTS, projectHref } from '../data/projects'
import ProjectCard from './projects/ProjectCard'
import { ACCENTS } from './projects/accents'

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

const CONTACT_EMAIL = 'sandeepmakwana.work@gmail.com'

const TONES = {
  dark: {
    body: 'text-zinc-300',
    muted: 'text-zinc-400',
    lineNo: 'text-zinc-600',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    blue: 'text-blue-400',
    rowHover: 'hover:bg-zinc-800/50',
    smallChip: 'bg-zinc-800/50 text-zinc-400',
    divider: 'border-zinc-800',
    input: 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600',
    button: 'bg-zinc-800 hover:bg-zinc-700',
  },
  light: {
    body: 'text-stone-700',
    muted: 'text-stone-600',
    lineNo: 'text-stone-400',
    yellow: 'text-amber-600',
    green: 'text-green-700',
    blue: 'text-blue-600',
    rowHover: 'hover:bg-stone-200/60',
    smallChip: 'bg-stone-200/70 text-stone-600',
    divider: 'border-stone-200',
    input: 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400',
    button: 'bg-white hover:bg-stone-100',
  },
} as const

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

const REVEAL_UP: MotionProps = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

const HERO_ROLES = [
  'AI agents & LLM tool calling', 2000,
  'Python & FastAPI backends', 2000,
  'MCP integrations', 2000,
  'Real-time cloud notifications', 2000,
]

const RESUME_URL = 'https://drive.google.com/file/d/1wzmmR0z68oF1bbAdFbrzcoAl6c1ZVeTh/view?usp=sharing'

const SOCIALS = [
  { icon: Github, name: 'GitHub', handle: 'github.com/isandeepmakwana', href: 'https://github.com/isandeepMakwana' },
  { icon: Linkedin, name: 'LinkedIn', handle: 'linkedin.com/in/sandeepmakwana', href: 'https://www.linkedin.com/in/sandeepmakwana' },
  { icon: Code2, name: 'LeetCode', handle: 'leetcode.com/isandeepMakwana', href: 'https://leetcode.com/isandeepMakwana' },
]

const HERO_FACTS = [
  { value: '4+ yrs', label: 'building production software' },
  { value: '3 products', label: 'shipped on ColorOS' },
  { value: 'AI · Python · Java', label: 'core stack' },
]

// Light variants are darker so they stay readable on the paper background.
const SKILL_GROUPS = [
  {
    title: 'AI & LLM',
    dark: 'text-pink-400', light: 'text-pink-600', dot: 'bg-pink-400', chip: 'bg-pink-500/10 border-pink-500/20',
    skills: ['AI Agents', 'LLM Tool Calling', 'Model Context Protocol (MCP)', 'Multi-LLM Routing', 'SSE Streaming', 'OAuth 2.1 / PKCE', 'Prompt Engineering'],
  },
  {
    title: 'Languages',
    dark: 'text-green-500', light: 'text-green-700', dot: 'bg-green-500', chip: 'bg-green-500/10 border-green-500/20',
    skills: ['Python', 'Java', 'TypeScript', 'JavaScript', 'SQL', 'Bash', 'C', 'C++'],
  },
  {
    title: 'Frameworks & Libraries',
    dark: 'text-blue-400', light: 'text-blue-600', dot: 'bg-blue-400', chip: 'bg-blue-500/10 border-blue-500/20',
    skills: ['FastAPI', 'Spring Boot', 'Pydantic', 'Pytest', 'Django', 'Flask', 'React', 'Tailwind', 'Pandas'],
  },
  {
    title: 'Cloud & Data',
    dark: 'text-yellow-500', light: 'text-amber-600', dot: 'bg-yellow-500', chip: 'bg-yellow-500/10 border-yellow-500/20',
    skills: ['MongoDB', 'Redis', 'Firebase (FCM)', 'Docker', 'AWS', 'Jenkins', 'Git', 'CI/CD'],
  },
]

const USED_IN_PROJECTS = new Set([
  'AI Agents', 'LLM Tool Calling', 'Model Context Protocol (MCP)', 'Multi-LLM Routing', 'SSE Streaming', 'OAuth 2.1 / PKCE',
  'Python', 'Java', 'FastAPI', 'Spring Boot', 'Pydantic', 'Pytest', 'MongoDB', 'Redis', 'Firebase (FCM)', 'Docker',
])

interface SectionHeadingProps {
  index: string
  label: string
  title: string
  subtitle: string
  isDarkMode: boolean
  children?: React.ReactNode
}

function SectionHeading({ index, label, title, subtitle, isDarkMode, children }: SectionHeadingProps) {
  return (
    <motion.div {...REVEAL_UP} className="mb-10 text-center">
      <p className={`mb-2 font-mono text-sm ${isDarkMode ? 'text-green-500' : 'text-green-700'}`}>
        {index} · {label}
      </p>
      <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{title}</h2>
      <p className={`mt-3 max-w-2xl mx-auto ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{subtitle}</p>
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </motion.div>
  )
}

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
      initial={currentStyle.animation.initial}
      whileInView={currentStyle.animation.animate as MotionProps['whileInView']}
      viewport={{ once: true, amount: 0.1 }}
      transition={currentStyle.animation.transition}
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
              href={RESUME_URL}
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

export default function EnhancedPortfolio({ initialSection }: { initialSection?: string }) {
  const [activeWindow, setActiveWindow] = useState('home')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(!initialSection)
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

  useEffect(() => {
    if (isLoading || !initialSection) return
    document.getElementById(initialSection)?.scrollIntoView()
  }, [isLoading, initialSection])

  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const [showBackToTop, setShowBackToTop] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', (progress) => setShowBackToTop(progress > 0.15))
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const tone = TONES[isDarkMode ? 'dark' : 'light']

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (contactStatus === 'sending') return
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    // Bots fill this hidden field. A filled value means we drop the submission.
    if (String(form.get('_honey') ?? '').trim()) return
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()
    setContactStatus('sending')
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio message from ${name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      })
      const data = (await response.json()) as { success?: string; message?: string }
      // The first submission only asks the owner to confirm the form. Later ones are delivered.
      if (data.message?.toLowerCase().includes('activat')) {
        formEl.reset()
        setContactStatus('sent')
        return
      }
      if (!response.ok || data.success === 'false') throw new Error('send failed')
      formEl.reset()
      setContactStatus('sent')
    } catch {
      setContactStatus('error')
    }
  }

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
    <MotionConfig reducedMotion="user">
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
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-400"
              style={{ scaleX: scrollProgress }}
            />
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
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-purple-500/5" />
                <motion.div
                  className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-green-500/10 blur-3xl"
                  animate={{ x: [0, 60, -20, 0], y: [0, -40, 30, 0] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"
                  animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center z-10 px-4"
              >
                <motion.a
                  href={projectHref('mindpilot')}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`group mb-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 text-sm transition-colors hover:border-green-500/60 ${tone.body}`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60 animate-ping motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Now at OPPO & OnePlus · AI Mind Pilot on ColorOS 17
                  <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${tone.green}`} />
                </motion.a>

                {/* Main Heading */}
                <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Hi, <span className="text-green-500">I'm</span>{' '}
                  <span className="relative">
                    Sandeep Makwana
                    <motion.span
                      className="absolute -bottom-2 left-0 w-full h-1 rounded-full bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-400 origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                    />
                  </span>
                </h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 h-8 font-mono text-lg md:text-2xl"
                >
                  <span className="text-zinc-500">&gt; building </span>
                  <TypeAnimation
                    sequence={HERO_ROLES}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                    className="text-green-500"
                  />
                </motion.div>
                
                {/* Brief Introduction */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-xl max-w-2xl mx-auto mb-8 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}
                >
                  Software Engineer III at OPPO & OnePlus, building{' '}
                  <span className={`${tone.green} font-semibold`}>AI agents & LLM features</span> and the{' '}
                  <span className={`${tone.green} font-semibold`}>cloud services</span> behind ColorOS travel alerts.
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
                    href={RESUME_URL}
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

                <motion.dl
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className={`mt-10 mx-auto grid max-w-2xl grid-cols-3 divide-x ${isDarkMode ? 'divide-zinc-800' : 'divide-stone-300'}`}
                >
                  {HERO_FACTS.map((fact) => (
                    <div key={fact.value} className="px-2 sm:px-4">
                      <dt className={`text-base sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{fact.value}</dt>
                      <dd className={`mt-1 text-xs sm:text-sm ${tone.muted}`}>{fact.label}</dd>
                    </div>
                  ))}
                </motion.dl>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 flex justify-center gap-2"
                >
                  {[...SOCIALS, { icon: Mail, name: 'Email', href: `mailto:${CONTACT_EMAIL}` }].map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`flex h-11 w-11 items-center justify-center hover:text-green-500 transition-colors duration-300 ${tone.muted}`}
                      aria-label={social.name}
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
              <SectionHeading
                index="01"
                label="About"
                title="About Me"
                subtitle="Who I am, what I work with, and what I've been recognised for."
                isDarkMode={isDarkMode}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <Window style={terminalStyle} colorTheme={colorTheme} title="about-me.txt" isActive>
                  <div className={`font-mono space-y-2 ${tone.body}`}>
                    {[
                      <>
                        <span className={`${tone.green} font-semibold`}>Software Engineer III</span> at OPPO & OnePlus, Hyderabad.
                      </>,
                      <>
                        <span className={tone.yellow}>4+ years</span> building backend services and AI features that run in production.
                      </>,
                      <>
                        Now: <span className={isDarkMode ? 'text-pink-400' : 'text-pink-600'}>AI Mind Pilot agents</span>, LLM tool calling and
                        real-time <span className={tone.blue}>travel alerts</span> for ColorOS.
                      </>,
                      <>
                        Before: <span className={tone.blue}>AWS data platforms</span> and React apps for clinical trials at ConsultAdd.
                      </>,
                    ].map((line, i) => (
                      <div key={i} className={`flex gap-4 p-2 rounded transition-colors ${tone.rowHover}`}>
                        <span className={`${tone.lineNo} select-none`}>{String(i + 1).padStart(2, '0')}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </Window>
                
                <div className="space-y-6">
                  <Window style={terminalStyle} colorTheme={colorTheme} title="skills.json">
                    <div className="space-y-6">
                      <p className={`flex items-center gap-2 text-xs font-mono ${tone.muted}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white' : 'bg-stone-700'}`} />
                        used in my projects
                      </p>
                      {SKILL_GROUPS.map((group) => (
                        <div key={group.title}>
                          <h3 className={`mb-3 font-semibold flex items-center gap-2 ${isDarkMode ? group.dark : group.light}`}>
                            <span className={`w-2 h-2 rounded-full ${group.dot}`} />
                            {group.title}
                          </h3>
                          <ul className="flex flex-wrap gap-2">
                            {group.skills.map((skill) => {
                              const used = USED_IN_PROJECTS.has(skill)
                              return (
                                <motion.li
                                  key={skill}
                                  whileHover={{ scale: 1.05 }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-default ${group.chip} ${tone.body}`}
                                >
                                  {skill}
                                  {used && (
                                    <>
                                      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white' : 'bg-stone-700'}`} />
                                      <span className="sr-only">(used in my projects)</span>
                                    </>
                                  )}
                                </motion.li>
                              )
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Window>

                  <Window style={terminalStyle} colorTheme={colorTheme} title="achievements.md">
                    <div className="space-y-2">
                      {[
                        { icon: Award, color: tone.green, box: 'bg-green-500/10', text: 'AWS Certified Solutions Architect – Associate' },
                        { icon: Users, color: tone.yellow, box: 'bg-yellow-500/10', text: 'Led a team of 28 developers, delivering 30% faster' },
                        { icon: Target, color: tone.blue, box: 'bg-blue-500/10', text: 'Employee of the Month, 7 times' },
                      ].map((achievement) => (
                        <motion.div
                          key={achievement.text}
                          whileHover={{ x: 4 }}
                          className={`flex items-center gap-3 p-2 ${tone.rowHover} rounded-lg transition-colors`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${achievement.box} ${achievement.color}`}>
                            <achievement.icon className="w-5 h-5" />
                          </span>
                          <span className={`font-medium ${tone.body}`}>{achievement.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </Window>
                </div>
              </div>
            </section>

            <section id="projects" className="py-20">
              <SectionHeading
                index="02"
                label="Projects"
                title="Projects"
                subtitle="An AI assistant and two event-driven cloud services for a smartphone OS. Tap a card to watch how each product works, step by step."
                isDarkMode={isDarkMode}
              />
              <Window style={terminalStyle} colorTheme={colorTheme} title="projects.json" isActive>
                <div className="grid md:grid-cols-3 gap-5">
                  {PROJECTS.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} isDarkMode={isDarkMode} />
                  ))}
                </div>
              </Window>
            </section>

            <section id="career" className="py-20">
              <SectionHeading
                index="03"
                label="Career"
                title="Career Journey"
                subtitle="From AWS data platforms to AI on a smartphone OS."
                isDarkMode={isDarkMode}
              >
                <motion.a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex min-h-[44px] items-center gap-2 px-4 rounded-lg transition-colors duration-300 border border-green-500/20 ${tone.button} ${tone.green}`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-mono text-sm">Sandeep_makwana_resume.pdf</span>
                </motion.a>
              </SectionHeading>
              <Window style={terminalStyle} colorTheme={colorTheme} title="career.json" isActive={activeWindow === 'career'}>
                <div className="space-y-12">
                  {/* OPPO & OnePlus */}
                  <motion.div
                    className="relative pl-8 border-l-2 border-pink-500/20"
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  >
                    <div className="absolute -left-[9px] top-0">
                      <div className="relative w-4 h-4">
                        <div className="absolute inset-0 rounded-full bg-pink-500 animate-ping opacity-60" />
                        <div className="relative w-4 h-4 rounded-full bg-pink-500" />
                      </div>
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
                      <ul className={`space-y-3 ${tone.muted}`}>
                        <li className="flex gap-2">
                          <span className="text-pink-500">→</span>
                          <span>Built MCP tooling for the AI Mind Pilot Agent gateway (Java, Spring Boot): prompts and resources APIs, plus OAuth 2.1 + PKCE partner account linking with live integration tests</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-pink-500">→</span>
                          <span>Shipped country-level model controls (admin API, UI and middleware) for MindPilot's multi-model Ask mode</span>
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
                          <span key={tech} className={`px-2 py-1 rounded-full text-xs ${tone.smallChip}`}>
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={`font-mono text-xs ${tone.muted}`}>See the work:</span>
                        {PROJECTS.map((project) => {
                          const accent = ACCENTS[project.accent]
                          return (
                            <a
                              key={project.slug}
                              href={projectHref(project.slug)}
                              className={`group/chip inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3 text-sm transition-colors ${accent.border} ${accent.bg} ${tone.body} ${accent.hoverCard}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${accent.bgSolid}`} />
                              {project.shortTitle}
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/chip:translate-x-0.5" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* ConsultAdd Full-time Role */}
                  <motion.div
                    className="relative pl-8 border-l-2 border-green-500/20"
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  >
                    <div className="absolute -left-[9px] top-0">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          Software Engineer II
                        </h3>
                        <span className={`${tone.green} font-mono text-sm`}>Jul 2022 - Mar 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>ConsultAdd</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-500">Pune</span>
                      </div>
                      <ul className={`space-y-3 ${tone.muted}`}>
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
                          <span key={tech} className={`px-2 py-1 rounded-full text-xs ${tone.smallChip}`}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Earlier: internship and education */}
                  <motion.div
                    className="relative pl-8 border-l-2 border-blue-500/20"
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  >
                    <div className="absolute -left-[9px] top-0">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                    </div>
                    <h3 className={`mb-4 font-mono text-sm uppercase tracking-wider ${tone.muted}`}>Earlier</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        {
                          title: 'Software Engineer Intern',
                          where: 'ConsultAdd · Remote',
                          when: 'Jan – Jun 2022',
                          detail: 'Orchestrated AWS Glue jobs with Step Functions and raised unit test coverage from 60% to 80%.',
                          color: isDarkMode ? 'text-blue-400' : 'text-blue-600',
                        },
                        {
                          title: 'B.Tech, Computer Science',
                          where: 'RGPV · Bhopal, MP',
                          when: 'Graduated 2022',
                          detail: 'CGPA 8.6 / 10. Data structures, algorithms, networks and operating systems.',
                          color: isDarkMode ? 'text-purple-400' : 'text-purple-600',
                        },
                      ].map((item) => (
                        <div key={item.title} className={`rounded-lg border p-4 ${tone.divider}`}>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{item.title}</p>
                            <span className={`font-mono text-xs ${item.color}`}>{item.when}</span>
                          </div>
                          <p className="text-sm text-zinc-500">{item.where}</p>
                          <p className={`mt-2 text-sm ${tone.muted}`}>{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </Window>
            </section>

            <section id="contact" className="py-20">
              <SectionHeading
                index="04"
                label="Contact"
                title="Let's talk"
                subtitle="Hiring, collaborating, or curious about one of the projects? Send me a message."
                isDarkMode={isDarkMode}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <Window style={terminalStyle} colorTheme={colorTheme} title="contact-form.jsx" isActive>
                  <form className="relative space-y-4" onSubmit={handleContactSubmit}>
                    <input
                      type="text"
                      name="_honey"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    />
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium mb-1 ${tone.muted}`}>Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${tone.input}`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium mb-1 ${tone.muted}`}>Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="your.email@example.com"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${tone.input}`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className={`block text-sm font-medium mb-1 ${tone.muted}`}>Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Your message here..."
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${tone.input}`}
                        required
                      ></textarea>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={contactStatus === 'sending'}
                      whileHover={{ scale: contactStatus === 'sending' ? 1 : 1.02 }}
                      whileTap={{ scale: contactStatus === 'sending' ? 1 : 0.98 }}
                      className="w-full min-h-[44px] bg-green-500 text-black font-bold py-3 px-4 rounded-md hover:bg-green-400 transition-colors flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70"
                    >
                      <Mail className="w-4 h-4" />
                      {contactStatus === 'sending' ? 'Sending…' : 'Send Message'}
                    </motion.button>
                    {contactStatus === 'sent' && (
                      <p className="text-sm text-center text-green-500" role="status">Message sent. I'll reply to the email you entered.</p>
                    )}
                    {contactStatus === 'error' && (
                      <p className="text-sm text-center text-red-400" role="alert">
                        Couldn't send just now. Email me directly at {CONTACT_EMAIL}.
                      </p>
                    )}
                    <p className={`text-xs text-center ${tone.muted}`}>Your message is emailed straight to me.</p>
                  </form>
                  {/* Quick Response Promise */}
                  <div className={`pt-4 border-t mt-4 ${tone.divider}`}>
                    <div className={`flex items-center gap-2 text-sm ${tone.muted}`}>
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
                        { icon: Mail, label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
                        { icon: Phone, label: '+91 6263216081', href: 'tel:+916263216081' },
                        { icon: MapPin, label: 'Hyderabad, Telangana, India', href: null },
                      ].map((contact, index) => (
                        <motion.div
                          key={index}
                          whileHover={contact.href ? { x: 4 } : {}}
                          className={`group flex items-center gap-4 p-2 rounded-md ${contact.href ? tone.rowHover : ''} transition-colors`}
                        >
                          <contact.icon className={`${tone.muted} ${contact.href ? 'group-hover:text-green-500' : ''} transition-colors`} />
                          {contact.href ? (
                            <a href={contact.href} className={`${tone.body} group-hover:text-green-500 transition-colors`}>{contact.label}</a>
                          ) : (
                            <span className={tone.body}>{contact.label}</span>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Social Links */}
                    <div className={`pt-4 border-t ${tone.divider}`}>
                      <div className="space-y-4">
                        {SOCIALS.map((social) => (
                          <motion.div
                            key={social.name}
                            whileHover={{ x: 4 }}
                            className={`group flex items-center gap-4 p-2 rounded-md ${tone.rowHover} transition-colors`}
                          >
                            <social.icon className={`${tone.muted} group-hover:text-green-500 transition-colors`} />
                            <a href={social.href} target="_blank" rel="noopener noreferrer" className={`${tone.body} group-hover:text-green-500 transition-colors`}>{social.handle}</a>
                            <ArrowUpRight className={`${tone.lineNo} w-4 h-4 group-hover:text-green-500 transition-colors ml-auto`} />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className={`pt-4 border-t ${tone.divider}`}>
                      <motion.div 
                        className="flex items-center gap-3 p-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
                        </div>
                        <span className={tone.body}>Available for new opportunities</span>
                      </motion.div>
                    </div>
                  </div>
                </Window>
              </div>
            </section>
          </main>

          <footer className={`border-t backdrop-blur-sm py-10 ${isDarkMode ? 'bg-black/80 border-zinc-800' : 'bg-white/80 border-stone-200'}`}>
            <div className="container mx-auto px-6 flex flex-col items-center gap-4 text-center">
              <div className="flex gap-2">
                {[...SOCIALS, { icon: Mail, name: 'Email', href: `mailto:${CONTACT_EMAIL}` }].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`flex h-11 w-11 items-center justify-center rounded-full hover:text-green-500 transition-colors ${tone.muted} ${tone.rowHover}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <p className={`font-mono text-xs ${tone.muted}`}>Built with React, TypeScript, Tailwind CSS and Framer Motion</p>
              <p className={`text-sm ${tone.muted}`}>&copy; 2026 Sandeep Makwana</p>
            </div>
          </footer>
          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                key="back-to-top"
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 20 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-400 transition-colors"
                aria-label="Back to top"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
    </MotionConfig>
  )
}
