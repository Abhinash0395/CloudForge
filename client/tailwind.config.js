/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06111F', // Deepest Navy
          900: '#081A2E', // Main Navy Background
          850: '#0B1F35', // Sidebar / Surface Background
          800: '#0D243D', // Primary Card Surface
          750: '#102B46', // Secondary Card / Hover Surface
          700: '#16385C', // Borders & Dividers
          600: '#234D7A',
        },
        brand: {
          primary: '#4F46E5',   // Indigo
          accent: '#06B6D4',    // Cyan
          purple: '#8B5CF6',    // Purple / Prediction
          blue: '#3B82F6',      // Electric Blue
        },
        risk: {
          low: '#10B981',       // Emerald Green (Safe / Low)
          moderate: '#F59E0B',  // Amber / Yellow (Moderate)
          high: '#F97316',      // Orange (Warning)
          critical: '#EF4444',  // Crimson Red (Critical / High Alert)
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(79, 70, 229, 0.35)',
        'glow-primary': '0 0 20px -3px rgba(79, 70, 229, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-critical': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'glow-low': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
      },
      borderRadius: {
        'enterprise': '16px',
      },
    },
  },
  plugins: [],
}
