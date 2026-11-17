import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        affirmative: {
          DEFAULT: 'hsl(var(--action-affirmative))',
          foreground: 'hsl(var(--action-affirmative-foreground))',
        },
        negative: {
          DEFAULT: 'hsl(var(--action-negative))',
          foreground: 'hsl(var(--action-negative-foreground))',
        },
        caution: {
          DEFAULT: 'hsl(var(--action-caution))',
          foreground: 'hsl(var(--action-caution-foreground))',
        },
        brand: {
          DEFAULT: 'hsl(var(--brand-purple))',
          dark: 'hsl(var(--brand-purple-dark))',
          darker: 'hsl(var(--brand-purple-darker))',
          tint: 'hsl(var(--brand-tint))',
          'tint-border': 'hsl(var(--brand-tint-border))',
          'accent-border': 'hsl(var(--brand-accent-border))',
          label: 'hsl(var(--brand-label))',
        },
        'form-label': 'hsl(var(--form-label))',
        status: {
          'success-bg': 'hsl(var(--status-success-bg))',
          'success-fg': 'hsl(var(--status-success-fg))',
          'success-border': 'hsl(var(--status-success-border))',
          'success-dot': 'hsl(var(--status-success-dot))',
          'warning-bg': 'hsl(var(--status-warning-bg))',
          'warning-fg': 'hsl(var(--status-warning-fg))',
          'warning-border': 'hsl(var(--status-warning-border))',
          'warning-dot': 'hsl(var(--status-warning-dot))',
          'danger-bg': 'hsl(var(--status-danger-bg))',
          'danger-fg': 'hsl(var(--status-danger-fg))',
          'danger-border': 'hsl(var(--status-danger-border))',
          'danger-dot': 'hsl(var(--status-danger-dot))',
          'danger-meta': 'hsl(var(--status-danger-meta))',
          'neutral-bg': 'hsl(var(--status-neutral-bg))',
          'neutral-fg': 'hsl(var(--status-neutral-fg))',
          'neutral-border': 'hsl(var(--status-neutral-border))',
          'neutral-dot': 'hsl(var(--status-muted))',
          'info-bg': 'hsl(var(--status-info-bg))',
          'info-fg': 'hsl(var(--status-info-fg))',
          muted: 'hsl(var(--status-muted))',
          divider: 'hsl(var(--status-divider))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'collapsible-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-collapsible-content-height)',
          },
        },
        'collapsible-up': {
          from: {
            height: 'var(--radix-collapsible-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
