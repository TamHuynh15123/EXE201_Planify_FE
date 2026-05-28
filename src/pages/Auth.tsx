import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';

interface AuthProps {
  mode: 'login' | 'register';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Sync internal state with prop changes (when navigating between /login and /register)
  useEffect(() => {
    setIsLogin(mode === 'login');
    setError(null);
  }, [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setLoading(true);
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Google Login Error:', err);
      if (err.message.includes('401') || err.message.includes('không hợp lệ')) {
        setError('Lỗi xác thực Google: Client ID không khớp hoặc Token không hợp lệ. Vui lòng kiểm tra lại cấu hình Client ID giữa FE và BE.');
      } else {
        setError(err.message || 'Đăng nhập Google thất bại.');
      }
    } finally {
      setLoading(false);
    }
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
      
      // The state might not be updated yet, so we could check the localStorage or trust the AuthContext
      // But a better way is to handle this in a useEffect or just check what's returned if we can.
      // Since we updated AuthContext to set user, we can navigate based on what's in localStorage if needed,
      // or just navigate to / and let App.tsx handle it if we had a dashboard redirect.
      // However, the requirement says: "Nếu role chứa 'Admin': Điều hướng người dùng về trang Admin Dashboard"
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
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
              <Link 
                to={isLogin ? '/register' : '/login'}
                className="text-primary font-bold ml-1 hover:underline"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </Link>
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

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Đăng nhập Google thất bại.')}
                useOneTap
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
