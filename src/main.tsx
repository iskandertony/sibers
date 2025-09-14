import React from 'react'
import ReactDOM from 'react-dom/client'

import 'antd/dist/reset.css'

import { App } from '@/pages/root/App'
import '@/shared/lib/notify'
import '@/shared/styles/index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
