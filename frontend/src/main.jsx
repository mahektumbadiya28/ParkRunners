import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

function ErrorFallback({ error }) {
  return (
    <div style={{ padding: '20px', color: 'red', backgroundColor: '#fee' }}>
      <h1>React App Crashed!</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{error.stack}</pre>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
