import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Точка входа React-приложения.
// createRoot — современный API React 18 для монтирования дерева компонентов в div#root из index.html.
// StrictMode — рендерит компоненты дважды в dev-режиме, чтобы выявлять побочные эффекты.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
