import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-button hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-[38px] rounded-[9px] px-4 text-[13px]',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-[10px] px-6 text-[13px] tracking-[0.06em]',
        icon: 'h-9 w-9 rounded-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export type ButtonVariant = VariantProps<typeof buttonVariants>

export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  block?: boolean
  loading?: boolean
}

export function Button({
  variant = 'default',
  size = 'default',
  type = 'button',
  block = false,
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), block && 'w-full', className)}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21.5 12A9.5 9.5 0 0 0 12 2.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
