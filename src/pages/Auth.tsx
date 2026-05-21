import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthProps {
  onNavigate?: (page: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      
      if (onNavigate) {
        onNavigate('home');
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 pt-20">
      {/* Auth Container - Split Screen Style inspired */}
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Branding/Visuals */}
        <div className="md:w-1/2 bg-gradient-ai p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Lock size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
               <img src="/logo.png" alt="Logo" className="h-10 w-auto brightness-0 invert" />
               <span className="text-2xl font-black tracking-tighter">PLANIFY</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Bắt đầu hành trình cùng AI.'}
            </h2>
            <p className="text-white/80">
              {isLogin 
                ? 'Đăng nhập để tiếp tục quản lý các kế hoạch học tập thông minh của bạn.' 
                : 'Tham gia cùng hàng nghìn sinh viên tối ưu hóa thời gian và chinh phục mục tiêu.'}
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
            <p className="text-sm italic">
              "Planify giúp mình tiết kiệm 5 giờ mỗi tuần cho việc lên lịch học tập. AI thực sự hiểu mình cần gì!"
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="text-sm font-bold">Minh Anh</div>
                <div className="text-xs text-white/60">Sinh viên Đại học Bách Khoa</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h3>
            <p className="text-gray-500 mb-8">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-primary font-bold ml-1 hover:underline"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      name="fullName"
                      type="text" 
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required={!isLogin}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="password"
                    type="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                {isLogin && (
                    <button type="button" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</button>
                  )}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'} 
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-medium tracking-wider">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:border-gray-300 bg-white shadow-sm active:scale-[0.98] w-full">
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-bold text-gray-700">Đăng nhập bằng Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
