import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Loader2, HelpCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan } from '../types/subscription.types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await subscriptionService.getActivePlans();
        const sortedPlans = response.data.sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        showToast('Không thể tải danh sách gói', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, [showToast]);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để nâng cấp gói', 'info');
      navigate('/login');
      return;
    }

    const selectedPlan = plans.find(p => p.id === planId);
    const isPaid = selectedPlan && selectedPlan.price > 0;
    const paymentMethod = isPaid ? 'SePay' : 'Simulation';

    try {
      setUpgradingId(planId);
      const response = await subscriptionService.upgradeSubscription({
        planId,
        paymentMethod,
        returnUrl: window.location.origin + '/profile',
        cancelUrl: window.location.origin + '/pricing'
      });
      
      const data = response.data || response;
      
      if (data.paymentUrl) {
        // Parse the payment URL (relative, SePay image, or absolute)
        if (data.paymentUrl.includes('qr.sepay.vn') || data.paymentUrl.startsWith('/') || !data.paymentUrl.includes('://')) {
          const url = new URL(data.paymentUrl, window.location.origin);
          const des = url.searchParams.get('des') || '';
          const match = des.match(/PLNFY(\d+)/i);
          const orderCode = match ? match[1] : '';
          const amount = url.searchParams.get('amount') || url.searchParams.get('Amount') || (selectedPlan ? selectedPlan.price.toString() : '69000');
          const bankAccount = url.searchParams.get('acc') || url.searchParams.get('BankAccount') || '11140845389';
          const bankName = url.searchParams.get('bank') || url.searchParams.get('BankName') || 'TPBank';
          
          navigate(`/payment?orderCode=${orderCode}&amount=${amount}&bankAccount=${bankAccount}&bankName=${bankName}&returnUrl=/profile`);
        } else {
          window.location.href = data.paymentUrl;
        }
      } else {
        showToast('Nâng cấp gói dịch vụ thành công! Chào mừng bạn đến với trải nghiệm mới.', 'success');
        navigate('/profile');
      }
    } catch (error: any) {
      showToast(error.message || 'Nâng cấp thất bại, vui lòng thử lại.', 'error');
    } finally {
      setUpgradingId(null);
    }
  };

  const faqs = [
    { q: "Tôi có thể hủy gói dịch vụ bất cứ lúc nào không?", a: "Tất nhiên! Bạn có thể hủy gói của mình bất kỳ lúc nào trong phần cài đặt tài khoản. Sau khi hủy, bạn vẫn có quyền truy cập vào các tính năng cao cấp cho đến hết chu kỳ thanh toán hiện tại." },
    { q: "Planify có chính sách hoàn tiền không?", a: "Chúng tôi cung cấp chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với dịch vụ và chưa sử dụng quá 10% giới hạn AI của gói." },
    { q: "Giới hạn AI được tính như thế nào?", a: "Mỗi câu hỏi hoặc yêu cầu lập kế hoạch bạn gửi cho AI sẽ được tính là 1 yêu cầu. Giới hạn này sẽ được làm mới vào ngày đầu tiên của mỗi tháng." }
  ];

  return (
    <div className="relative pt-24 pb-20 min-h-screen bg-[#fcfcfd] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-40 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
            
            <span>Đầu tư cho tương lai của bạn</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Nâng tầm hiệu suất với <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI Planify</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Hàng nghìn sinh viên và chuyên gia đã tối ưu hóa 40% thời gian học tập. Hãy chọn gói phù hợp để bắt đầu ngay hôm nay.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 bg-white p-1.5 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 w-fit mx-auto mb-12">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Thanh toán tháng
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Thanh toán năm
              <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <p className="mt-6 text-gray-400 font-bold tracking-widest uppercase text-xs">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const featuresList = plan.features.split(',').map(f => f.trim()).filter(f => f);
              const isFree = plan.price === 0;
              const isPro = plan.price === 69000;
              
              const displayPrice = billingCycle === 'yearly' ? plan.price * 12 * 0.8 : plan.price;

              return (
                <div 
                  key={plan.id} 
                  className={`
                    relative bg-white rounded-[2.5rem] p-10 flex flex-col border transition-all duration-500 hover:shadow-3xl
                    ${isPro ? 'border-primary ring-4 ring-primary/5 scale-105 z-10 shadow-2xl shadow-primary/10' : 'border-gray-100 shadow-xl shadow-gray-200/40 hover:-translate-y-2'}
                  `}
                >
                  {isPro && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">
                      Được tin dùng nhất
                    </div>
                  )}

                  <div className="mb-8">
                    
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900 leading-none">
                        {isFree ? 'Miễn phí' : `${(displayPrice).toLocaleString('vi-VN')}đ`}
                      </span>
                      {!isFree && <span className="text-gray-400 font-bold text-sm tracking-tight">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>}
                    </div>
                  </div>

                  <div className="space-y-5 mb-10 flex-grow">
                    
                    
                    <div className="space-y-4 pt-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tính năng nổi bật</p>
                      <div className="flex items-center gap-3 group">
                        <Check size={18} className="text-green-500 shrink-0" />
                        <span className="text-sm text-gray-600 font-medium">Tối đa <strong>{plan.maxPlans}</strong> kế hoạch</span>
                      </div>
                      {featuresList.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-3">
                          <Check size={18} className="text-green-500 shrink-0" />
                          <span className="text-sm text-gray-600 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgradingId !== null}
                    className={`
                      relative overflow-hidden group w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300
                      hover:scale-[1.05] hover:shadow-2xl active:scale-[0.97] cursor-pointer
                      ${isFree 
                        ? 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-primary/20 shadow-md' 
                        : 'bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50'}
                      ${upgradingId === plan.id ? 'cursor-not-allowed opacity-85' : ''}
                    `}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {upgradingId === plan.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <span>{isFree ? 'Bắt đầu ngay' : 'Nâng cấp trải nghiệm'}</span>
                        </>
                      )}
                    </div>
                    {/* Animated Shine Effect */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shine" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Support Badges */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-3">
             <Lock size={20} className="text-gray-400" />
             <span className="text-xs font-black uppercase tracking-widest text-gray-500">Bảo mật SSL 256-bit</span>
           </div>
           <div className="flex items-center gap-3">
             <Shield size={20} className="text-gray-400" />
             <span className="text-xs font-black uppercase tracking-widest text-gray-500">Thanh toán an toàn</span>
           </div>
           <div className="flex items-center gap-3">
             <HelpCircle size={20} className="text-gray-400" />
             <span className="text-xs font-black uppercase tracking-widest text-gray-500">Hỗ trợ 24/7</span>
           </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-500 font-medium">Mọi thứ bạn cần biết về các gói dịch vụ và thanh toán.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="font-bold text-gray-800">{faq.q}</span>
                  {openFaq === index ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-gray-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-500 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Banner - Brightened to match homepage */}
        <div className="mt-32 bg-gradient-to-r from-primary/10 via-purple-50/50 to-secondary/15 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-primary/5 border border-primary/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">Bạn cần một giải pháp cho tổ chức?</h2>
              <p className="text-gray-600 text-lg font-medium">Chúng tôi cung cấp các gói đặc biệt với mức chiết khấu cao cho trường học và câu lạc bộ sinh viên.</p>
            </div>
            <button 
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 hover:scale-[1.05] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] cursor-pointer"
            >
              Liên hệ với chúng tôi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
