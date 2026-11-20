export default function Brand({ light = false }) {
  return (
    <span className={`brand${light ? ' brand--light' : ''}`}>
      <span className="brand__mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 4 9 19h6L6 30h12v6h4v-6h12l-9-11h6L20 4Z" fill="currentColor" /></svg></span>
      <span>Kalaw<span className="brand__caption">TRAVELLING · SUPER-ADMIN</span></span>
    </span>
  )
}
