import { BrowserRouter, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Layout>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#14202F',
            border: '1px solid #33445C',
            color: '#E8EEF4',
          },
        }}
      />
    </BrowserRouter>
  )
}
