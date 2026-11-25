import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type AlertVariant = 'error' | 'info' | 'success'

const tone: Record<AlertVariant, string> = {
  error: 'border-destructive/30 bg-destructive-soft text-destructive-ink',
  info: 'border-border bg-muted text-foreground',
  success: 'border-transparent bg-candy-mint text-candy-mint-ink'
}

export interface AlertProps extends ComponentProps<'div'> {
  variant?: AlertVariant
}

export function Alert({ variant = 'info', className, children, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn('rounded-[10px] border px-3 py-2.5 text-[12px] font-medium', tone[variant], className)} {...props}>
      {children}
    </div>
  )
}
