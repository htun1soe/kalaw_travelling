import RecordCollection from '../components/RecordCollection.jsx'

const fields = [{ name: 'title', label: 'Title' }]

export default function HomeGallery() {
  return <RecordCollection sectionId="home-gallery" fields={fields} mediaAccept="image/*" />
}
