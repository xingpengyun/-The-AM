import { icons, type IconName } from '@/data/icons'
import { cn } from '@/lib/utils'

export interface IcoProps {
  name: IconName
  size?: number | string
  className?: string
}

export default function Ico({ name, size = 16, className }: IcoProps) {
  return (
    <svg
      className={cn('ico', className)}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] || '' }}
    />
  )
}
