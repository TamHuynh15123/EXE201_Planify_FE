import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Globe,
  Grid,
  BookOpen,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <CreditCard size={20} />, label: 'Gói dịch vụ', path: '/admin/subscriptions' },
    { icon: <Grid size={20} />, label: 'Frameworks', path: '/admin/frameworks' },
    { icon: <BookOpen size={20} />, label: 'Templates', path: '/admin/templates' },
    { icon: <Globe size={20} />, label: 'Duyệt kế hoạch', path: '/admin/community-plans' },
    { icon: <Users size={20} />, label: 'Người dùng', path: '/admin/users' },
    { icon: <TrendingUp size={20} />, label: 'Tăng trưởng', path: '/admin/user-growth' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', path: '/admin/feedbacks' },
    { icon: <Settings size={20} />, label: 'Cài đặt', path: '/admin/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl text-gray-800">Planify Admin</span>
        </div>
        <Link 
          to="/" 
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          title="Xem trang chủ"
        >
          <Globe size={20} />
        </Link>
      </div>

      <div className="flex-grow py-6 px-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-gray-800 truncate">{user?.fullName || 'Admin'}</span>
            <span className="text-xs text-gray-500 truncate">{user?.email}</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-semibold">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
