import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { housingApi } from '../services/housing.js'

const purposes = ['For sale', 'For rent']
const availability = ['Available', 'Reserved', 'Closed']
const propertyTypes = ['House', 'Apartment', 'Condo', 'Land', 'Other']

let rowKey = 0
const blankContact = () => ({ key: `new-${rowKey++}`, name: '', phonenumber: '', address: '' })

function HousingEditor({ record, onSaved, onClose }) {
  const dialog = useRef(null)
  const [draft, setDraft] = useState(() => ({
    title: record?.title || '', area: record?.area || '', price: record?.price || '',
    description: record?.description || '', purpose: record?.purpose || '',
    type: record?.type || '', availability: record?.availability || '',
  }))
  const [contacts, setContacts] = useState(() => (record?.contacts || []).map((c) => ({ ...c, key: `c-${c.id}` })))
  const [images] = useState(record?.images || [])
  const [removed, setRemoved] = useState([])
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current.showModal() }, [])

  const update = (event) => setDraft((current) => ({ ...current, [event.target.name]: event.target.value }))
  const updateContact = (key, field, value) => setContacts((rows) => rows.map((row) => row.key === key ? { ...row, [field]: value } : row))

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const form = new FormData()
    Object.entries(draft).forEach(([name, value]) => form.append(name, value))
    contacts
      .filter((c) => c.name.trim() || c.phonenumber.trim() || (c.address || '').trim())
      .forEach((c, index) => {
        form.append(`contacts[${index}][name]`, c.name)
        form.append(`contacts[${index}][phonenumber]`, c.phonenumber)
        form.append(`contacts[${index}][address]`, c.address || '')
      })
    files.forEach((file) => form.append('images[]', file))
    removed.forEach((id) => form.append('remove_image_ids[]', id))
    try {
      const saved = record ? await housingApi.update(record.id, form) : await housingApi.create(form)
      onSaved(saved, Boolean(record))
    } catch (requestError) {
      setError(requestError.message)
      setSaving(false)
    }
  }

  const select = (name, label, options) => (
    <label>{label}
      <select name={name} value={draft[name]} onChange={update}>
        <option value="">Choose {label.toLowerCase()}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )

  return (
    <dialog className="editor-dialog" ref={dialog} onCancel={(event) => { event.preventDefault(); onClose() }} aria-labelledby="editor-title">
      <div className="editor-dialog__header">
        <h2 id="editor-title">{record ? 'Edit' : 'New'} listing</h2>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close editor"><Icon name="close" /></button>
      </div>
      <form onSubmit={save}>
        {error && <p className="notice notice--error" role="alert">{error}</p>}
        <div className="editor-fields">
          <label>Title<input name="title" value={draft.title} onChange={update} required maxLength={255} /></label>
          <label>Area<input name="area" value={draft.area} onChange={update} required maxLength={255} /></label>
          <label>Price<input name="price" value={draft.price} onChange={update} maxLength={255} placeholder="MMK 750,000 / month" /></label>
          {select('purpose', 'Listing purpose', purposes)}
          {select('type', 'Property type', propertyTypes)}
          {select('availability', 'Availability', availability)}
          <label>Description<textarea name="description" value={draft.description} onChange={update} rows={4} maxLength={5000} /></label>
        </div>

        <fieldset className="contact-section">
          <legend>Contacts</legend>
          {contacts.length === 0 && <p className="small muted">No contacts yet. Add one so visitors can reach out.</p>}
          {contacts.map((contact, index) => (
            <div className="contact-row" key={contact.key}>
              <label>Name<input value={contact.name} onChange={(e) => updateContact(contact.key, 'name', e.target.value)} maxLength={255} required /></label>
              <label>Phone number<input type="tel" value={contact.phonenumber} onChange={(e) => updateContact(contact.key, 'phonenumber', e.target.value)} maxLength={50} required /></label>
              <label>Address<input value={contact.address || ''} onChange={(e) => updateContact(contact.key, 'address', e.target.value)} maxLength={500} /></label>
              <button type="button" className="button button--small button--danger" aria-label={`Remove contact ${index + 1}`}
                onClick={() => setContacts((rows) => rows.filter((row) => row.key !== contact.key))}>Remove</button>
            </div>
          ))}
          <button type="button" className="button button--small button--outline" onClick={() => setContacts((rows) => [...rows, blankContact()])}>
            <Icon name="plus" size={15} />Add contact
          </button>
        </fieldset>

        <label className="upload-field">
          <Icon name="gallery" />
          <strong>Add property photos</strong>
          <span>JPG, PNG or WebP, up to 5 MB each</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        </label>
        {files.length > 0 && <p className="small muted selected-files">To upload: {files.map((f) => f.name).join(', ')}</p>}
        {images.length > 0 && (
          <div className="photo-grid">
            {images.map((image) => {
              const gone = removed.includes(image.id)
              return (
                <figure key={image.id} className={gone ? 'is-removed' : ''}>
                  <img src={image.url} alt="" />
                  <button type="button" className="button button--small button--outline"
                    onClick={() => setRemoved((ids) => gone ? ids.filter((id) => id !== image.id) : [...ids, image.id])}>
                    {gone ? 'Keep' : 'Remove'}
                  </button>
                </figure>
              )
            })}
          </div>
        )}

        <div className="editor-dialog__actions">
          <button className="button button--outline" type="button" onClick={onClose}>Cancel</button>
          <button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save listing'}<Icon name="check" size={16} /></button>
        </div>
      </form>
    </dialog>
  )
}

