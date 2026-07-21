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
import Profile from './pages/Profile'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import CommunityLibrary from './pages/CommunityLibrary'
import CommunityPlanDetail from './pages/CommunityPlanDetail'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'
import AdminPlanFrameworks from './pages/admin/AdminPlanFrameworks'
import AdminPlanTemplates from './pages/admin/AdminPlanTemplates'
import AdminCommunityPlans from './pages/admin/AdminCommunityPlans'
import AdminUsers from './pages/admin/AdminUsers'
import AdminFeedbacks from './pages/admin/AdminFeedbacks'
import AdminUserGrowth from './pages/admin/AdminUserGrowth'
import AIChat from './components/AIChat'
import OnboardingTour from './components/OnboardingTour'
import Payment from './pages/Payment'
import { useState } from 'react'
import { useAuth } from './context/AuthContext'


function AppContent() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route element={<><Navbar /><main className="flex-grow"><Outlet /></main><Footer /></>}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/my-plans" element={<MyPlans />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/plans/:id" element={<PlanDetail />} />
          <Route path="/community" element={<CommunityLibrary />} />
          <Route path="/community/:id" element={<CommunityPlanDetail />} />
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
            <Route path="/admin/frameworks" element={<AdminPlanFrameworks />} />
            <Route path="/admin/templates" element={<AdminPlanTemplates />} />
            <Route path="/admin/community-plans" element={<AdminCommunityPlans />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/user-growth" element={<AdminUserGrowth />} />
            <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />
            <Route path="/admin/settings" element={<div className="p-8">Cài đặt hệ thống (Coming soon)</div>} />
          </Route>
        </Route>

        {/* Standalone payment checkout page (dark mode theme) */}
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Floating AI Button */}
      <button 
        data-tour="ai-button"
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[90] group border border-gray-100 p-0 overflow-hidden"
        title="Hỏi trợ lý AI"
      >
        <img src="/ai-bot.png" alt="AI Assistant" className="w-full h-full object-cover" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
      </button>

      <AIChat isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Onboarding Tour — chỉ hiện khi đã đăng nhập */}
      <OnboardingTour isLoggedIn={!!user} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
