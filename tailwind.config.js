/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neon palette
        neon: {
          blue: '#00d4ff',
          purple: '#9b59ff',
          green: '#00ff88',
          pink: '#ff2d9b',
          cyan: '#00ffff',
        },
        dark: {
          900: '#030712',
          800: '#0a0f1e',
          700: '#0d1527',
          600: '#111c33',
          500: '#162040',
          400: '#1e2d52',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        body: ['Sora', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'typing': 'typing 1.2s steps(3) infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff40' },
          '50%': { boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff60, 0 0 60px #00d4ff20' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'typing': {
          '0%': { content: '"."' },
          '33%': { content: '".."' },
          '66%': { content: '"..."' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), 
                         linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
        'neon-gradient': 'linear-gradient(135deg, #00d4ff20, #9b59ff20)',
        'card-gradient': 'linear-gradient(135deg, #0d1527, #111c33)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
