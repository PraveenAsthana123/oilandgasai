import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0a0e1a', secondary: '#0f1629', border: '#1e2a45' },
      },
    },
  },
  plugins: [],
};

export default config;
