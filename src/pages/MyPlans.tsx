import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout, Plus } from 'lucide-react';

const MyPlans: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate directly to the active plan since there's no Get All API yet
    const currentPlanId = localStorage.getItem('currentPlanId');
    if (currentPlanId) {
      navigate(`/plans/${currentPlanId}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="text-center py-16 bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-8 md:p-12 shadow-sm max-w-lg w-full animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-6">
          <Layout size={40} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3">Chưa có kế hoạch nào</h3>
        <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          Bạn chưa có lộ trình nào đang hoạt động. Hãy tạo một kế hoạch mới để bắt đầu hành trình của bạn!
        </p>
        <Link 
          to="/planning" 
          className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-ai text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={22} />
          Tạo lộ trình đầu tiên
        </Link>
      </div>
    </div>
  );
};

export default MyPlans;
