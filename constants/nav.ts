export interface NavItem {
  label: string
  href: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'home', href: '/' },
  { label: 'about', href: '/about' },
  { label: 'works', href: '/works' },
]
