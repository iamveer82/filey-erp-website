import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'

const SignUp = lazy(() => import('@/pages/SignUp'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sign-up is its own bare screen — no marketing nav or footer. */}
        <Route path="/signup" element={<div className="auth-site"><Suspense fallback={<p className="not-found" role="status">Loading signup…</p>}><SignUp /></Suspense></div>} />
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route path="*" element={<div className="not-found"><img src="/filey-mark.png" alt="" width="120" height="120" /><h1>This page isn't here.</h1><p>Let's get you back to Filey.</p><Link className="site-button" to="/">Back to Filey</Link></div>} />
      </Routes>
      <Toaster
        theme="system"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--site-paper)',
            border: '1px solid var(--site-line)',
            color: 'var(--site-text)',
          },
        }}
      />
    </BrowserRouter>
  )
}
