/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: [
    './components/**/*.{js,ts,jsx,tsx,json}',
    './app/**/*.{js,ts,jsx,tsx,json}',

  ],
  safelist: [
    'relative',
    'absolute',
    {
      pattern: /(bg|text|border)-./
    },

    {
      pattern: /(p|px|py)-./
    },
    {
      pattern: /(w|h)-./
    },
    {
      pattern: /text-+./,
      variants: ['sm', 'md', 'lg']
    },
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          'DEFAULT': 'var(--primary)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
        },
        'foreground': 'var(--foreground)',
        'background': 'var(--background)',
        'primary-foreground': 'var(--color-primary-text)'
      },
      fontFamily: {
        'primary': 'var(--font-primary)',
        'secondary': 'var(--font-secondary)',
        'tertiary': 'var(--font-tertiary)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      transitionProperty: {
        'height': 'height'
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
}
