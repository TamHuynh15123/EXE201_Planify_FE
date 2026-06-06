import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Heart, Download, BookOpen, User, 
  ChevronLeft, ChevronRight, Plus 
} from 'lucide-react';
import { communityService } from '../services/communityService';
import { CommunityPlanSummary, CommunityPlanQuery } from '../types/community.types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CommunityLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<CommunityPlanSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Query States
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_downloaded'>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const query: CommunityPlanQuery = {
        search: search.trim() || undefined,
        sortBy,
        page,
        pageSize
      };
      const response = await communityService.getLibrary(query);
      const data = response.data || (response as any).Data || response;
      if (data) {
        setPlans(data.items || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error: any) {
      console.error('Error fetching community library:', error);
      showToast('Lỗi khi tải thư viện cộng đồng: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, page, showToast]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // Reset page when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSortChange = (newSortBy: 'newest' | 'popular' | 'most_downloaded') => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handleLike = async (e: React.MouseEvent, plan: CommunityPlanSummary) => {
    e.stopPropagation(); // Prevent card navigation
    if (!user) {
      showToast('Vui lòng đăng nhập để thích kế hoạch', 'warning');
      return;
    }

    try {
      const response = await communityService.toggleLike(plan.id);
      const data = response.data || response;
      
      // Update local state
      setPlans(plans.map(p => {
        if (p.id === plan.id) {
          const isLiked = data.isLiked;
          return {
            ...p,
            isLikedByCurrentUser: isLiked,
            likeCount: isLiked ? p.likeCount + 1 : p.likeCount - 1
          };
        }
        return p;
      }));

      showToast(data.message || 'Thao tác thành công', 'success');
    } catch (error: any) {
      showToast('Lỗi khi tương tác: ' + error.message, 'error');
    }
  };

  const handleCopy = async (e: React.MouseEvent, plan: CommunityPlanSummary) => {
    e.stopPropagation(); // Prevent card navigation
    if (!user) {
      showToast('Vui lòng đăng nhập để sao chép kế hoạch về tài khoản', 'warning');
      return;
    }

    try {
      showToast('Đang sao chép kế hoạch...', 'info');
      const response = await communityService.copyPlan(plan.id);
      const data = response.data || response;
      showToast(data.message || 'Đã sao chép kế hoạch thành công!', 'success');
      
      const newPlanId = data.plan?.id;
      if (newPlanId) {
        navigate(`/plans/${newPlanId}`);
      }
    } catch (error: any) {
      showToast('Lỗi khi sao chép: ' + error.message, 'error');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-surface font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden bg-white border border-neutral-900 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-300">
          <div className="absolute -inset-4 bg-gradient-ai opacity-5 blur-3xl rounded-full"></div>
          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="text-[10px] font-black text-primary bg-primary/5 border border-primary/20 px-3 py-1 uppercase tracking-widest rounded-full">
              Thư viện lộ trình
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-950 uppercase tracking-tight leading-tight">
              Thư Viện <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Cộng Đồng</span>
            </h1>
            <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-xl">
              Khám phá, sao chép và bình chọn các lộ trình học tập, phát triển bản thân được chia sẻ bởi hàng ngàn lập kế hoạch viên từ cộng đồng Planify.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Link 
              to="/planning" 
              className="inline-flex items-center gap-2.5 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] rounded-2xl"
            >
              <Plus size={16} /> Chia sẻ lộ trình của bạn
            </Link>
          </div>
        </div>

        {/* Toolbar & Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white border border-neutral-200 p-4 shadow-sm rounded-none">
          {/* Search Box */}
          <div className="relative flex-grow max-w-md">
            <input 
              type="text"
              placeholder="Tìm kiếm kế hoạch (ví dụ: IELTS, Fitness, React...)"
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 outline-none focus:bg-white focus:border-primary transition-all text-xs font-medium"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { label: 'Mới nhất', value: 'newest' },
              { label: 'Xem nhiều nhất', value: 'popular' },
              { label: 'Tải nhiều nhất', value: 'most_downloaded' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleSortChange(tab.value as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap rounded-xl ${
                  sortBy === tab.value 
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/10' 
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Library Grid */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white border border-neutral-200">
            <div className="w-10 h-10 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-4 animate-pulse">Đang tìm kiếm dữ liệu...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-24 text-center bg-white border-2 border-dashed border-neutral-200 p-8">
            <BookOpen size={40} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="text-base font-black text-neutral-950 uppercase tracking-wider">Không tìm thấy kế hoạch nào</h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Hãy thử tìm kiếm với các từ khóa khác.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => navigate(`/community/${plan.id}`)}
                  className="bg-white border border-neutral-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 flex-grow space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-neutral-100 flex items-center justify-center text-neutral-500 border border-neutral-200">
                        <User size={12} />
                      </div>
                      <span className="text-[10px] font-black text-neutral-800 uppercase tracking-wider">
                        {plan.authorName || 'Ẩn danh'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-neutral-950 uppercase group-hover:text-primary transition-colors leading-tight">
                      {plan.title}
                    </h3>
                    
                    <p className="text-xs text-neutral-500 font-medium leading-relaxed line-clamp-3">
                      {plan.description || 'Không có mô tả cho kế hoạch này.'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-neutral-500">
                    <div className="flex items-center gap-4">
                      {/* Like Stat */}
                      <button 
                        onClick={(e) => handleLike(e, plan)}
                        className={`flex items-center gap-1.5 transition-colors group/like ${
                          plan.isLikedByCurrentUser 
                            ? 'text-red-500' 
                            : 'hover:text-red-500'
                        }`}
                        title="Yêu thích"
                      >
                        <Heart size={14} fill={plan.isLikedByCurrentUser ? "currentColor" : "none"} className="transition-transform group-hover/like:scale-125" />
                        <span className="text-[10px] font-black">{plan.likeCount}</span>
                      </button>

                      {/* Download Stat */}
                      <div className="flex items-center gap-1.5" title="Số lượt tải về">
                        <Download size={14} />
                        <span className="text-[10px] font-black">{plan.downloadCount}</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleCopy(e, plan)}
                      className="px-3 py-1.5 bg-white border border-primary text-primary hover:bg-primary hover:text-white text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-lg"
                    >
                      <Download size={10} /> Lưu lộ trình
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-200">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-neutral-200 hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-neutral-200 transition-all rounded-lg"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-neutral-200 hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-neutral-200 transition-all rounded-lg"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityLibrary;
