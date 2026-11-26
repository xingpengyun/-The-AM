import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const cardVariants = cva('rounded-[var(--radius)] border shadow-card', {
  variants: {
    tone: {
      plain: 'border-border bg-card text-card-foreground',
      mint: 'border-border bg-[linear-gradient(135deg,var(--candy-mint),var(--candy-fade)_74%)] text-card-foreground',
      peach: 'border-border bg-[linear-gradient(135deg,var(--candy-peach),var(--candy-fade)_74%)] text-card-foreground',
      lemon: 'border-border bg-[linear-gradient(135deg,var(--candy-lemon),var(--candy-fade)_74%)] text-card-foreground',
      sakura: 'border-border bg-[linear-gradient(135deg,var(--candy-sakura),var(--candy-fade)_74%)] text-card-foreground',
      lavender: 'border-border bg-[linear-gradient(135deg,var(--candy-lavender),var(--candy-fade)_74%)] text-card-foreground',
      sky: 'border-border bg-[linear-gradient(135deg,var(--candy-sky),var(--candy-fade)_74%)] text-card-foreground'
    }
  },
  defaultVariants: { tone: 'plain' }
})

export type CardTone = VariantProps<typeof cardVariants>['tone']

export interface CardProps extends ComponentProps<'section'>, VariantProps<typeof cardVariants> {}

export function Card({ tone = 'plain', className, children, ...props }: CardProps) {
  return (
    <section className={cn(cardVariants({ tone }), className)} {...props}>
      {children}
    </section>
  )
}
