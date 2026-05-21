import React from 'react';
import { Sparkles, Target, Zap, Clock, CheckCircle2, ArrowRight, Layout, BarChart3, Users2 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
              Biến Mục Tiêu Thành <span className="text-secondary">Kế Hoạch</span> <br />
              <span className="text-primary">Hành Động</span> Với AI
            </h1>
            <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
              Mô tả bất kỳ mục tiêu nào và để AI phân chia thành các nhiệm vụ, 
              nhiệm vụ phụ và mốc thời gian — giúp bạn tập trung vào thực hiện, 
              không phải lên kế hoạch.
            </p>

            <div className="flex items-center max-w-lg p-1 bg-white rounded-xl shadow-xl border border-gray-100">
              <input 
                type="text" 
                placeholder="VD: Thiết lập kế hoạch học tập với môn học..." 
                className="flex-grow px-4 py-3 outline-none text-gray-700 bg-transparent"
              />
              <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-2">
                Tạo kế hoạch <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-gradient-ai opacity-20 blur-3xl rounded-full"></div>
            <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
               <img src="/hero-ai.png" alt="AI Planning" className="w-full h-auto rounded-xl" />
            </div>
          </div>
        </div>
      </section>

    

      {/* How It Works Section - Mockup Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">CÁCH HOẠT ĐỘNG</h2>
          <h3 className="text-4xl font-bold text-gray-900">Ba bước đơn giản</h3>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              step: 'BƯỚC 1', 
              title: 'Nhập mục tiêu của bạn', 
              desc: 'Nhập bất kỳ mục tiêu hoặc ý tưởng dự án nào — từ khởi nghiệp đến học kỹ năng mới.',
              icon: <Target className="text-primary/70" size={24} />
            },
            { 
              step: 'BƯỚC 2', 
              title: 'AI tạo kế hoạch', 
              desc: 'AI phân tích mục tiêu và tạo ra các nhiệm vụ, nhiệm vụ phụ và các mốc liên hệ có cấu trúc.',
              icon: <Sparkles className="text-secondary/70" size={24} />
            },
            { 
              step: 'BƯỚC 3', 
              title: 'Theo dõi & thực hiện', 
              desc: 'Nhận mốc thời gian với hạn chót, nhắc nhở và theo dõi tiến độ để đi đúng hướng.',
              icon: <Clock className="text-accent/70" size={24} />
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 border border-gray-100 shadow-[0_20px_50px_rgba(79,70,229,0.1)] relative group">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">{item.step}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h4>
              <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              {/* Bottom purple accent line like in image */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section - Mockup Style */}
      <section className="bg-gradient-ai py-24 bg-gradient-to-b from-white to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">TÍNH NĂNG</h2>
          <h3 className="text-4xl font-bold text-gray-900">Mọi thứ bạn cần để lên kế hoạch thông minh hơn</h3>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Row - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Tạo nhiệm vụ bằng AI', desc: 'Tự động phân chia bất kỳ mục tiêu nào thành các nhiệm vụ và nhiệm vụ phụ có cấu trúc, rõ ràng.', icon: <Sparkles className="text-primary" /> },
              { title: 'Lập hạn chót tự động', desc: 'Nhận mốc thời gian thông minh phân bổ công việc đều đặn dựa trên deadline của bạn.', icon: <Clock className="text-secondary" /> },
              { title: 'Nhắc nhở thông minh', desc: 'Không bao giờ bỏ lỡ deadline với các nhắc nhở tự điều chỉnh theo tiến độ của bạn.', icon: <CheckCircle2 className="text-accent" /> }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom Row - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Bảng theo dõi tiến độ', desc: 'Trực quan hóa tiến độ với biểu đồ trực quan và các chỉ số hoàn thành.', icon: <BarChart3 className="text-blue-500" /> },
              { title: 'Trợ lý AI Chat', desc: 'Đặt câu hỏi, nhận gợi ý và tinh chỉnh kế hoạch với trợ lý AI.', icon: <Users2 className="text-purple-500" /> }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Section - Redesigned Step-by-Step */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Ví dụ thực tế</h2>
          <h3 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Xem AI lập kế hoạch thực tế</h3>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Quy trình từ ý tưởng đến lộ trình chi tiết được thực hiện tự động và khoa học.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-accent/50 hidden lg:block"></div>

            <div className="space-y-24">
              {/* Step 1 */}
              <div className="relative flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2 lg:text-right">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold mb-4 lg:hidden">1</div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">Nhập mục tiêu của bạn</h4>
                  <p className="text-gray-600 leading-relaxed max-w-md lg:ml-auto">
                    Chỉ cần mô tả mong muốn của bạn bằng ngôn ngữ tự nhiên. AI sẽ hiểu ngữ cảnh và yêu cầu kỹ thuật đằng sau đó.
                  </p>
                  <div className="mt-6 p-4 bg-surface rounded-xl border-l-4 border-primary inline-block text-left">
                    <p className="text-sm italic text-gray-700 font-medium">"Thiết lập kế hoạch và lộ trình cho..."</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-primary z-10 hidden lg:flex items-center justify-center font-bold text-primary shadow-lg">1</div>
                <div className="lg:w-1/2">
                   <div className="p-2 bg-white rounded-2xl shadow-2xl border border-gray-100 rotate-1 hover:rotate-0 transition-transform duration-500">
                      <img src="/Img11.png" alt="Step 1" className="w-full h-auto rounded-xl" />
                   </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col lg:flex-row-reverse items-center gap-12">
                <div className="lg:w-1/2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-white font-bold mb-4 lg:hidden">2</div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">AI Phân tích & Thiết kế</h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Hệ thống tính toán lộ trình, phân chia các giai đoạn phát triển và thiết lập các cột mốc quan trọng.
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-gray-500">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary" /> Tính toán lộ trình hợp lý</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary" /> Xây dựng lịch trình chi tiết</li>
                  </ul>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-secondary z-10 hidden lg:flex items-center justify-center font-bold text-secondary shadow-lg">2</div>
                <div className="lg:w-1/2">
                   <div className="p-2 bg-white rounded-2xl shadow-2xl border border-gray-100 -rotate-1 hover:rotate-0 transition-transform duration-500">
                      <img src="/feature-dev.png" alt="Step 2" className="w-full h-auto rounded-xl" />
                   </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2 lg:text-right">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white font-bold mb-4 lg:hidden">3</div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">Hoàn thiện & Thực hiện</h4>
                  <p className="text-gray-600 leading-relaxed max-w-md lg:ml-auto">
                    Lập bảng thời gian, tạo danh sách nhiệm vụ cụ thể và bắt đầu hành trình chinh phục mục tiêu của bạn.
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-gray-500 lg:flex lg:flex-col lg:items-end">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent" /> Lập bảng thời gian</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent" /> Tạo bảng hoàn chỉnh</li>
                  </ul>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-accent z-10 hidden lg:flex items-center justify-center font-bold text-accent shadow-lg">3</div>
                <div className="lg:w-1/2">
                   <div className="p-2 bg-white rounded-2xl shadow-2xl border border-gray-100 rotate-1 hover:rotate-0 transition-transform duration-500">
                      <img src="/feature-plan.png" alt="Step 3" className="w-full h-auto rounded-xl" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-ai rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 p-8 opacity-10">
              <Target size={120} className="text-white" />
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-8 relative z-10 leading-tight">
              Sẵn sàng để biến dự định <br /> thành hiện thực?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Gia nhập cùng 10,000+ người dùng đang tối ưu hóa công việc của họ mỗi ngày với Planify.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button className="bg-white text-primary hover:bg-gray-50 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl">
                Bắt đầu miễn phí
              </button>
              <button className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 rounded-xl font-bold text-lg transition-all">
                Xem bảng giá
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
