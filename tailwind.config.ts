import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          raised: "hsl(var(--surface-raised))",
          sunken: "hsl(var(--surface-sunken))",
        },
        text: {
          DEFAULT: "hsl(var(--text))",
          muted: "hsl(var(--text-muted))",
        },
        navy: "hsl(var(--navy))",
        saffron: "hsl(var(--saffron))",
        jyoti: {
          gold: "hsl(var(--jyoti-gold))",
          lotus: "hsl(var(--lotus))",
        },
        teal: "hsl(var(--teal))",
        cosmos: "hsl(var(--cosmos))",
        "cosmos-2": "hsl(var(--cosmos-2))",
        "dark-text": "hsl(var(--dark-text))",
        "dark-muted": "hsl(var(--dark-muted))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        // Jyoti.ai Cosmic Color Palette (Master Plan v1.0)
        cosmic: {
          DEFAULT: "#07131F",
          navy: "#07131F",
          indigo: "#0B1D2C",
          purple: "#2F3B59",
          cyan: "#2F7D7E",
          gold: "#C9A24A",
        },
        mystic: {
          DEFAULT: "#7A3430",
          light: "#A75245",
          dark: "#52211F",
        },
        aura: {
          DEFAULT: "#17E8F6",  // Aura Cyan (default)
          blue: "#17E8F6",     // Aura Cyan
          cyan: "#17E8F6",     // Aura Cyan (alias)
          green: "#4ECB71",    // Aura Green
          orange: "#FF8C42",   // Aura Orange
          red: "#FF6B6B",      // Aura Red
          violet: "#9D4EDD",   // Aura Violet
          gold: "#F2C94C",     // Ethereal Gold (aura variant)
        },
        gold: {
          DEFAULT: "#E7B84E",
          light: "#F2D488",
          dark: "#B9861E",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "aura-pulse": {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
        "chakra-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aura-pulse": "aura-pulse 2s ease-in-out infinite",
        "chakra-spin": "chakra-spin 3s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
