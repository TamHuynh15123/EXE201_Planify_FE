import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Download, User, Calendar, 
  ListTree, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { communityService } from '../services/communityService';
import { CommunityPlan } from '../types/community.types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CommunityPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [communityPlan, setCommunityPlan] = useState<CommunityPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const response = await communityService.getById(id);
        const data = response.data || (response as any).Data || response;
        if (data) {
          setCommunityPlan(data);
        }
      } catch (error: any) {
        console.error('Error loading community plan details:', error);
        showToast('Lỗi khi tải chi tiết kế hoạch: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, showToast]);

  const handleLike = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thích kế hoạch', 'warning');
      return;
    }
    if (!communityPlan) return;

    try {
      const response = await communityService.toggleLike(communityPlan.id);
      const data = response.data || response;
      
      const isLiked = data.isLiked;
      setCommunityPlan({
        ...communityPlan,
        isLikedByCurrentUser: isLiked,
        likeCount: isLiked ? communityPlan.likeCount + 1 : communityPlan.likeCount - 1
      });

      showToast(data.message || 'Thao tác thành công', 'success');
    } catch (error: any) {
      showToast('Lỗi khi tương tác: ' + error.message, 'error');
    }
  };

  const handleCopy = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để sao chép kế hoạch về tài khoản', 'warning');
      return;
    }
    if (!communityPlan) return;

    try {
      showToast('Đang sao chép kế hoạch...', 'info');
      const response = await communityService.copyPlan(communityPlan.id);
      const data = response.data || response;
      showToast(data.message || 'Đã sao chép kế hoạch thành công!', 'success');
      
      const newPlanId = data.plan?.id;
      if (newPlanId) {
        navigate(`/plans/${newPlanId}`);
      }
    } catch (error: any) {
      showToast('Lỗi khi sao chép kế hoạch: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-4 animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!communityPlan) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h3 className="text-base font-black text-neutral-950 uppercase tracking-wider">Không tìm thấy kế hoạch</h3>
        <p className="text-xs text-neutral-500 font-medium mt-1 mb-6">Liên kết này không tồn tại hoặc kế hoạch đã bị gỡ.</p>
        <Link to="/community" className="px-6 py-3 border border-primary text-xs font-black uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all rounded-xl">
          Quay lại thư viện
        </Link>
      </div>
    );
  }

  const rootTasks = communityPlan.plan?.tasks?.filter(t => !t.parentTaskId) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-surface font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Back Link */}
        <Link to="/community" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Quay lại thư viện
        </Link>

        {/* Plan Information Banner */}
        <div className="bg-white border border-neutral-900 p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-neutral-200 pb-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} className="text-neutral-400" /> Tác giả: {communityPlan.authorName || 'Ẩn danh'}
                </span>
                <span className="h-3 w-px bg-neutral-200"></span>
                <span className="text-[10px] font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} className="text-neutral-400" /> Ngày đăng: {new Date(communityPlan.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-neutral-950 uppercase tracking-tight leading-tight">
                {communityPlan.title}
              </h1>
              {communityPlan.plan?.goal && (
                <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-none text-xs font-bold text-neutral-700">
                  <strong className="text-neutral-950">Mục tiêu:</strong> {communityPlan.plan.goal}
                </div>
              )}
            </div>

            {/* Interaction Panel */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Like Button */}
              <button 
                onClick={handleLike}
                className={`h-11 px-5 border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                  communityPlan.isLikedByCurrentUser 
                    ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100' 
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary hover:text-primary'
                }`}
              >
                <Heart size={14} fill={communityPlan.isLikedByCurrentUser ? "currentColor" : "none"} />
                <span>{communityPlan.likeCount} Thích</span>
              </button>

              {/* Download / Save Button */}
              <button 
                onClick={handleCopy}
                className="h-11 px-6 bg-gradient-to-r from-primary to-secondary text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
              >
                <Download size={14} /> Lưu về tài khoản
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Giới thiệu lộ trình</h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-medium">
              {communityPlan.description || 'Không có mô tả chi tiết từ tác giả.'}
            </p>
          </div>
        </div>

        {/* Tasks Preview List */}
        <div className="bg-white border border-neutral-900 p-8 space-y-6">
          <div className="border-b border-primary pb-4 flex items-center gap-3">
            <ListTree className="text-primary" size={18} />
            <h2 className="text-base font-black text-neutral-950 uppercase tracking-wider">Danh sách các đầu việc ({communityPlan.plan?.tasks?.length || 0})</h2>
          </div>

          {rootTasks.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-xs font-bold uppercase tracking-widest">
              Lộ trình này không có đầu việc nào.
            </div>
          ) : (
            <div className="space-y-6">
              {rootTasks.map((task) => {
                const subtasks = communityPlan.plan?.tasks?.filter(t => t.parentTaskId === task.id) || [];
                return (
                  <div key={task.id} className="border border-neutral-200 p-5 space-y-4">
                    {/* Parent Task Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 border uppercase tracking-wider rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <h4 className="font-black text-neutral-950 text-sm mt-1 uppercase leading-snug">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subtasks */}
                    {subtasks.length > 0 && (
                      <div className="pl-4 border-l-2 border-neutral-100 space-y-2.5 ml-1 pt-1">
                        {subtasks.map((subtask) => (
                          <div key={subtask.id} className="flex items-start gap-2.5">
                            <CheckCircle2 size={13} className="text-neutral-300 mt-0.5 flex-shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-black text-neutral-800 leading-snug">
                                {subtask.title}
                              </span>
                              {subtask.description && (
                                <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                                  {subtask.description}
                                </p>
                              )}
                            </div>
                            <span className="ml-auto text-[8px] font-black uppercase text-neutral-400 border border-neutral-200 px-1.5 py-0.2 rounded">
                              {subtask.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CommunityPlanDetail;
