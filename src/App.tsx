import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
