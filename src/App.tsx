import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Planning from './pages/Planning'
import PlanDetail from './pages/PlanDetail'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import MyPlans from './pages/MyPlans'
import Auth from './pages/Auth'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface flex flex-col">
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route element={<><Navbar /><main className="flex-grow"><Outlet /></main><Footer /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/my-plans" element={<MyPlans />} />
            <Route path="/plans/:id" element={<PlanDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/users" element={<div className="p-8">Quản lý người dùng (Coming soon)</div>} />
              <Route path="/admin/settings" element={<div className="p-8">Cài đặt hệ thống (Coming soon)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
