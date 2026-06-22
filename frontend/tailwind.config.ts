import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:          '#0F172A',
        'dark-blue':   '#1E3A8A',
        brand:         '#2563EB',
        'brand-light': '#E0F2FE',
        sky:           '#38BDF8',
        surface:       '#F8FAFC',
        'gray-border': '#E2E8F0',
        'text-dark':   '#111827',
        'text-muted':  '#64748B',
      },
    },
  },
  plugins: [],
}

export default config
