import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/*
 * Tailwind 主题令牌：所有颜色 / 圆角 / 阴影都从 CSS 变量读取，
 * 具体色值集中在 src/styles/tailwind.css 的 :root 里维护。
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: {
          DEFAULT: 'var(--input)',
          hover: 'var(--input-hover)'
        },
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
          soft: 'var(--destructive-soft)',
          ink: 'var(--destructive-ink)'
        },
        candy: {
          mint: 'var(--candy-mint)',
          'mint-ink': 'var(--candy-mint-ink)',
          peach: 'var(--candy-peach)',
          'peach-ink': 'var(--candy-peach-ink)',
          lemon: 'var(--candy-lemon)',
          'lemon-ink': 'var(--candy-lemon-ink)',
          sakura: 'var(--candy-sakura)',
          'sakura-ink': 'var(--candy-sakura-ink)',
          lavender: 'var(--candy-lavender)',
          'lavender-ink': 'var(--candy-lavender-ink)',
          sky: 'var(--candy-sky)',
          'sky-ink': 'var(--candy-sky-ink)'
        },
        login: {
          field: 'var(--login-field)',
          'field-strong': 'var(--login-field-strong)',
          border: 'var(--login-border)',
          'border-hover': 'var(--login-border-hover)',
          ink: 'var(--login-ink)',
          placeholder: 'var(--login-placeholder)',
          focus: 'var(--login-focus)',
          ring: 'var(--login-ring)'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 6px)',
        sm: 'calc(var(--radius) - 10px)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
        button: 'var(--shadow-button)'
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(-6px) scale(.98)' },
          to: { opacity: '1', transform: 'none' }
        },
        'toast-out': {
          from: { opacity: '1', transform: 'none' },
          to: { opacity: '0', transform: 'translateY(-4px) scale(.98)' }
        }
      },
      animation: {
        'toast-in': 'toast-in .2s cubic-bezier(.22,.68,.3,1)',
        'toast-out': 'toast-out .16s ease-in forwards'
      }
    }
  },
  plugins: [animate]
} satisfies Config
