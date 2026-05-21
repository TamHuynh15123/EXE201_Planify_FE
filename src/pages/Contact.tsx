import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">LIÊN HỆ</h2>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">Chúng tôi luôn sẵn sàng lắng nghe</h3>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Bạn có câu hỏi, góp ý hay muốn hợp tác? Hãy để lại lời nhắn, đội ngũ Planify sẽ phản hồi bạn trong vòng 24h.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {[
              { icon: <Mail className="text-primary" />, title: 'Email', detail: 'support@planify.ai', desc: 'Gửi email cho chúng tôi bất cứ lúc nào.' },
              { icon: <Phone className="text-secondary" />, title: 'Điện thoại', detail: '+84 (0) 123 456 789', desc: 'Thứ 2 - Thứ 6, từ 8:00 đến 17:00.' },
              { icon: <MapPin className="text-accent" />, title: 'Văn phòng', detail: 'Đà Nẵng, Việt Nam', desc: 'Khu Công nghệ cao, Hòa Vang.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <p className="text-primary font-medium my-1">{item.detail}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-xl border border-gray-100">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Họ và tên</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Email liên hệ</label>
                    <input 
                      type="email" 
                      placeholder="example@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Chủ đề</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white">
                    <option>Hỗ trợ kỹ thuật</option>
                    <option>Hợp tác kinh doanh</option>
                    <option>Góp ý tính năng</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Lời nhắn</label>
                  <textarea 
                    rows={4}
                    placeholder="Bạn cần chúng tôi giúp đỡ điều gì?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <button className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                  Gửi lời nhắn <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
