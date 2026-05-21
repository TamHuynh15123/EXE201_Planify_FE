import React from 'react';
import { Globe, MessageCircle, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">PLANIFY</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Nền tảng lập kế hoạch thông minh sử dụng trí tuệ nhân tạo để biến ý tưởng thành hành động cụ thể.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-primary transition-colors"><Globe size={20} /></a>
              <a href="#" className="hover:text-primary transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Mail size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Sản phẩm</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('home')} className="text-gray-500 hover:text-primary text-sm transition-colors">Trang chủ</button></li>
              <li><button onClick={() => onNavigate('planning')} className="text-gray-500 hover:text-primary text-sm transition-colors">Tính năng AI</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="text-gray-500 hover:text-primary text-sm transition-colors">Bảng giá</button></li>
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Tích hợp</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Công ty</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('about')} className="text-gray-500 hover:text-primary text-sm transition-colors">Về chúng tôi</button></li>
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Đăng ký bản tin</h4>
            <p className="text-gray-500 text-sm mb-4">Nhận thông tin cập nhật mới nhất về các tính năng AI.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-gray-50 border border-gray-200 rounded-l-lg px-4 py-2 text-sm w-full outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-r-lg transition-colors">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-xs">
            © 2024 Planify AI. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-primary transition-colors">Chính sách Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
