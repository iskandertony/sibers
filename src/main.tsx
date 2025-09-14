import React from 'react'
import ReactDOM from 'react-dom/client'

import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'

import { App } from '@/pages/root/App'
import '@/shared/lib/notify'
import '@/shared/styles/index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: 'var(--brand)',
          colorTextLightSolid: 'var(--text)',
        },
        components: {
          Button: {
            defaultHoverColor: 'var(--text)',
            defaultHoverBg: 'var(--brand)',
            defaultHoverBorderColor: 'var(--brand)',
            defaultActiveColor: 'var(--text)',
            defaultActiveBg: 'var(--brand)',
            defaultActiveBorderColor: 'var(--brand)',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
