/**
 * Site configuration
 * Edit names, stack, projects, music, and copy here.
 * Stack is JavaScript only — no Python.
 */

export type ThemeMode = 'light' | 'dark';

export const siteConfig = {
  profile: {
    name: 'Dark',
    role: 'JavaScript Engineer',
    email: 'hello@dark.dev',
    location: 'Remote',
    availability: 'Open to projects',
    avatarUrl: '',
    monogram: 'D',
    headline: 'Interfaces in JavaScript, typed and shipped.',
    accentWord: 'JavaScript',
    bio: [
      'I build product interfaces with React and Next.js, and the Node.js services behind them.',
      'TypeScript keeps the edges honest. Vite keeps the loop fast. The rest is spacing, motion, and a quiet purple accent.',
    ],
  },

  theme: {
    defaultMode: 'light' as ThemeMode,
    storageKey: 'dark-portfolio-theme',
    font: 'Outfit',
    colors: {
      accent: '#7c3aed',
      accentSoft: '#a78bfa',
      accentDeep: '#5b21b6',
      lightBg: '#f6f3fb',
      darkBg: '#100818',
      lightGlow: 'rgba(124, 58, 237, 0.12)',
      darkGlow: 'rgba(167, 139, 250, 0.16)',
    },
  },

  music: {
    enabled: true,
    src: '/violet-drift.wav',
    title: 'Violet Drift',
    artist: 'Dark',
    volume: 0.42,
    startAfterInteraction: true,
  },

  uiSounds: { enabled: true },

  links: [
    { label: 'Email', href: 'mailto:hello@dark.dev' },
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Work', href: '#work' },
  ],

  nav: [
    { label: 'Stack', href: '#stack' },
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
  ],

  stack: [
    { name: 'JavaScript', detail: 'The language everything else sits on.' },
    { name: 'TypeScript', detail: 'Types for components, APIs, and config.' },
    { name: 'Node.js', detail: 'APIs, scripts, and small services.' },
    { name: 'React', detail: 'Interfaces with clear state and motion.' },
    { name: 'Next.js', detail: 'Routes, layouts, and production apps.' },
    { name: 'Vite', detail: 'Fast local dev and clean builds.' },
    { name: 'Tailwind CSS', detail: 'Utility styling that stays consistent.' },
    { name: 'Git', detail: 'Small commits and a readable history.' },
  ],

  focus: [
    { title: 'Product UI', text: 'React screens with clear states, Outfit type, and motion that stays short.' },
    { title: 'App shells', text: 'Next.js layouts, routes, and shared page structure.' },
    { title: 'Node services', text: 'Typed handlers that validate input and return a clean JSON shape.' },
  ],

  projects: [
    {
      id: 'studio',
      title: 'Dark Studio',
      year: '2026',
      href: 'https://github.com',
      summary: 'This portfolio: light mode, a purple theme, Outfit, music, and one config file.',
      tags: ['React', 'TypeScript', 'Vite'],
    },
    {
      id: 'northline',
      title: 'Northline',
      year: '2026',
      href: 'https://github.com',
      summary: 'A Next.js site with typed content, shared layouts, and a fast route map.',
      tags: ['Next.js', 'TypeScript', 'React'],
    },
    {
      id: 'relay',
      title: 'Relay API',
      year: '2025',
      href: 'https://github.com',
      summary: 'A Node.js service for form posts, validation, and a stable JSON response.',
      tags: ['Node.js', 'TypeScript', 'JavaScript'],
    },
    {
      id: 'kit',
      title: 'Vite Kit',
      year: '2025',
      href: 'https://github.com',
      summary: 'A starter with Vite, React, and TypeScript so a new UI can boot in seconds.',
      tags: ['Vite', 'React', 'TypeScript'],
    },
  ],

  chat: {
    title: "Dark's AI Twin",
    placeholder: 'Ask about the stack...',
    welcome:
      "Hey! I'm Dark's AI Twin. Ask about JavaScript, TypeScript, Node.js, React, Next.js, or Vite.",
    replies: [
      {
        keywords: ['javascript', 'js'],
        text: 'JavaScript is the base. Dark writes UI logic, utilities, and Node handlers in it, then tightens the important parts with TypeScript.',
      },
      {
        keywords: ['typescript', 'types'],
        text: 'TypeScript covers components, config, and API shapes so refactors stay safe.',
      },
      {
        keywords: ['node', 'backend', 'api'],
        text: 'Node.js is the server side: request handlers, validation, and scripts.',
      },
      {
        keywords: ['react', 'frontend', 'ui'],
        text: 'React is the interface layer, with motion and state kept small.',
      },
      {
        keywords: ['next'],
        text: 'Next.js is for multi-page apps: layouts, routes, and production builds.',
      },
      {
        keywords: ['vite'],
        text: 'Vite runs this portfolio. It is the fast dev server and the production build.',
      },
      {
        keywords: ['tailwind', 'css'],
        text: 'Tailwind CSS handles spacing, color, and the purple accent without a separate stylesheet maze.',
      },
      {
        keywords: ['music', 'song'],
        text: 'The track is Violet Drift. Swap the file in public/ and update music.src in src/config.ts.',
      },
      {
        keywords: ['theme', 'purple', 'light', 'font', 'outfit'],
        text: 'Light mode is the default, the accent is purple, and the typeface is Outfit.',
      },
    ],
    fallback:
      'Dark works in JavaScript, TypeScript, Node.js, React, Next.js, and Vite. Ask about a tool or a project.',
  },
} as const;

export type SiteConfig = typeof siteConfig;
