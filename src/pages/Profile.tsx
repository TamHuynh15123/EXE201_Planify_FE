import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { UserSubscription } from '../types/subscription.types';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await subscriptionService.getCurrentSubscription();
        setSubscription(response.data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  if (!user) return null;

  const planName = subscription?.planName || subscription?.PlanName || subscription?.plan?.name || 'Gói Miễn Phí';
  const aiRequestsLimit = subscription?.aiRequestsLimit !== undefined ? subscription?.aiRequestsLimit : (subscription?.AiRequestsLimit !== undefined ? subscription?.AiRequestsLimit : (subscription?.plan?.aiRequestsLimit || 10));
  const aiRequestsUsed = subscription?.aiRequestsUsed || 0;
  const maxPlans = subscription?.maxPlans !== undefined ? subscription?.maxPlans : (subscription?.MaxPlans !== undefined ? subscription?.MaxPlans : (subscription?.plan?.maxPlans || 5));
  const aiRefineLimit = subscription?.aiRefineLimit !== undefined ? subscription?.aiRefineLimit : (subscription?.AiRefineLimit !== undefined ? subscription?.AiRefineLimit : (subscription?.plan?.aiRefineLimit !== undefined ? subscription?.plan?.aiRefineLimit : null));
  const aiRefineUsed = subscription?.aiRefineUsed !== undefined ? subscription?.aiRefineUsed : (subscription?.AiRefineUsed !== undefined ? subscription?.AiRefineUsed : 0);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white flex items-center justify-center font-sans px-4">
      {/* Strictly Monochrome Card */}
      <div className="w-full max-w-xl bg-white border border-neutral-900 rounded-none overflow-hidden p-8 md:p-12 space-y-8 animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-neutral-950 pb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-neutral-950 uppercase">Hồ sơ của tôi</h1>
            <p className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">Thông tin tài khoản chính thức</p>
          </div>
          <Link to="/" className="p-2 border border-neutral-950 hover:bg-neutral-950 hover:text-white transition-all text-neutral-950">
            <ArrowLeft size={16} />
          </Link>
        </div>
 
        {/* Info Grid */}
        <div className="space-y-6">
          {/* User Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Họ và tên</span>
              <p className="text-sm font-black text-neutral-950">{user.fullName}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Địa chỉ email</span>
              <p className="text-sm font-black text-neutral-950">{user.email}</p>
            </div>
          </div>
 
          {/* Current Plan */}
          <div className="space-y-4 border-b border-neutral-200 pb-6">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Gói dịch vụ đang dùng</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-black text-neutral-950 uppercase">{planName}</p>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-1">Trạng thái: Hoạt động</p>
              </div>
              <Link 
                to="/pricing" 
                className="px-4 py-2 border border-neutral-950 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-950 hover:text-white transition-all text-center"
              >
                Nâng cấp gói →
              </Link>
            </div>
          </div>
 
          {/* Special Privileges List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-neutral-200 pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Hạn mức AI</span>
              <p className="text-sm font-black text-neutral-950">{aiRequestsUsed} / {aiRequestsLimit}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Tinh chỉnh AI</span>
              <p className="text-sm font-black text-neutral-950">
                {aiRefineLimit === null || aiRefineLimit === undefined ? 'Không giới hạn' : `${aiRefineUsed} / ${aiRefineLimit}`}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Kế hoạch tối đa</span>
              <p className="text-sm font-black text-neutral-950">{maxPlans}</p>
            </div>
          </div>


        </div>

        {/* Footer Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-950">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</p>
          <button 
            onClick={logout}
            className="w-full sm:w-auto px-6 py-2.5 border border-neutral-950 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-950 hover:text-white transition-all text-center rounded-none text-neutral-950"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
