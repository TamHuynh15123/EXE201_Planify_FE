import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, Check, ShieldCheck, CreditCard, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { useToast } from '../context/ToastContext';

interface CheckoutInfo {
  orderCode: string;
  amount: number;
  description: string;
  bankName: string;
  bankAccount: string;
  accountName: string;
  qrUrl: string;
}

const Payment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const queryOrderCode = searchParams.get('orderCode') || '';
  const queryAmount = parseInt(searchParams.get('amount') || '69000', 10);
  const queryBankName = searchParams.get('bankName') || 'TPBank';
  const queryBankAccount = searchParams.get('bankAccount') || '11140845389';
  const returnUrl = searchParams.get('returnUrl') || '/profile';

  // State Management
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4); // For redirecting countdown

  // Fetch Checkout info from backend on load
  useEffect(() => {
    if (!queryOrderCode) {
      setIsLoadingInfo(false);
      return;
    }

    const fetchCheckoutInfo = async () => {
      try {
        const response = await subscriptionService.getCheckoutInfo(queryOrderCode);
        const data = response.data || response;
        if (data) {
          setCheckoutInfo({
            orderCode: (data.orderCode || data.OrderCode || queryOrderCode).toString(),
            amount: data.amount || data.Amount || queryAmount,
            description: data.description || data.Description || `PLNFY${queryOrderCode}`,
            bankName: data.bankName || data.BankName || queryBankName,
            bankAccount: data.bankAccount || data.BankAccount || queryBankAccount,
            accountName: data.accountName || data.AccountName || 'NGUYEN DANG KHOA',
            qrUrl: data.qrUrl || data.QrUrl || `https://qr.sepay.vn/img?bank=${queryBankName}&acc=${queryBankAccount}&template=compact&amount=${queryAmount}&des=PLNFY${queryOrderCode}`,
          });
        }
      } catch (error) {
        console.error('Failed to fetch checkout info:', error);
        // Fail gracefully and use query params as fallback
        setCheckoutInfo({
          orderCode: queryOrderCode,
          amount: queryAmount,
          description: `PLNFY${queryOrderCode}`,
          bankName: queryBankName,
          bankAccount: queryBankAccount,
          accountName: 'NGUYEN DANG KHOA',
          qrUrl: `https://qr.sepay.vn/img?bank=${queryBankName}&acc=${queryBankAccount}&template=compact&amount=${queryAmount}&des=PLNFY${queryOrderCode}`,
        });
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchCheckoutInfo();
  }, [queryOrderCode, queryAmount, queryBankName, queryBankAccount]);

  // Use dynamic checkoutInfo or fallbacks if loading/null
  const currentOrderCode = checkoutInfo?.orderCode || queryOrderCode;
  const currentAmount = checkoutInfo?.amount || queryAmount;
  const currentDescription = checkoutInfo?.description || `PLNFY${queryOrderCode}`;
  const currentBankName = checkoutInfo?.bankName || queryBankName;
  const currentBankAccount = checkoutInfo?.bankAccount || queryBankAccount;
  const currentAccountName = checkoutInfo?.accountName || 'NGUYEN DANG KHOA';
  const currentQrUrl = checkoutInfo?.qrUrl || `https://qr.sepay.vn/img?bank=${queryBankName}&acc=${queryBankAccount}&template=compact&amount=${queryAmount}&des=PLNFY${queryOrderCode}`;

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`Đã sao chép ${field}!`, 'success');
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Polling logic for status check
  useEffect(() => {
    if (!currentOrderCode) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const response = await subscriptionService.checkStatus(currentOrderCode);
        const data = response.data || response;
        
        // Match status: "success", "paid", or "completed"
        const isSuccess = 
          data?.status?.toLowerCase() === 'success' || 
          data?.status?.toLowerCase() === 'paid' || 
          data?.status?.toLowerCase() === 'completed' ||
          (data as any)?.Status?.toLowerCase() === 'success' ||
          (data as any)?.Status?.toLowerCase() === 'paid';

        if (isSuccess && isMounted) {
          setPaymentStatus('success');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error checking subscription status:', error);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentOrderCode]);

  // Success countdown redirect
  useEffect(() => {
    if (paymentStatus !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(returnUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus, navigate, returnUrl]);

  if (isLoadingInfo) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">
          Đang tải thông tin thanh toán...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Soft Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Styled Confetti Particles in Success State */}
      {paymentStatus === 'success' && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => {
            const delay = Math.random() * 2;
            const left = Math.random() * 100;
            const size = Math.random() * 8 + 4;
            const colors = ['#4F46E5', '#7C3AED', '#10B981', '#FF6B6B', '#00F2FE'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return (
              <div
                key={i}
                className="absolute rounded-full animate-fall"
                style={{
                  left: `${left}%`,
                  top: `-10px`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: randomColor,
                  animationDelay: `${delay}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  opacity: 0.7,
                }}
              />
            );
          })}
        </div>
      )}

      {paymentStatus === 'success' ? (
        /* SUCCESS SCREEN */
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-[3rem] p-10 text-center space-y-6 shadow-2xl shadow-indigo-100/50 border-emerald-500/20 z-10 animate-in zoom-in-95 duration-500">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Glowing Ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping duration-1000"></div>
            <div className="absolute -inset-2 rounded-full border border-emerald-500/20 animate-pulse"></div>
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={44} className="text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent uppercase tracking-tight">
              Thanh Toán Thành Công!
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              Tài khoản của bạn đã được nâng cấp
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 text-xs text-emerald-700 font-medium max-w-xs mx-auto">
            Hệ thống đang chuẩn bị môi trường làm việc của bạn...
          </div>

          <p className="text-xs text-slate-400 font-bold">
            Tự động quay lại sau <span className="text-emerald-600 text-sm font-black">{countdown}</span> giây
          </p>
        </div>
      ) : (
        /* PAYMENT CHECKOUT CARD */
        <div className="w-full max-w-4xl z-10 flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Back button */}
          <button 
            onClick={() => navigate('/pricing')}
            className="w-fit flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all uppercase tracking-widest px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl hover:shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} /> Quay lại các gói dịch vụ
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: VietQR Code Card */}
            <div className="md:col-span-5 bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-6 shadow-2xl shadow-indigo-100/30 relative group overflow-hidden">
              {/* Soft colorful gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Status Header */}
              <div className="text-center space-y-1 relative z-10">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-4 py-1.5 uppercase tracking-widest rounded-full">
                  Quét mã để thanh toán
                </span>
                <h3 className="text-base font-black uppercase tracking-wider text-slate-800 pt-3.5">VietQR / SePay</h3>
              </div>

              {/* QR Image with dynamic glow border */}
              <div className="relative p-4 bg-white rounded-3xl shadow-[0_10px_30px_-5px_rgba(79,70,229,0.08)] group-hover:shadow-[0_15px_40px_-5px_rgba(79,70,229,0.15)] transition-all duration-500 z-10 w-60 h-60 flex items-center justify-center border border-slate-100">
                <img 
                  src={currentQrUrl} 
                  alt="VietQR SePay" 
                  className="w-full h-full object-contain rounded-2xl" 
                />
              </div>

              {/* Dynamic State Spinner */}
              <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-100 py-2.5 px-5 rounded-full relative z-10 animate-pulse">
                <RefreshCw size={12} className="animate-spin text-indigo-600" />
                Đang kiểm tra giao dịch...
              </div>
            </div>

            {/* Right Column: Transaction info details */}
            <div className="md:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between space-y-8 shadow-2xl shadow-indigo-100/30 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              {/* Header */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <CreditCard size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Chuyển khoản thủ công</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  Thông tin giao dịch
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Nếu không thể quét mã QR, bạn có thể thực hiện chuyển khoản thủ công bằng ứng dụng ngân hàng với các thông tin dưới đây.
                </p>
              </div>

              {/* Transfer Details Form/Rows */}
              <div className="space-y-4">
                {/* Bank Name */}
                <div className="bg-slate-50/50 border border-slate-100/80 p-4 flex justify-between items-center rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 group/row">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Ngân hàng</p>
                    <p className="text-sm font-bold text-slate-800 uppercase">{currentBankName}</p>
                  </div>
                  <button 
                    onClick={() => handleCopy(currentBankName, 'Tên ngân hàng')}
                    className="p-2.5 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200/60 hover:border-indigo-200 shadow-sm transition-all cursor-pointer"
                  >
                    {copiedField === 'Tên ngân hàng' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Account Holder Name */}
                <div className="bg-slate-50/50 border border-slate-100/80 p-4 flex justify-between items-center rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 group/row">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Chủ tài khoản</p>
                    <p className="text-sm font-bold text-slate-800 uppercase">{currentAccountName}</p>
                  </div>
                  <button 
                    onClick={() => handleCopy(currentAccountName, 'Tên chủ tài khoản')}
                    className="p-2.5 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200/60 hover:border-indigo-200 shadow-sm transition-all cursor-pointer"
                  >
                    {copiedField === 'Tên chủ tài khoản' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Account Number */}
                <div className="bg-slate-50/50 border border-slate-100/80 p-4 flex justify-between items-center rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 group/row">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Số tài khoản</p>
                    <p className="text-sm font-bold text-slate-800 tracking-wider font-mono">{currentBankAccount}</p>
                  </div>
                  <button 
                    onClick={() => handleCopy(currentBankAccount, 'Số tài khoản')}
                    className="p-2.5 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200/60 hover:border-indigo-200 shadow-sm transition-all cursor-pointer"
                  >
                    {copiedField === 'Số tài khoản' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Amount */}
                <div className="bg-slate-50/50 border border-slate-100/80 p-4 flex justify-between items-center rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 group/row">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Số tiền</p>
                    <p className="text-sm font-black text-indigo-600 tracking-tight">
                      {currentAmount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopy(currentAmount.toString(), 'Số tiền')}
                    className="p-2.5 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200/60 hover:border-indigo-200 shadow-sm transition-all cursor-pointer"
                  >
                    {copiedField === 'Số tiền' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Transfer Content */}
                <div className="bg-indigo-50/20 border border-dashed border-indigo-200/80 p-4 flex justify-between items-center rounded-2xl hover:bg-indigo-50/40 transition-all duration-300 group/row relative">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                      Nội dung chuyển khoản <span className="text-[8px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded font-black uppercase">Quan trọng</span>
                    </p>
                    <p className="text-sm font-black text-slate-800 tracking-wider font-mono">
                      {currentDescription}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopy(currentDescription, 'Nội dung chuyển khoản')}
                    className="p-2.5 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200/60 hover:border-indigo-200 shadow-sm transition-all cursor-pointer"
                  >
                    {copiedField === 'Nội dung chuyển khoản' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Security Banner Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <ShieldCheck className="text-emerald-500 shrink-0" size={16} />
                Hệ thống bảo mật giao dịch tự động bởi SePay
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for custom Confetti drop animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}} />
    </div>
  );
};

export default Payment;
