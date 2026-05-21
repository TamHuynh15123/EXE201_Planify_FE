import React from 'react';
import { Target, Heart, Rocket } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24">
        <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Về chúng tôi</h2>
        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
          Sứ mệnh của chúng tôi là giúp bạn <br /> <span className="text-secondary">hiện thực hóa</span> mọi ý tưởng.
        </h1>
        <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
          Planify được thành lập với niềm tin rằng bất kỳ ai cũng có thể đạt được những mục tiêu lớn lao nếu có một lộ trình đúng đắn. 
          Chúng tôi sử dụng AI để loại bỏ sự phức tạp trong việc lập kế hoạch, giúp bạn tập trung hoàn toàn vào hành động.
        </p>
      </section>

      {/* Core Values */}
      <section className="bg-white py-24 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900">Giá trị cốt lõi</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'Đơn giản hóa', 
                desc: 'Chúng tôi biến những dự án phức tạp thành các bước nhỏ dễ dàng thực hiện.',
                icon: <Rocket className="text-primary" size={32} />
              },
              { 
                title: 'Dựa trên dữ liệu', 
                desc: 'Mọi đề xuất của AI đều dựa trên các mô hình quản lý dự án hiệu quả nhất thế giới.',
                icon: <Target className="text-secondary" size={32} />
              },
              { 
                title: 'Đồng hành', 
                desc: 'Chúng tôi không chỉ là công cụ, chúng tôi là đối tác tin cậy trong hành trình của bạn.',
                icon: <Heart className="text-accent" size={32} />
              }
            ].map((value, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/5 transition-colors">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h4>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ sáng lập</h3>
          <p className="text-gray-500">Những người đứng sau sự đột phá của Planify AI.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: 'Alex Nguyen', role: 'CEO & Founder', image: '👨‍💼' },
            { name: 'Sarah Tran', role: 'CTO / AI Research', image: '👩‍💻' },
            { name: 'Michael Le', role: 'Head of Product', image: '👨‍🎨' },
            { name: 'Elena Pham', role: 'Customer Success', image: '👩‍💼' }
          ].map((member, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center hover:shadow-xl transition-all">
              <div className="text-6xl mb-6 bg-gray-50 w-24 h-24 flex items-center justify-center rounded-full mx-auto">
                {member.image}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h4>
              <p className="text-primary text-sm font-medium mb-4">{member.role}</p>
              <div className="flex justify-center space-x-3 text-gray-400">
                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:text-primary cursor-pointer">in</div>
                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:text-primary cursor-pointer">tw</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / Numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 text-white flex flex-wrap justify-around gap-12">
          <div className="text-center">
            <div className="text-5xl font-black mb-2 text-primary">3+</div>
            <div className="text-gray-400 uppercase tracking-widest text-xs">Năm phát triển</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2 text-secondary">50+</div>
            <div className="text-gray-400 uppercase tracking-widest text-xs">Kỹ sư & Chuyên gia</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2 text-accent">1M+</div>
            <div className="text-gray-400 uppercase tracking-widest text-xs">Nhiệm vụ được hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2 text-primary">24/7</div>
            <div className="text-gray-400 uppercase tracking-widest text-xs">Hỗ trợ khách hàng</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
