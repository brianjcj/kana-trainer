import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import KanaTrainer from './trainer/KanaTrainer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KanaTrainer />
  </StrictMode>,
)
