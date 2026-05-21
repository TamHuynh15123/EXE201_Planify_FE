import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      desc: 'Cho cá nhân muốn bắt đầu tổ chức công việc.',
      features: [
        '5 kế hoạch AI mỗi tháng',
        'Phân rã nhiệm vụ cơ bản',
        'Lưu trữ đám mây 100MB',
        'Hỗ trợ cộng đồng'
      ],
      icon: <Zap className="text-blue-500" />,
      buttonText: 'Bắt đầu ngay',
      popular: false
    },
    {
      name: 'Professional',
      price: '19',
      desc: 'Dành cho chuyên gia cần tối ưu hiệu suất.',
      features: [
        'Không giới hạn kế hoạch AI',
        'Phân rã nhiệm vụ nâng cao',
        'Tích hợp Calendar & Notion',
        'Lưu trữ đám mây 10GB',
        'Hỗ trợ ưu tiên 24/7'
      ],
      icon: <Crown className="text-secondary" />,
      buttonText: 'Dùng thử 14 ngày',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '49',
      desc: 'Giải pháp toàn diện cho đội ngũ và doanh nghiệp.',
      features: [
        'Mọi tính năng của bản Pro',
        'Quản lý đội nhóm & phân quyền',
        'API truy cập tùy chỉnh',
        'Bảo mật cấp doanh nghiệp',
        'Quản lý tài khoản riêng'
      ],
      icon: <Shield className="text-accent" />,
      buttonText: 'Liên hệ kinh doanh',
      popular: false
    }
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Bảng giá</h2>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Chọn gói phù hợp với bạn</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Tất cả các gói đều bao gồm cập nhật AI thường xuyên và bảo mật dữ liệu tuyệt đối.</p>
          
          <div className="mt-8 flex justify-center items-center gap-4">
            <span className="text-sm font-medium text-gray-900">Tháng</span>
            <button className="w-12 h-6 bg-gray-200 rounded-full relative p-1 transition-colors">
               <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </button>
            <span className="text-sm font-medium text-gray-500">Năm <span className="text-accent font-bold">(Tiết kiệm 20%)</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative bg-white rounded-3xl p-8 shadow-xl border transition-all hover:scale-105 duration-300 ${plan.popular ? 'border-primary shadow-primary/10 ring-4 ring-primary/5' : 'border-gray-100'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  Phổ biến nhất
                </div>
              )}
              
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                {plan.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6 h-10">{plan.desc}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                <span className="text-gray-400">/tháng</span>
              </div>
              
              <button className={`w-full py-4 rounded-xl font-bold transition-all mb-8 ${plan.popular ? 'bg-primary text-white hover:bg-secondary shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}>
                {plan.buttonText}
              </button>
              
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tính năng bao gồm:</p>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-accent" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Bạn cần một giải pháp tùy chỉnh?</h4>
            <p className="text-gray-500">Chúng tôi cung cấp các gói đặc biệt cho tổ chức giáo dục và phi lợi nhuận.</p>
          </div>
          <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all whitespace-nowrap">
            Nói chuyện với chúng tôi
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
