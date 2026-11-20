import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { sections } from '../data/sections.js'
import Icon from './Icon.jsx'
import RecordEditor from './RecordEditor.jsx'

const defaultColumns = [
  { key: 'title', label: 'Title / Name', render: (record, section) => <RecordTitle record={record} section={section} /> },
  { key: 'location', label: 'Location', className: 'muted', render: (record) => record.location || '—' },
  { key: 'published', label: 'Status', render: (record) => <PublicationStatus published={record.published} /> },
  { key: 'media', label: 'Media', className: 'muted', render: (record) => `${record.media.length} files` },
]

function getTitle(record) {
  return record.name || record.title || 'Untitled'
}

export function RecordTitle({ record, section, subtitle = section.label }) {
  return (
    <div className="record-title">
      <span className={`content-thumb content-thumb--${section.group.toLowerCase()}`}><Icon name={section.icon} /></span>
      <span><strong>{getTitle(record)}</strong><small>{subtitle}</small></span>
    </div>
  )
}

export function PublicationStatus({ published }) {
  return <span className={`status${published ? ' status--published' : ''}`}>{published ? 'Published' : 'Draft'}</span>
}

export default function RecordCollection({
  sectionId,
  fields,
  description,
  panelClassName = '',
  collectionLabel = 'Your collection',
  searchLabel = 'Search collection',
  searchFields = ['location'],
  filters = [],
  allStatusesLabel = 'All statuses',
  columns = defaultColumns,
  mediaAccept = 'image/*,video/*',
  mediaLabel = 'Add photos or videos',
}) {
  const section = sections.find(({ id }) => id === sectionId)
  const { records, setRecords } = useOutletContext()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [filterValues, setFilterValues] = useState({})
  const [editor, setEditor] = useState(null)
  const [notice, setNotice] = useState('')
  const items = records[section.id]
  const query = search.trim().toLowerCase()
  const visible = items.filter((item) => {
    const searchable = [item.name || item.title, ...searchFields.map((field) => item[field])]
    const matchesSearch = searchable.join(' ').toLowerCase().includes(query)
    const matchesPublication = filter === 'all' || item.published === (filter === 'published')
    const matchesFilters = Object.entries(filterValues).every(([field, value]) => !value || item[field] === value)
    return matchesSearch && matchesPublication && matchesFilters
  })

  function newRecord() {
    setNotice('')
    setEditor({ record: null })
  }

  function clearFilters() {
    setSearch('')
    setFilter('all')
    setFilterValues({})
  }

  function save(record) {
    setRecords((current) => ({
      ...current,
      [section.id]: editor.record
        ? current[section.id].map((item) => item.id === record.id ? record : item)
        : [...current[section.id], record],
    }))
    setEditor(null)
    setNotice('Saved to this preview. Reloading the page resets your changes.')
  }

  function remove(record) {
    if (!window.confirm(`Remove “${getTitle(record)}” from this preview?`)) return
    setRecords((current) => ({ ...current, [section.id]: current[section.id].filter((item) => item.id !== record.id) }))
    setNotice('Removed from this preview.')
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{section.label}</h1>
          {description && <p className="page-heading__description muted">{description}</p>}
        </div>
        <button className="button button--primary" onClick={newRecord}>
          <Icon name="plus" size={17} />New {section.singular}
        </button>
      </div>
      <section className={`panel collection-panel${panelClassName ? ` ${panelClassName}` : ''}`} aria-label={`${section.label} records`}>
        <div className="collection-toolbar">
          <div className="collection-toolbar__count">
            <strong>{collectionLabel}</strong><span className="count">{items.length}</span>
          </div>
          <div className="collection-toolbar__filters">
            <label className="search-field">
              <Icon name="search" size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchLabel}
                aria-label={searchLabel}
              />
            </label>
            {filters.map(({ name, label, all, options }) => (
              <label key={name}>
                <span className="sr-only">{label}</span>
                <select value={filterValues[name] || ''} onChange={(event) => {
                  setFilterValues({ ...filterValues, [name]: event.target.value })
                }}>
                  <option value="">{all}</option>
                  {options.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ))}
            <label>
              <span className="sr-only">Publication status</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">{allStatusesLabel}</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </label>
          </div>
        </div>
        {notice && <p className="notice collection-notice" role="status">{notice}</p>}
        {visible.length ? (
          <div className="table-wrap">
            <table role="table">
              <thead role="rowgroup">
                <tr role="row">
                  {columns.map(({ key, label }) => <th key={key} scope="col">{label}</th>)}
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {visible.map((record) => {
                  const title = getTitle(record)
                  return (
                    <tr key={record.id} role="row">
                      {columns.map(({ key, label, className, render }) => (
                        <td key={key} role="cell" data-label={label} className={className}>{render(record, section)}</td>
                      ))}
                      <td role="cell">
                        <div className="row-actions">
                          <button className="button button--small button--outline" aria-label={`Edit ${title}`} onClick={() => setEditor({ record })}>Edit</button>
                          <button className="button button--small button--danger" aria-label={`Remove ${title}`} onClick={() => remove(record)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon"><Icon name={section.icon} size={30} /></span>
            <h2>{items.length ? 'Nothing matches just yet.' : `Your next ${section.singular} starts here.`}</h2>
            <p className="muted">{items.length ? 'Try another search or adjust the filters.' : 'Add an item to get started.'}</p>
            {items.length
              ? <button className="button button--outline" onClick={clearFilters}>Clear filters</button>
              : <button className="button button--primary" onClick={newRecord}>New {section.singular}<Icon name="plus" size={16} /></button>}
          </div>
        )}
        <footer className="collection-footer">{visible.length} of {items.length} items</footer>
      </section>
      {editor && (
        <RecordEditor
          singular={section.singular}
          fields={fields}
          mediaAccept={mediaAccept}
          mediaLabel={mediaLabel}
          record={editor.record}
          onSave={save}
          onClose={() => setEditor(null)}
        />
      )}
    </>
  )
}
