import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { sections } from '../data/sections.js'

const chartSamples = {
  Week: [30, 44, 36, 62, 49, 78, 65],
  Month: [20, 35, 28, 42, 38, 48, 58, 44, 62, 55, 77, 63, 70, 85],
}

export default function OverviewPage() {
  const { records } = useOutletContext()
  const [period, setPeriod] = useState('Week')
  const allRecords = Object.values(records).flat()
  const published = allRecords.filter((record) => record.published).length
  const stats = [
    { label: 'Housing listings', value: records.housing.length, note: 'Properties in your collection', icon: 'housing' },
    { label: 'Stories to tell', value: records['home-stories'].length + records.trending.length, note: 'Home stories and trending', icon: 'stories' },
    { label: 'Published content', value: published, note: `${allRecords.length - published} drafts in your workspace`, icon: 'check' },
  ]
  const recent = sections.flatMap((section) => records[section.id].slice(0, 1).map((record) => ({ ...record, section })))
  return (
    <>
      <div className="page-heading">
        <h1>Overview</h1>
        <Link className="button button--primary" to="/dashboard/home-stories">
          Manage stories<Icon name="arrow" size={17} />
        </Link>
      </div>
      <section className="stats-grid" aria-label="Sample content statistics">{stats.map((stat) => <article className="stat-card" key={stat.label}><div className="stat-card__label">{stat.label}<span><Icon name={stat.icon} size={18} /></span></div><strong>{String(stat.value).padStart(2, '0')}</strong><p>{stat.note}</p></article>)}</section>
      <div className="overview-grid">
        <section className="panel visit-panel">
          <div className="section-heading">
            <h2>Visitor activity</h2>
            <label className="period-select">
              <span className="sr-only">Chart period</span>
              <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                <option>Week</option>
                <option>Month</option>
              </select>
            </label>
          </div>
          <div className="visit-panel__number">1,284<span className="pill">Sample data</span></div>
          <div className="bar-chart" role="img" aria-label={`Sample visitor activity for one ${period.toLowerCase()}`}>
            {chartSamples[period].map((height, index) => (
              <div key={index}>
                <span style={{ height: `${height}%` }} />
                <small>{period === 'Week' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index] : index % 2 === 0 ? index * 2 + 1 : ''}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel quick-links">
          <div className="section-heading"><h2>Shortcuts</h2></div>
          {[
            { id: 'home-gallery', title: 'Manage gallery slides' },
            { id: 'housing', title: 'Manage housing listings' },
            { id: 'trending', title: 'Manage trending stories' },
          ].map((link) => (
            <Link className="quick-link" to={`/dashboard/${link.id}`} key={link.id}>
              {link.title}<Icon name="arrow" size={18} />
            </Link>
          ))}
        </section>
      </div>
      {recent.length > 0 && (
        <section className="panel content-overview">
          <div className="section-heading"><h2>Collection highlights</h2></div>
          <div className="recent-grid">
            {recent.map((record) => (
              <Link className="recent-card" key={record.id} to={`/dashboard/${record.section.id}`}>
                <span className={`content-thumb content-thumb--${record.section.group.toLowerCase()}`}>
                  <Icon name={record.section.icon} size={28} />
                </span>
                <span className="recent-card__copy">
                  <small>{record.section.label}</small>
                  <strong>{record.title || 'Untitled'}</strong>
                  <span className={`status${record.published ? ' status--published' : ''}`}>
                    {record.published ? 'Published' : 'Draft'}
                  </span>
                </span>
                <Icon name="arrow" size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
