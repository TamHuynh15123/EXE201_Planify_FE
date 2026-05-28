import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layout, Calendar, BarChart3, ChevronRight, 
  Search, Filter, Plus, RefreshCw, Target
} from 'lucide-react';
import { planService } from '../services/planService';
import { Plan } from '../types/plan.types';

const MyPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await planService.getAllPlans();
      console.log('Raw Get All Plans Response:', response);
      
      // Handle different response structures: response.data, response.Data, or the response itself
      let rawData = (response as any).data || (response as any).Data || response;
      
      // If the data is wrapped in an object with an 'items' property (common in paginated APIs)
      if (rawData && !Array.isArray(rawData) && (rawData.items || rawData.Items)) {
        rawData = rawData.items || rawData.Items;
      }
      
      console.log('Extracted Plans Array:', rawData);
      
      // Map data to ensure consistency with types
      const mappedPlans = (Array.isArray(rawData) ? rawData : []).map((p: any) => ({
        ...p,
        id: p.id || p.Id,
        title: p.title || p.Title,
        description: p.description || p.Description,
        progress: p.progress !== undefined ? p.progress : (p.Progress !== undefined ? p.Progress : 0),
        deadline: p.deadline || p.Deadline,
        status: p.status || p.Status,
        isPublic: p.isPublic !== undefined ? p.isPublic : (p.IsPublic !== undefined ? p.IsPublic : false)
      }));
      
      setPlans(mappedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter(plan => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <RefreshCw className="animate-spin text-primary mb-4" size={40} />
        <p className="text-gray-500 font-medium">Đang tải danh sách kế hoạch...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Kế hoạch của tôi</h1>
            <p className="text-gray-500 font-medium text-lg">Quản lý và theo dõi lộ trình chinh phục mục tiêu của bạn.</p>
          </div>
          <Link 
            to="/planning" 
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-ai text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={20} />
            Tạo kế hoạch mới
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm kế hoạch theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm"
            />
          </div>
          <div className="md:col-span-4 flex gap-4">
            <button className="flex-grow flex items-center justify-center gap-2 px-4 py-4 bg-white border border-gray-100 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={18} />
              Bộ lọc
            </button>
            <button 
              onClick={fetchPlans}
              className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:text-primary transition-all shadow-sm"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan) => (
              <Link 
                key={plan.id} 
                to={`/plans/${plan.id}`}
                className="group bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${plan.progress === 100 ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/5 text-primary'}`}>
                    <Target size={24} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    plan.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {plan.status === 'done' ? 'Hoàn thành' : 'Đang thực hiện'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-1">
                  {plan.title}
                </h3>
                <p className="text-gray-500 text-sm mb-8 line-clamp-2 min-h-[40px]">
                  {plan.description || 'Không có mô tả cho kế hoạch này.'}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-black text-gray-400 uppercase">Tiến độ</span>
                    <span className="text-sm font-black text-primary">{plan.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} />
                      <span className="text-[11px] font-bold">
                        {new Date(plan.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold text-xs">
                      Chi tiết <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
              <Layout size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có kế hoạch nào</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Bạn chưa tạo lộ trình nào. Hãy bắt đầu ngay để hiện thực hóa mục tiêu của mình!</p>
            <Link 
              to="/planning" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-secondary transition-all"
            >
              <Plus size={20} />
              Tạo lộ trình đầu tiên
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlans;
