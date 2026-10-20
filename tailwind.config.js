/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Theme color classes are built at runtime (e.g. `text-${color}-400`), so Tailwind can't find them in source.
  safelist: [
    {
      pattern: /^(bg|text|border|ring|shadow)-(green|blue|purple|red|orange|pink|cyan|violet)-(300|400|500)(\/(10|20))?$/,
      variants: ['hover'],
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

