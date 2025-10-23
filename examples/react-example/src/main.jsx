import React from 'react'
import ReactDOM from 'react-dom/client'
import { NotificationProvider } from '@ldesign/notification/react'
import '@ldesign/notification/styles'
import App from './App'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider
      config={{
        defaultPosition: 'top-right',
        defaultDuration: 3000
      }}
    >
      <App />
    </NotificationProvider>
  </React.StrictMode>
)

