import type { IconName } from '@/data/icons'

export interface MenuItem {
  key: string
  label?: string
  icon?: IconName
  separator?: boolean
}
