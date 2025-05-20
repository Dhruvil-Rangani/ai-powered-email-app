// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'media',
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
        colors: {
            background: 'var(--background)',
            foreground: 'var(--foreground)',
        },
        fontFamily: {
            sans: ['var(--font-geist-sans)', 'sans-serif'],
            mono: ['var(--font-geist-mono)', 'monospace'],
        },
        },
    },
    plugins: [require('tailwind-scrollbar')],
};

export default config;
