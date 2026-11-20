import RecordCollection from '../components/RecordCollection.jsx'

const fields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'headline', label: 'Headline' },
]

export default function HomeStories() {
  return <RecordCollection sectionId="home-stories" fields={fields} />
}
