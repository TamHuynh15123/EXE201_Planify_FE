import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ChevronDown, Layout, UserCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinkStyles = ({ isActive }: { isActive: boolean }) => 
    `text-sm font-medium transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-primary'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <img src="/logo hệ thống planify.png" alt="Planify Logo" className="h-8 w-auto object-contain" />
            <img src="/logo-text.png" alt="PLANIFY" className="h-4 w-auto object-contain mt-1" />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" end className={navLinkStyles}>Trang chủ</NavLink>
            <NavLink to="/planning" className={navLinkStyles}>Kế hoạch</NavLink>
            <NavLink to="/pricing" className={navLinkStyles}>Các gói</NavLink>
            <NavLink to="/about" className={navLinkStyles}>Về chúng tôi</NavLink>
            <NavLink to="/contact" className={navLinkStyles}>Liên hệ</NavLink>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link 
                  to="/pricing"
                  className="bg-primary hover:bg-secondary text-white px-5 py-2 rounded-md text-sm font-semibold transition-all shadow-md shadow-primary/20"
                >
                  Dùng thử miễn phí
                </Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <NavLink 
                  to="/login"
                  className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
                >
                  Đăng nhập
                </NavLink>
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="flex items-center gap-3 px-4 py-1.5 bg-gray-50 hover:bg-white rounded-full border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                >
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <UserIcon size={14} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{user.fullName}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Luxurious Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
                    <div className="px-5 py-4 border-b border-gray-50 mb-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Tài khoản cá nhân</p>
                      <p className="text-sm font-black text-gray-800 truncate">{user.email}</p>
                    </div>

                    {user.role === 'Admin' && (
                      <Link 
                        to="/admin/dashboard" 
                        className="flex items-center gap-3 px-5 py-3 text-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                          <Layout size={18} />
                        </div>
                        <span className="text-sm font-bold">Dashboard Admin</span>
                      </Link>
                    )}

                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 transition-all group"
                    >
                      <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <UserCircle size={18} />
                      </div>
                      <span className="text-sm font-bold">Hồ sơ của tôi</span>
                    </Link>


                    <Link 
                      to="/my-plans" 
                      className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:bg-primary/5 hover:text-primary transition-all group"
                    >
                      <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                        <Layout size={18} />
                      </div>
                      <span className="text-sm font-bold">Kế hoạch của tôi</span>
                    </Link>

                    <div className="h-px bg-gray-50 mx-5 my-2"></div>

                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 transition-all group"
                    >
                      <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                        <LogOut size={18} />
                      </div>
                      <span className="text-sm font-bold">Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
