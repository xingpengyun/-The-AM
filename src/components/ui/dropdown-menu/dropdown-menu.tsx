import type { ReactNode } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import Ico from '@/components/Ico'
import { cn } from '@/lib/utils'
import type { MenuItem } from './types'

export interface DropdownMenuProps {
  items: MenuItem[]
  align?: 'start' | 'center' | 'end'
  className?: string
  onSelect?: (key: string) => void
  children: ReactNode
}

export function DropdownMenu({ items, align = 'end', className, onSelect, children }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{children}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={8}
          className={cn(
            'z-[120] min-w-[196px] rounded-[10px] border border-border bg-popover p-1.5 text-popover-foreground shadow-pop focus:outline-none',
            className
          )}
        >
          {items.map((item) =>
            item.separator ? (
              <DropdownMenuPrimitive.Separator key={item.key} className="-mx-1 my-1 h-px bg-border" />
            ) : (
              <DropdownMenuPrimitive.Item
                key={item.key}
                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-[12.5px] font-medium text-foreground outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                onSelect={() => onSelect?.(item.key)}
              >
                {item.icon ? <Ico name={item.icon} size={15} className="text-muted-foreground" /> : null}
                <span>{item.label}</span>
              </DropdownMenuPrimitive.Item>
            )
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
