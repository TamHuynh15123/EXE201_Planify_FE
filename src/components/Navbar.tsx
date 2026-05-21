import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();

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
            {!user ? (
              <>
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
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{user.fullName}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
