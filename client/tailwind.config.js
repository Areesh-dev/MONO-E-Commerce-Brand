export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#000000',
          surface: '#0A0A0A',
          card: '#131313',
          line: '#2E2C2C',
          muted: '#5F5F5E',
          dim: '#7F7B7A',
          soft: '#B0AEB0',
          text: '#D5D5D6',
          white: '#F5F5F5',
          pure: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Archivo"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        editorial: '0.08em',
        nav: '0.15em',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};