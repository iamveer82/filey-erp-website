import { BrowserRouter, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import SignUp from '@/pages/SignUp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sign-up is its own bare screen — no marketing nav or footer. */}
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
      </Routes>
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
