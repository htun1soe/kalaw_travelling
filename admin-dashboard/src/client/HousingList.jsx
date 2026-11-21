import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { housingApi } from '../services/housing.js'

export default function HousingList() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [view, setView] = useState('listings')
  const [query, setQuery] = useState('')
  const [purpose, setPurpose] = useState('')

  useEffect(() => {
    housingApi.list().then((data) => { setItems(data); setStatus('ready') }, () => setStatus('error'))
  }, [])

  if (status === 'loading') return <p className="client__note">Loading homes…</p>
  if (status === 'error') return <p className="client__note">We couldn’t load the listings. Please try again later.</p>

  const q = query.trim().toLowerCase()
  const shown = items.filter((i) => [i.title, i.area, i.type].join(' ').toLowerCase().includes(q) && (!purpose || i.purpose === purpose))
  const photos = shown.flatMap((i) => i.images.map((image) => ({ ...image, listing: i })))

  return (
    <>
      <div className="client__bar">
        <h1>Homes in Kalaw</h1>
        <div className="client__tabs" role="tablist">
          {['listings', 'gallery'].map((name) => (
            <button key={name} role="tab" aria-selected={view === name} className={view === name ? 'is-active' : ''} onClick={() => setView(name)}>
              {name === 'listings' ? 'Listings' : 'Gallery'}
            </button>
          ))}
        </div>
      </div>
      <div className="client__filters">
        <input type="search" placeholder="Search by title or area" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search homes" />
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} aria-label="Sale or rent">
          <option value="">Sale or rent</option><option>For sale</option><option>For rent</option>
        </select>
      </div>

      {view === 'listings' ? (
        shown.length ? (
          <ul className="client__grid">
            {shown.map((item) => (
              <li key={item.id}>
                <Link to={`/housing/${item.id}`} className="card">
                  {item.images[0] ? <img src={item.images[0].url} alt={item.title} loading="lazy" /> : <div className="card__empty">No photo</div>}
                  <div className="card__body">
                    {item.purpose && <span className="badge">{item.purpose}</span>}
                    <h2>{item.title}</h2>
                    <p>{item.area}</p>
                    <strong>{item.price || 'Contact for price'}</strong>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="client__note">No homes match your search.</p>
      ) : (
        photos.length ? (
          <ul className="client__gallery">
            {photos.map((photo) => (
              <li key={photo.id}>
                <Link to={`/housing/${photo.listing.id}`}>
                  <img src={photo.url} alt={photo.listing.title} loading="lazy" />
                  <span>{photo.listing.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="client__note">No photos yet.</p>
      )}
    </>
  )
}