export default function Housing() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const [purpose, setPurpose] = useState('')
  const [avail, setAvail] = useState('')
  const [editor, setEditor] = useState(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(() => {
    setStatus('loading')
    housingApi.list().then((data) => { setItems(data); setStatus('ready') }, (error) => { setNotice(error.message); setStatus('error') })
  }, [])
  useEffect(() => { load() }, [load])

  const query = search.trim().toLowerCase()
  const visible = items.filter((item) =>
    [item.title, item.area, item.type, item.purpose].join(' ').toLowerCase().includes(query)
    && (!purpose || item.purpose === purpose) && (!avail || item.availability === avail))

  function saved(record, isEdit) {
    setItems((current) => isEdit ? current.map((item) => item.id === record.id ? record : item) : [record, ...current])
    setEditor(null)
    setNotice('Listing saved to the database.')
  }

  async function remove(record) {
    if (!window.confirm(`Delete “${record.title}” and its contacts and photos?`)) return
    try {
      await housingApi.remove(record.id)
      setItems((current) => current.filter((item) => item.id !== record.id))
      setNotice('Listing deleted.')
    } catch (error) { setNotice(error.message) }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Housing</h1>
          <p className="page-heading__description muted">Manage property listings stored in the kalaw_db database.</p>
        </div>
        <button className="button button--primary" onClick={() => { setNotice(''); setEditor({ record: null }) }}><Icon name="plus" size={17} />New listing</button>
      </div>
      <section className="panel collection-panel collection-panel--housing" aria-label="Housing records">
        <div className="collection-toolbar">
          <div className="collection-toolbar__count"><strong>Property listings</strong><span className="count">{items.length}</span></div>
          <div className="collection-toolbar__filters">
            <label className="search-field"><Icon name="search" size={17} />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search properties" aria-label="Search properties" />
            </label>
            <label><span className="sr-only">Listing purpose</span>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}><option value="">Sale or rent</option>{purposes.map((o) => <option key={o}>{o}</option>)}</select>
            </label>
            <label><span className="sr-only">Availability</span>
              <select value={avail} onChange={(e) => setAvail(e.target.value)}><option value="">All availability</option>{availability.map((o) => <option key={o}>{o}</option>)}</select>
            </label>
          </div>
        </div>
        {notice && <p className="notice collection-notice" role="status">{notice}</p>}
        {status === 'loading' && <p className="muted collection-notice">Loading listings…</p>}
        {status === 'error' && <div className="empty-state"><button className="button button--outline" onClick={load}>Try again</button></div>}
        {status === 'ready' && (visible.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th scope="col">Property</th><th scope="col">Listing</th><th scope="col">Price</th>
                <th scope="col">Availability</th><th scope="col">Contacts</th><th scope="col">Photos</th>
                <th><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody>
                {visible.map((record) => (
                  <tr key={record.id}>
                    <td data-label="Property"><div className="record-title">
                      <span className="content-thumb content-thumb--places"><Icon name="housing" /></span>
                      <span><strong>{record.title}</strong><small>{record.area}</small></span>
                    </div></td>
                    <td data-label="Listing" className="housing-listing-kind">{record.purpose || '—'}<small className="muted">{record.type}</small></td>
                    <td data-label="Price" className="muted">{record.price || '—'}</td>
                    <td data-label="Availability" className="muted">{record.availability || '—'}</td>
                    <td data-label="Contacts" className="muted">{record.contacts.length}</td>
                    <td data-label="Photos" className="muted">{record.images.length}</td>
                    <td><div className="row-actions">
                      <button className="button button--small button--outline" aria-label={`Edit ${record.title}`} onClick={() => { setNotice(''); setEditor({ record }) }}>Edit</button>
                      <button className="button button--small button--danger" aria-label={`Delete ${record.title}`} onClick={() => remove(record)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon"><Icon name="housing" size={30} /></span>
            <h2>{items.length ? 'Nothing matches just yet.' : 'Your first listing starts here.'}</h2>
            {!items.length && <button className="button button--primary" onClick={() => setEditor({ record: null })}>New listing<Icon name="plus" size={16} /></button>}
          </div>
        ))}
        <footer className="collection-footer">{visible.length} of {items.length} items</footer>
      </section>
      {editor && <HousingEditor record={editor.record} onSaved={saved} onClose={() => setEditor(null)} />}
    </>
  )
}
