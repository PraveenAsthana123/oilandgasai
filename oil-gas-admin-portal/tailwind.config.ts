import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'oga-bg': '#0a0e1a',
        'oga-surface': '#0f1629',
        'oga-border': '#1e2a45',
        'oga-accent': '#ef4444',
      },
    },
  },
  plugins: [],
}
export default config
