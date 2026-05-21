import React from 'react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <img src="/logo hệ thống planify.png" alt="Planify Logo" className="h-8 w-auto object-contain" />
            <img src="/logo-text.png" alt="PLANIFY" className="h-4 w-auto object-contain mt-1" />
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-primary'}`}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => onNavigate('planning')}
              className={`text-sm font-medium transition-colors ${currentPage === 'planning' ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-primary'}`}
            >
              Kế hoạch
            </button>
            <button 
              onClick={() => onNavigate('pricing')}
              className={`text-sm font-medium transition-colors ${currentPage === 'pricing' ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-primary'}`}
            >
              Các gói
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors ${currentPage === 'about' ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-primary'}`}
            >
              Về chúng tôi
            </button>
            <button 
              onClick={() => onNavigate('contact')}
              className={`text-sm font-medium transition-colors ${currentPage === 'contact' ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-primary'}`}
            >
              Liên hệ
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate('pricing')}
              className="bg-primary hover:bg-secondary text-white px-5 py-2 rounded-md text-sm font-semibold transition-all shadow-md shadow-primary/20"
            >
              Dùng thử miễn phí
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <button 
              onClick={() => onNavigate('auth')}
              className={`text-sm font-medium transition-colors ${currentPage === 'auth' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
