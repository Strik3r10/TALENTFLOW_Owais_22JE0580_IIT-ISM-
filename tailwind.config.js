/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        castle: {
          stone: '#3a3a3a',
          'stone-light': '#4a4a4a',
          'stone-dark': '#2a2a2a',
        },
        parchment: {
          DEFAULT: '#f4e8c1',
          light: '#faf5e4',
          dark: '#e8d9a8',
        },
        royal: {
          purple: '#6a0dad',
          'purple-light': '#8a2dcd',
          'purple-dark': '#4a078d',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#e4bf47',
          dark: '#b49f27',
          trim: '#ffd700',
        },
        blood: {
          red: '#8b0000',
          'red-light': '#a52a2a',
          'red-dark': '#6b0000',
        },
        forest: {
          green: '#2d5016',
          'green-light': '#3d6026',
          'green-dark': '#1d4006',
        },
        aged: {
          brown: '#5c4033',
          'brown-light': '#6c5043',
          'brown-dark': '#4c3023',
        },
      },
      fontFamily: {
        medieval: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'serif'],
        decorative: ['UnifrakturMaguntia', 'cursive'],
      },
      backgroundImage: {
        'parchment-texture': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence baseFrequency=\"0.9\" /%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.05\" /%3E%3C/svg%3E')",
        'castle-wall': "linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)",
      },
      boxShadow: {
        'wax-seal': '0 4px 6px -1px rgba(138, 0, 0, 0.3), 0 2px 4px -1px rgba(138, 0, 0, 0.2)',
        'parchment': '0 10px 15px -3px rgba(92, 64, 51, 0.3), 0 4px 6px -2px rgba(92, 64, 51, 0.2)',
        'embossed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(212, 175, 55, 0.5)',
      },
      animation: {
        'unfurl': 'unfurl 0.6s ease-out',
        'torch-flicker': 'torch-flicker 2s infinite',
        'sword-slash': 'sword-slash 0.5s ease-out',
        'shield-break': 'shield-break 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        unfurl: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'top' },
        },
        'torch-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'sword-slash': {
          '0%': { transform: 'translateX(-100%) rotate(-45deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%) rotate(-45deg)', opacity: '0' },
        },
        'shield-break': {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' },
          '100%': { transform: 'scale(0) rotate(15deg)', opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.6)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
