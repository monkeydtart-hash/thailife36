import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:  '#003087',
        'navy-dark': '#001a5e',
        'navy-deep': '#001440',
        red:   '#E31E24',
        gold:  '#F5A623',
      },
      fontFamily: {
        sarabun: ['var(--font-sarabun)', 'Sarabun', 'sans-serif'],
        'serif-thai': ['var(--font-serif-thai)', 'Noto Serif Thai', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
