import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

export default function RecordEditor({ singular, fields, mediaAccept, mediaLabel, record, onSave, onClose }) {
  const dialog = useRef(null)
  const [draft, setDraft] = useState(() => ({ ...Object.fromEntries(fields.map(({ name }) => [name, ''])), published: false, ...record }))
  const [files, setFiles] = useState([])
  useEffect(() => { dialog.current.showModal() }, [])

  function update(event) {
    const { name, value, type, checked } = event.target
    setDraft((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  function save(event) {
    event.preventDefault()
    onSave({ ...draft, id: record?.id || crypto.randomUUID(), media: [...(record?.media || []), ...files.map((file) => file.name)] })
  }

  function renderField({ name, label, type = 'text', options, hint, ...attributes }) {
    const props = { ...attributes, name, value: draft[name], onChange: update }
    let control
    if (options) {
      control = (
        <select {...props}>
          <option value="">Choose {label.toLowerCase()}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      )
    } else if (type === 'textarea') {
      control = <textarea {...props} rows={4} />
    } else {
      control = <input {...props} type={type} />
    }

    return (
      <label key={name}>
        {label}
        {control}
        {hint && <small className="muted">{hint}</small>}
      </label>
    )
  }

  return (
    <dialog className="editor-dialog" ref={dialog} onCancel={(event) => { event.preventDefault(); onClose() }} aria-labelledby="editor-title">
      <div className="editor-dialog__header">
        <h2 id="editor-title">{record ? 'Edit' : 'New'} {singular}</h2>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close editor">
          <Icon name="close" />
        </button>
      </div>
      <form onSubmit={save}>
        <p className="editor-dialog__note">Preview only. This draft and any selected filenames stay in memory; files are not uploaded.</p>
        <div className="editor-fields">{fields.map(renderField)}</div>
        <label className="upload-field">
          <Icon name="gallery" />
          <strong>{mediaLabel}</strong>
          <span>Choose files for the preview</span>
          <input type="file" accept={mediaAccept} multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
        </label>
        {(files.length > 0 || record?.media?.length > 0) && <p className="small muted selected-files">Selected: {[...(record?.media || []), ...files.map((file) => file.name)].join(', ')}</p>}
        <label className="checkbox-field"><input type="checkbox" name="published" checked={draft.published} onChange={update} />Mark as published in this preview</label>
        <div className="editor-dialog__actions"><button className="button button--outline" type="button" onClick={onClose}>Cancel</button><button className="button button--primary" type="submit">Save preview<Icon name="check" size={16} /></button></div>
      </form>
    </dialog>
  )
}
