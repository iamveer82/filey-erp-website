import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'

const SignUp = lazy(() => import('@/pages/SignUp'))
const Thanks = lazy(() => import('@/pages/Thanks'))
const Account = lazy(() => import('@/pages/Account'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sign-up and sign-in are their own bare screens — no marketing nav or footer. */}
        <Route path="/signup" element={<div className="auth-site"><Suspense fallback={<p className="not-found" role="status">Loading signup…</p>}><SignUp key="signup" mode="signup" /></Suspense></div>} />
        <Route path="/login" element={<div className="auth-site"><Suspense fallback={<p className="not-found" role="status">Loading sign in…</p>}><SignUp key="login" mode="login" /></Suspense></div>} />
        <Route path="/account" element={<Layout><Suspense fallback={<p className="not-found" role="status">Loading your account…</p>}><Account /></Suspense></Layout>} />
        {/* Where Dodo returns a buyer after payment. */}
        <Route path="/thanks" element={<Layout><Suspense fallback={<p className="not-found" role="status">Loading…</p>}><Thanks /></Suspense></Layout>} />
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
    </BrowserRouter>
  )
}
