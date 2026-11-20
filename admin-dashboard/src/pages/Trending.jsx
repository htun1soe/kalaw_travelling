import RecordCollection from '../components/RecordCollection.jsx'
import { mapLinkField } from '../data/sections.js'

const fields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'summary', label: 'Summary', type: 'textarea' },
  { name: 'category', label: 'Category' },
  mapLinkField,
]

export default function Trending() {
  return <RecordCollection sectionId="trending" fields={fields} mediaAccept="image/*" />
}
