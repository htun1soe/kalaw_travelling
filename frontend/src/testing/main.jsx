import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TestingPage from './TestingPage.jsx'
import './testing.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TestingPage />
  </StrictMode>,
)
