import { useToast, type ToastType } from '@/lib/toast'
import { cn } from '@/lib/utils'

const dotClass: Record<ToastType, string> = {
  info: 'bg-primary',
  success: 'bg-candy-mint-ink',
  warning: 'bg-candy-lemon-ink',
  error: 'bg-destructive'
}

export function Toaster() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-[200] flex w-[min(340px,calc(100vw-40px))] flex-col gap-2">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto flex items-start gap-2.5 rounded-[10px] border border-border bg-popover px-3.5 py-2.5 text-[12.5px] font-medium text-foreground shadow-pop',
            item.leaving ? 'animate-toast-out' : 'animate-toast-in'
          )}
          role="status"
        >
          <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', dotClass[item.type])} />
          <span className="flex-1 leading-relaxed">{item.text}</span>
          <button
            className="mt-0.5 grid h-4 w-4 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
            type="button"
            aria-label="关闭提示"
            onClick={() => dismissToast(item.id)}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
