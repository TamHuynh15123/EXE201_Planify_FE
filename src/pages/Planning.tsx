import React, { useState } from 'react';
import { Target, Calendar, BarChart, Sparkles, RefreshCw, Save } from 'lucide-react';

const Planning: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [detailLevel, setDetailLevel] = useState('medium');

  return (
    <div className="pt-24 pb-16 min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Lập Kế Hoạch Với AI</h1>
          <p className="text-gray-500">Mô tả mục tiêu của bạn và để trí tuệ nhân tạo xây dựng lộ trình chi tiết.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 lg:p-12 space-y-8">
            {/* Goal Input */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                <Target size={18} className="text-primary" /> Mục tiêu của bạn
              </label>
              <textarea 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="VD: Tôi muốn học ReactJS từ cơ bản đến nâng cao trong vòng 2 tháng để có thể đi làm..."
                className="w-full h-40 p-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-gray-700 leading-relaxed resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Deadline */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <Calendar size={18} className="text-primary" /> Thời hạn mong muốn
                </label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all text-gray-700"
                />
              </div>

              {/* Detail Level */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <BarChart size={18} className="text-primary" /> Độ chi tiết
                </label>
                <select 
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all text-gray-700 appearance-none"
                >
                  <option value="low">Cơ bản (Các mốc chính)</option>
                  <option value="medium">Vừa phải (Nhiệm vụ hàng tuần)</option>
                  <option value="high">Chi tiết (Nhiệm vụ hàng ngày)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button className="flex-grow bg-gradient-ai text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group">
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                Tạo kế hoạch thông minh
              </button>
              <button className="px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <Save size={20} />
                Lưu nháp
              </button>
            </div>
          </div>

          {/* AI Helper Text */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <RefreshCw size={14} className="animate-spin-slow" />
              AI luôn sẵn sàng hỗ trợ bạn tối ưu hóa
            </div>
            <div className="text-xs text-gray-400">
              Sử dụng model: <span className="font-bold text-primary">Planify-v4-Turbo</span>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Cụ thể hóa', desc: 'Mô tả càng chi tiết, kế hoạch càng chính xác.' },
            { title: 'Thời gian thực', desc: 'AI sẽ tự động điều chỉnh nếu bạn lỡ deadline.' },
            { title: 'Tích hợp', desc: 'Dễ dàng xuất sang Google Calendar hoặc Notion.' }
          ].map((tip, idx) => (
            <div key={idx} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2 text-sm">{tip.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planning;
