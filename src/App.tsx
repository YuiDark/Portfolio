import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  Check,
  Mail,
  Moon,
  Music2,
  Pause,
  Play,
  Send,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { siteConfig, type ThemeMode } from './config';

type Toast = { id: string; message: string };
type ChatMessage = { id: string; role: 'user' | 'model'; text: string };

function playClick() {
  if (!siteConfig.uiSounds.enabled) return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(740, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
  osc.onended = () => ctx.close();
}

function replyTo(text: string) {
  const q = text.toLowerCase();
  const hit = siteConfig.chat.replies.find((item) => item.keywords.some((word) => q.includes(word)));
  return hit?.text ?? siteConfig.chat.fallback;
}

export default function App() {
  const { profile, theme: themeCfg, music, projects, stack, focus, links, nav, chat } = siteConfig;
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(themeCfg.storageKey);
    return saved === 'light' || saved === 'dark' ? saved : themeCfg.defaultMode;
  });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'model', text: chat.welcome }]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string>(stack[0].name);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const year = useMemo(() => new Date().getFullYear(), []);
  const skill = stack.find((item) => item.name === activeSkill) ?? stack[0];

  useEffect(() => {
    localStorage.setItem(themeCfg.storageKey, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const bg = theme === 'dark' ? themeCfg.colors.darkBg : themeCfg.colors.lightBg;
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    document.title = `${profile.name} | ${profile.role}`;
  }, [theme, themeCfg, profile.name, profile.role]);

  useEffect(() => {
    const audio = new Audio(music.src);
    audio.loop = true;
    audio.volume = music.volume;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [music.src, music.volume]);

  useEffect(() => {
    if (!music.enabled || !music.startAfterInteraction) return;
    const start = () => {
      const audio = audioRef.current;
      if (!audio || muted) return;
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
  }, [muted, music.enabled, music.startAfterInteraction]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (muted) audio.pause();
  }, [muted]);

  const spawn = (message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 2800);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !music.enabled) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    setMuted(false);
    audio.muted = false;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      spawn('Press play again — the browser blocked audio.');
    }
  };

  const toggleTheme = (event: React.MouseEvent) => {
    playClick();
    const rect = event.currentTarget.getBoundingClientRect();
    const splash = document.createElement('div');
    splash.className = 'fixed pointer-events-none rounded-full z-[80]';
    splash.style.left = `${rect.left + rect.width / 2}px`;
    splash.style.top = `${rect.top + rect.height / 2}px`;
    splash.style.width = '0px';
    splash.style.height = '0px';
    splash.style.transform = 'translate(-50%, -50%)';
    splash.style.transition = 'width 650ms ease, height 650ms ease, opacity 400ms ease';
    splash.style.background = theme === 'dark' ? themeCfg.colors.lightBg : themeCfg.colors.darkBg;
    document.body.appendChild(splash);
    requestAnimationFrame(() => {
      splash.style.width = '280vw';
      splash.style.height = '280vw';
    });
    window.setTimeout(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), 280);
    window.setTimeout(() => {
      splash.style.opacity = '0';
    }, 520);
    window.setTimeout(() => splash.remove(), 980);
  };

  const copyEmail = async () => {
    playClick();
    await navigator.clipboard.writeText(profile.email);
    spawn('Email copied.');
  };

  const sendChat = (text?: string) => {
    const value = (text ?? draft).trim();
    if (!value || typing) return;
    playClick();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: value }]);
    setDraft('');
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'model', text: replyTo(value) }]);
      setTyping(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 520);
  };

  const glow = theme === 'dark' ? themeCfg.colors.darkGlow : themeCfg.colors.lightGlow;

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-ink dark:text-[#f4eefe]">
      <div className="grid-fade pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(520px circle at 70% 0%, ${glow}, transparent 60%)` }}
      />

      <header className="sticky top-0 z-20 border-b border-violet-200/70 bg-[#f6f3fb]/80 backdrop-blur-md dark:border-violet-400/15 dark:bg-[#100818]/75">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-600 text-sm text-white">
              {profile.monogram}
            </span>
            {profile.name}
          </a>
          <nav className="hidden items-center gap-6 text-sm text-neutral-500 sm:flex dark:text-violet-200/70">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-violet-700 dark:hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 rounded-full border border-violet-200/80 bg-white/80 p-1 dark:border-violet-400/20 dark:bg-white/5">
            <IconButton label={playing ? 'Pause music' : 'Play music'} onClick={toggleMusic}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </IconButton>
            <IconButton label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((value) => !value)}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </IconButton>
            <IconButton label="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconButton>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-28">
        <section className="grid items-end gap-10 py-16 sm:py-24 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
              {profile.availability} · {profile.location}
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.96] tracking-tight sm:text-7xl">
              Interfaces in{' '}
              <span className="text-violet-600 dark:text-violet-300">{profile.accentWord}</span>, typed and shipped.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-violet-100/75">
              {profile.bio[0]}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#work" className="rounded-full bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500">
                Selected work
              </a>
              <button
                onClick={copyEmail}
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 px-5 py-3 text-sm font-medium hover:bg-white dark:border-violet-400/30 dark:hover:bg-white/5"
              >
                <Mail className="h-4 w-4" />
                {profile.email}
              </button>
              <button onClick={() => setChatOpen(true)} className="px-3 text-sm font-medium text-violet-700 dark:text-violet-200">
                Ask {profile.name}
              </button>
            </div>
          </div>
          <aside className="rounded-3xl border border-violet-200/80 bg-white/70 p-5 shadow-sm dark:border-violet-400/15 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-500">Now</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{skill.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-violet-200/70">{skill.detail}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {stack.slice(0, 6).map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    playClick();
                    setActiveSkill(item.name);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.name === skill.name
                      ? 'bg-violet-600 text-white'
                      : 'bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-100'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </aside>
        </section>

        <div className="overflow-hidden border-y border-violet-200/70 py-3 dark:border-violet-400/15">
          <div className="marquee-track flex w-max gap-8 pr-8 text-sm font-medium tracking-wide text-violet-700/80 dark:text-violet-200/70">
            {[...stack, ...stack].map((item, index) => (
              <span key={`${item.name}-${index}`} className="flex items-center gap-8">
                {item.name}
                <span className="h-1 w-1 rounded-full bg-violet-400" />
              </span>
            ))}
          </div>
        </div>

        <section id="stack" className="py-16">
          <SectionLabel index="01" title="Stack" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  playClick();
                  setActiveSkill(item.name);
                  spawn(item.detail);
                }}
                className="rounded-2xl border border-violet-200/80 bg-white/75 p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-400 dark:border-violet-400/15 dark:bg-white/5"
              >
                <p className="text-lg font-semibold tracking-tight">{item.name}</p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-violet-200/65">{item.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section id="work" className="py-6">
          <SectionLabel index="02" title="Selected work" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {projects.map((project, index) => (
              <a
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-3xl border border-violet-200/80 bg-white/75 p-5 transition hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 dark:border-violet-400/15 dark:bg-white/5"
              >
                <div className="mb-8 flex h-36 items-end justify-between rounded-2xl bg-gradient-to-br from-violet-100 via-white to-fuchsia-50 p-4 dark:from-violet-950 dark:via-[#1a1028] dark:to-fuchsia-950/30">
                  <span className="text-4xl font-semibold tracking-tight text-violet-300 dark:text-violet-700">
                    0{index + 1}
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-white/10 dark:text-violet-100">
                    {project.year}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-violet-200/70">{project.summary}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 text-violet-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="about" className="grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionLabel index="03" title="About" />
          <div>
            {profile.bio.map((line) => (
              <p key={line} className="mb-4 text-lg leading-relaxed text-neutral-600 dark:text-violet-100/75">
                {line}
              </p>
            ))}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {focus.map((item) => (
                <div key={item.title} className="rounded-2xl border border-violet-200/70 p-4 dark:border-violet-400/15">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-violet-200/65">{item.text}</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 text-sm text-neutral-500 dark:text-violet-200/70">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="inline-flex items-center gap-1 hover:text-violet-600 dark:hover:text-white">
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-violet-200/70 py-6 text-xs uppercase tracking-[0.18em] text-neutral-400 dark:border-violet-400/15">
          <span>Made by {profile.name}</span>
          <span>{themeCfg.font} · {year}</span>
        </footer>
      </main>

      {music.enabled && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-5 left-5 z-30 flex items-center gap-3 rounded-full border border-violet-200/80 bg-white/90 px-3 py-2 text-left shadow-lg shadow-violet-500/10 backdrop-blur dark:border-violet-400/20 dark:bg-[#1a1028]/90"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-white">
            <Music2 className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-medium leading-none">{music.title}</span>
            <span className="mt-1 block text-[11px] text-neutral-500 dark:text-violet-200/60">
              {music.artist} · {playing && !muted ? 'Playing' : 'Paused'}
            </span>
          </span>
          <span className="ml-1 flex h-4 items-end gap-0.5">
            {[0, 1, 2].map((bar) => (
              <span
                key={bar}
                className="eq-bar w-0.5 rounded-full bg-violet-500"
                style={{ height: 14, animationDelay: `${bar * 0.15}s`, animationPlayState: playing && !muted ? 'running' : 'paused' }}
              />
            ))}
          </span>
        </button>
      )}

      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-violet-200 bg-[#fbf9ff] shadow-2xl dark:border-violet-400/20 dark:bg-[#140c1e]"
          >
            <div className="flex items-center justify-between border-b border-violet-100 px-5 py-4 dark:border-violet-400/15">
              <div>
                <p className="text-lg font-semibold">{chat.title}</p>
                <p className="text-xs text-neutral-500">Replies come from config</p>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-sm text-violet-600">Close</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === 'user' ? 'ml-auto bg-violet-600 text-white' : 'bg-white text-neutral-700 dark:bg-white/5 dark:text-violet-100'
                  }`}
                >
                  {message.text}
                </div>
              ))}
              {typing && <p className="text-xs text-violet-500">{profile.name} is typing…</p>}
              <div ref={chatEndRef} />
            </div>
            <form
              className="flex gap-2 border-t border-violet-100 p-4 dark:border-violet-400/15"
              onSubmit={(event) => {
                event.preventDefault();
                sendChat();
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={chat.placeholder}
                className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-violet-400/20 dark:bg-white/5"
              />
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-violet-400/20 dark:bg-[#1c122b]"
            >
              <Check className="h-4 w-4 text-violet-500" />
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-500">{index}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full text-violet-700 hover:bg-violet-100 dark:text-violet-200 dark:hover:bg-white/10"
    >
      {children}
    </button>
  );
}
