import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  CreditCard, 
  Zap,
  Lock,
  LogOut,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { UserSubscription } from '../types/subscription.types';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await subscriptionService.getCurrentSubscription();
        setSubscription(response.data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#FDFDFD] flex items-center justify-center font-sans">
      {/* Centered Modal-like Card */}
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-300">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black leading-tight">{user.fullName}</h1>
              <p className="text-sm text-gray-500 font-medium">{user.email}</p>
            </div>
          </div>
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black">
             <ArrowLeft size={20} />
          </Link>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-10">
          
          {/* Highlighted Current Plan */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Gói dịch vụ đang dùng</p>
            <div className="p-6 bg-black text-white rounded-xl flex items-center justify-between shadow-xl shadow-black/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">{subscription?.plan?.name || 'Gói Miễn Phí'}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trạng thái: Đang hoạt động</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full border border-white/10">Gói hiện tại</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm font-medium text-gray-500 px-1">
              <span>Hạn mức AI: <strong>{subscription?.aiRequestsUsed || 0}/{subscription?.plan?.aiRequestsLimit || 10}</strong></span>
              <Link to="/pricing" className="text-black font-bold hover:underline">Nâng cấp gói →</Link>
            </div>
          </div>

          {/* Special Privileges List */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 border border-gray-100 rounded-xl">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lưu trữ</p>
               <p className="text-sm font-bold text-black">{subscription?.plan?.storageLimitMb || 100} MB Dung lượng</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-xl">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kế hoạch</p>
               <p className="text-sm font-bold text-black">Tối đa {subscription?.plan?.maxPlans || 5} Bản kế hoạch</p>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Cài đặt tài khoản</p>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
                  <Lock size={16} />
                </div>
                <span className="text-sm font-bold text-gray-700">Thay đổi mật khẩu</span>
              </div>
              <Check size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
                  <Zap size={16} />
                </div>
                <span className="text-sm font-bold text-gray-700">Hành động AI của tôi</span>
              </div>
              <Check size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</p>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
