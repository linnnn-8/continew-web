import {
  BookOpen,
  Briefcase,
  Calendar,
  Cloud,
  Heart,
  Home,
  Leaf,
  Moon,
  Music,
  Pencil,
  Star,
  Sun,
  type LucideIcon,
} from 'lucide-react'

/** F-01-1 공간 아이콘(선택). 공간 데이터에는 키만 저장한다 */
export const SPACE_ICONS: Record<string, LucideIcon> = {
  cloud: Cloud,
  calendar: Calendar,
  book: BookOpen,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  moon: Moon,
  sun: Sun,
  home: Home,
  music: Music,
  pencil: Pencil,
  leaf: Leaf,
}

export function SpaceIcon({ name, size = 20 }: { name?: string; size?: number }) {
  const Icon = (name && SPACE_ICONS[name]) || Cloud
  return <Icon size={size} strokeWidth={2} aria-hidden />
}
