/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        diagonal: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(45deg)' },
          '50%': { transform: 'translate(10px, 10px) rotate(45deg)' },
        },
      },
      animation: {
        'diagonal-move': 'diagonal 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
