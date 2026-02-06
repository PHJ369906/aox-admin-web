import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import 'dayjs/locale/zh-cn'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#0891B2',
              colorInfo: '#0891B2',
              colorSuccess: '#22C55E',
              colorWarning: '#F59E0B',
              colorError: '#EF4444',
              colorText: '#0F172A',
              colorTextSecondary: '#475569',
              colorBorder: '#E2E8F0',
              colorBgLayout: '#F8FAFC',
              colorBgContainer: '#FFFFFF',
              borderRadius: 12,
              fontFamily:
                'Source Sans 3, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
              fontFamilyCode: 'JetBrains Mono, Source Code Pro, monospace',
            },
            components: {
              Layout: {
                headerBg: '#FFFFFF',
                bodyBg: '#F8FAFC',
                siderBg: '#FFFFFF',
              },
              Menu: {
                itemBg: '#FFFFFF',
                itemHoverBg: '#E0F2FE',
                itemSelectedBg: '#CFFAFE',
                itemSelectedColor: '#0E7490',
                itemActiveBg: '#CFFAFE',
                subMenuItemBg: '#FFFFFF',
              },
              Card: {
                borderRadiusLG: 16,
                headerFontSize: 16,
              },
              Table: {
                headerBg: '#F1F5F9',
                headerSplitColor: '#E2E8F0',
                rowHoverBg: '#F8FAFC',
              },
              Button: {
                controlHeightLG: 44,
              },
              Input: {
                activeBg: '#FFFFFF',
                hoverBg: '#FFFFFF',
              },
            },
          }}
        >
          <App />
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
