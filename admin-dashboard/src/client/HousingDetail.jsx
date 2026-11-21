import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { housingApi } from '../services/housing.js'

export default function HousingDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [status, setStatus] = useState('loading')
  const [active, setActive] = useState(0)

  useEffect(() => {
    setStatus('loading')
    housingApi.get(id).then((data) => { setItem(data); setActive(0); setStatus('ready') }, (e) => setStatus(e.status === 404 ? 'missing' : 'error'))
  }, [id])

  if (status === 'loading') return <p className="client__note">Loading…</p>
  if (status !== 'ready') return <p className="client__note">{status === 'missing' ? 'This listing no longer exists.' : 'We couldn’t load this listing.'} <Link to="/housing">Back to all homes</Link></p>

  return (
    <article className="detail">
      <Link to="/housing" className="detail__back">← All homes</Link>
      <div className="detail__layout">
        <section aria-label="Photos">
          {item.images.length ? (
            <>
              <img className="detail__main" src={item.images[active].url} alt={item.title} />
              {item.images.length > 1 && (
                <ul className="detail__thumbs">
                  {item.images.map((image, index) => (
                    <li key={image.id}>
                      <button className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`Show photo ${index + 1}`}>
                        <img src={image.url} alt="" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : <div className="card__empty detail__main">No photos yet</div>}
        </section>
        <section>
          {item.purpose && <span className="badge">{item.purpose}</span>}
          <h1>{item.title}</h1>
          <p className="detail__area">{item.area}</p>
          <p className="detail__price">{item.price || 'Contact for price'}</p>
          <dl className="detail__facts">
            {item.type && <><dt>Type</dt><dd>{item.type}</dd></>}
            {item.availability && <><dt>Availability</dt><dd>{item.availability}</dd></>}
          </dl>
          {item.description && <p className="detail__description">{item.description}</p>}
          <h2>Contact</h2>
          {item.contacts.length ? (
            <ul className="detail__contacts">
              {item.contacts.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>
                  <a href={`tel:${c.phonenumber.replace(/[^\d+]/g, '')}`}>{c.phonenumber}</a>
                  {c.address && <span>{c.address}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="muted">No contact details have been added yet.</p>}
        </section>
      </div>
    </article>
  )
}
