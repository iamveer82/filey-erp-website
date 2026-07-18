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
            background: '#1A1A1D',
            border: '1px solid #3A3A40',
            color: '#FAFAFA',
          },
        }}
      />
    </BrowserRouter>
  )
}
