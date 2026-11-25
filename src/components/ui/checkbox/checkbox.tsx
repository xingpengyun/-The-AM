import type { ComponentProps } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<ComponentProps<typeof CheckboxPrimitive.Root>, 'checked' | 'onCheckedChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({ checked = false, onCheckedChange, className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(value) => onCheckedChange?.(value === true)}
      className={cn(
        'peer grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border border-login-border bg-login-field text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center">
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
