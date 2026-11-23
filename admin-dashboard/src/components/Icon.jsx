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
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  lock: 'M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3',
  eye: 'M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  eyeOff: 'M3 3l18 18 M10.6 5.1A12 12 0 0 1 12 5c6.3 0 10 7 10 7a19 19 0 0 1-3 3.8 M6 6.7A21 21 0 0 0 2 12s3.7 7 10 7a11 11 0 0 0 4.4-1 M10 10a3 3 0 0 0 4 4',
}

export default function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.stories} /></svg>
}
