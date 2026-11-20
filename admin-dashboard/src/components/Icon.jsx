const paths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  gallery: 'M3 3h18v18H3z M3 16l5-5 5 5 3-3 5 5 M8 7h.01',
  stories: 'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h5',
  trending: 'M3 17l6-6 4 4 8-10 M15 5h6v6',
  housing: 'M3 10l9-7 9 7v11H3z M9 21v-8h6v8',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  plus: 'M12 5v14 M5 12h14',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'M6 6l12 12 M6 18L18 6',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  logout: 'M9 3H3v18h6 M9 12h12 M16 7l5 5-5 5',
  check: 'M4 12l5 5L20 6',
  edit: 'M14 4l6 6 M3 21l5-1L21 7l-6-6L2 14z',
}

export default function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.stories} /></svg>
}
