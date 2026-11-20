import RecordCollection, { PublicationStatus, RecordTitle } from '../components/RecordCollection.jsx'
import { mapLinkField } from '../data/sections.js'

const purposes = ['For sale', 'For rent']
const availability = ['Available', 'Reserved', 'Closed']
const propertyTypes = ['House', 'Apartment', 'Condo', 'Land', 'Other']

const fields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'location', label: 'Location' },
  { name: 'purpose', label: 'Listing purpose', options: purposes, required: true },
  { name: 'type', label: 'Property type', options: propertyTypes, required: true },
  { name: 'availability', label: 'Availability', options: availability, required: true },
  { name: 'size', label: 'Size' },
  { name: 'price', label: 'Price' },
  mapLinkField,
  { name: 'description', label: 'Description', type: 'textarea' },
]

const filters = [
  { name: 'purpose', label: 'Listing purpose', all: 'Sale or rent', options: purposes },
  { name: 'availability', label: 'Availability', all: 'All availability', options: availability },
]

const columns = [
  {
    key: 'title',
    label: 'Property',
    render: (record, section) => <RecordTitle record={record} section={section} subtitle={record.location || '—'} />,
  },
  {
    key: 'purpose',
    label: 'Listing',
    className: 'housing-listing-kind',
    render: (record) => <>{record.purpose || '—'}<small className="muted">{record.type}</small></>,
  },
  { key: 'price', label: 'Price', className: 'muted', render: (record) => record.price || '—' },
  { key: 'availability', label: 'Availability', className: 'muted', render: (record) => record.availability || '—' },
  { key: 'published', label: 'Visibility', render: (record) => <PublicationStatus published={record.published} /> },
  { key: 'media', label: 'Photos', className: 'muted', render: (record) => record.media.length },
]

export default function Housing() {
  return (
    <RecordCollection
      sectionId="housing"
      fields={fields}
      description="Manage property listings for sale and rent."
      panelClassName="collection-panel--housing"
      collectionLabel="Property listings"
      searchLabel="Search properties"
      searchFields={['location', 'type', 'purpose']}
      filters={filters}
      allStatusesLabel="All visibility"
      columns={columns}
      mediaAccept="image/*"
      mediaLabel="Add property photos"
    />
  )
}
