import { forwardRef, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends ComponentProps<'input'> {
  onEnter?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, onKeyUp, onEnter, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-[38px] w-full rounded-[9px] border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground hover:border-input-hover focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onKeyUp={(event) => {
        if (event.key === 'Enter') onEnter?.()
        onKeyUp?.(event)
      }}
      {...props}
    />
  )
})
