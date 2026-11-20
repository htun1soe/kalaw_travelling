export const sections = [
  { id: 'home-gallery', label: 'Home gallery', singular: 'slide', icon: 'gallery', group: 'Home' },
  { id: 'home-stories', label: 'Home stories', singular: 'story', icon: 'stories', group: 'Home' },
  { id: 'trending', label: 'Trending', singular: 'story', icon: 'trending', group: 'Home' },
  { id: 'housing', label: 'Housing', singular: 'listing', icon: 'housing', group: 'Places' },
]

export const mapLinkField = {
  name: 'mapUrl',
  label: 'Google Maps link',
  type: 'url',
  maxLength: 2048,
  placeholder: 'https://maps.app.goo.gl/...',
  hint: 'Optional Google Maps share link.',
}

const sample = (id, title, location, published, extra = {}) => ({ id, title, location, published, media: [], ...extra })

// These records are only UI examples. No browser storage or server writes occur.
export function createSampleRecords() {
  return {
    'home-gallery': [sample('slide-1', 'Morning in the hills', '', true), sample('slide-2', 'A slower kind of day', '', true)],
    'home-stories': [sample('story-1', 'A walk through Kalaw', '', true, { headline: 'The town, at your own pace' }), sample('story-2', 'Meet the makers', '', false)],
    trending: [sample('trend-1', 'This weekend in Kalaw', 'Town centre', true), sample('trend-2', 'A new trail to explore', '', false)],
    housing: [
      sample('house-1', 'A home among the pines', 'Pine Hill, Kalaw', true, {
        purpose: 'For sale', type: 'House', availability: 'Available', size: '1,200 sq ft', price: 'Contact for price',
      }),
      sample('house-2', 'Apartment near the market', 'Central Kalaw', true, {
        purpose: 'For rent', type: 'Apartment', availability: 'Reserved', size: '650 sq ft', price: 'MMK 750,000 / month',
      }),
      sample('house-3', 'Plot overlooking the valley', 'Outskirts of Kalaw', false, {
        purpose: 'For sale', type: 'Land', availability: 'Available', size: '4,800 sq ft', price: 'Contact for price',
      }),
    ],
  }
}
