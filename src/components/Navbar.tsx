import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Layout, 
  UserCircle, 
  Bell, 
  Check, 
  CheckCheck, 
  Loader2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Info 
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types/notification.types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));
  useClickOutside(notifDropdownRef, () => setIsNotifOpen(false));

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getUnreadCount();
      if (res.data !== undefined) {
        setUnreadCount(res.data);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setIsNotifLoading(true);
    try {
      const res = await notificationService.getNotifications(20);
      if (res.data) {
        setNotifications(res.data);
      }
      const countRes = await notificationService.getUnreadCount();
      if (countRes.data !== undefined) {
        setUnreadCount(countRes.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsNotifLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const handleToggleNotif = () => {
    if (!isNotifOpen) {
      fetchNotifications();
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationConfig = (type: string | null) => {
    const t = type?.toLowerCase() || 'system';
    switch (t) {
      case 'deadline':
      case 'task':
      case 'reminder':
        return {
          icon: <Clock size={16} />,
          bgClass: 'bg-amber-50 text-amber-600 border-amber-100',
          indicatorClass: 'bg-amber-500',
        };
      case 'payment':
      case 'pricing':
      case 'subscription':
        return {
          icon: <Sparkles size={16} />,
          bgClass: 'bg-purple-50 text-purple-600 border-purple-100',
          indicatorClass: 'bg-purple-500',
        };
      case 'system':
      case 'security':
        return {
          icon: <ShieldAlert size={16} />,
          bgClass: 'bg-blue-50 text-blue-600 border-blue-100',
          indicatorClass: 'bg-blue-500',
        };
      default:
        return {
          icon: <Info size={16} />,
          bgClass: 'bg-slate-50 text-slate-600 border-slate-100',
          indicatorClass: 'bg-slate-500',
        };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return 'Vừa xong';
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHr < 24) return `${diffHr} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const navLinkStyles = ({ isActive }: { isActive: boolean }) => 
    `text-sm font-medium transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-primary'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center space-x-2 cursor-pointer">
              <img src="/logo hệ thống planify.png" alt="Planify Logo" className="h-10 w-auto object-contain" />
              <img src="/logo-text.png" alt="PLANIFY" className="h-5 w-auto object-contain mt-1" />
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            <NavLink to="/" end className={navLinkStyles}>Trang chủ</NavLink>
            <NavLink to="/planning" className={navLinkStyles}>Kế hoạch</NavLink>
            <NavLink to="/community" className={navLinkStyles}>Thư viện</NavLink>
            <NavLink to="/pricing" className={navLinkStyles}>Các gói</NavLink>
            <NavLink to="/about" className={navLinkStyles}>Về chúng tôi</NavLink>
            <NavLink to="/contact" className={navLinkStyles}>Liên hệ</NavLink>
          </div>

          {/* Action Buttons */}
          <div className="flex-1 flex justify-end items-center space-x-4">
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
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    onClick={handleToggleNotif}
                    className={`relative p-2 rounded-full hover:bg-gray-50 border transition-all ${
                      isNotifOpen ? 'border-primary/20 bg-gray-50 text-primary' : 'border-transparent text-gray-600 hover:text-primary'
                    }`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border border-white animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[60] flex flex-col max-h-[480px]">
                      {/* Header */}
                      <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-gray-800">Thông báo</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary hover:text-secondary font-bold flex items-center gap-1 transition-colors"
                          >
                            <CheckCheck size={14} />
                            Đọc tất cả
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 max-h-[360px]">
                        {isNotifLoading ? (
                          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <span className="text-xs font-medium">Đang tải thông báo...</span>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2 text-center px-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                              <Bell size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-500">Chưa có thông báo nào</span>
                            <span className="text-xs text-gray-400 mt-1 max-w-[240px]">Bạn sẽ nhận được thông báo khi có các hoạt động liên quan đến kế hoạch của bạn.</span>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const config = getNotificationConfig(notif.type);
                            return (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  if (!notif.isRead) {
                                    notificationService.markAsRead(notif.id);
                                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                    setUnreadCount(prev => Math.max(0, prev - 1));
                                  }
                                  setIsNotifOpen(false);
                                  if (notif.referenceId && (notif.type === 'deadline' || notif.type === 'task' || notif.type === 'reminder')) {
                                    window.location.href = `/plans/${notif.referenceId}`;
                                  }
                                }}
                                className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-all cursor-pointer group relative ${
                                  !notif.isRead ? 'bg-primary/5' : ''
                                }`}
                              >
                                {/* Left Icon */}
                                <div className={`p-2 rounded-xl border shrink-0 ${config.bgClass}`}>
                                  {config.icon}
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-w-0 pr-6">
                                  <div className="flex justify-between items-start mb-0.5">
                                    <p className={`text-sm leading-tight truncate ${!notif.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                      {notif.title || 'Thông báo'}
                                    </p>
                                  </div>
                                  <p className={`text-xs leading-normal mb-1.5 break-words ${!notif.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                    {notif.message}
                                  </p>
                                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatTimeAgo(notif.createdAt)}
                                  </span>
                                </div>

                                {/* Actions / Indicators */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                  {!notif.isRead ? (
                                    <>
                                      <span className={`w-2 h-2 rounded-full ${config.indicatorClass} group-hover:hidden`}></span>
                                      <button
                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                        className="hidden group-hover:flex p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all"
                                        title="Đánh dấu đã đọc"
                                      >
                                        <Check size={14} />
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
