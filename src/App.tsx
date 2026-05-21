import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Planning from './pages/Planning'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import Auth from './pages/Auth'
import Footer from './components/Footer'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'planning':
        return <Planning />
      case 'pricing':
        return <Pricing />
      case 'about':
        return <About />
      case 'contact':
        return <Contact />
      case 'auth':
        return <Auth />
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer onNavigate={setCurrentPage} />
    </div>
  )
}

export default App
