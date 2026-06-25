import React, { useEffect, useState, useCallback } from 'react';
import { 
  Check, X, Eye, RefreshCw, 
  User, Calendar, ShieldAlert 
} from 'lucide-react';
import { adminCommunityService } from '../../services/adminCommunityService';
import { CommunityPlanSummary, CommunityPlan } from '../../types/community.types';
import { useToast } from '../../context/ToastContext';

const AdminCommunityPlans: React.FC = () => {
  const { showToast } = useToast();
  
  const [pendingPlans, setPendingPlans] = useState<CommunityPlanSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Review states
  const [previewPlan, setPreviewPlan] = useState<CommunityPlan | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [rejectingPlanId, setRejectingPlanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminCommunityService.getPending(page, pageSize);
      const data = response.data || (response as any).Data || response;
      if (data) {
        setPendingPlans(data.items || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error: any) {
      console.error('Error fetching pending plans:', error);
      showToast('Lỗi khi tải danh sách chờ duyệt: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn DUYỆT kế hoạch này lên thư viện cộng đồng không?')) {
      try {
        await adminCommunityService.approve(id);
        showToast('Đã duyệt kế hoạch thành công!', 'success');
        setPreviewPlan(null);
        fetchPending();
      } catch (error: any) {
        showToast('Lỗi khi duyệt kế hoạch: ' + error.message, 'error');
      }
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPlanId) return;
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminCommunityService.reject(rejectingPlanId, rejectReason.trim());
      showToast('Đã từ chối kế hoạch này.', 'info');
      setRejectingPlanId(null);
      setRejectReason('');
      setPreviewPlan(null);
      fetchPending();
    } catch (error: any) {
      showToast('Lỗi khi từ chối kế hoạch: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async (id: string) => {
    setIsPreviewLoading(true);
    try {
      const response = await adminCommunityService.getDetail(id);
      const data = response.data || (response as any).Data || response;
      if (data) {
        setPreviewPlan(data);
      }
    } catch (error: any) {
      showToast('Không thể tải chi tiết kế hoạch: ' + error.message, 'error');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ShieldAlert className="text-primary animate-pulse" /> Phê duyệt Kế hoạch Cộng đồng
        </h1>
        <p className="text-gray-500 text-xs mt-1">Duyệt hoặc từ chối các kế hoạch do người dùng đóng góp lên thư viện chung.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main List Table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Danh sách chờ phê duyệt ({totalCount})</h3>
          
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 font-bold tracking-widest uppercase">
              Đang tải danh sách...
            </div>
          ) : pendingPlans.length === 0 ? (
            <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Không có kế hoạch nào đang chờ duyệt.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                      <th className="pb-3 font-semibold">Tên Kế hoạch</th>
                      <th className="pb-3 font-semibold">Tác giả</th>
                      <th className="pb-3 font-semibold">Ngày tạo</th>
                      <th className="pb-3 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPlans.map((plan) => (
                      <tr key={plan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                        <td className="py-4 pr-3 font-bold text-gray-800">
                          <div>
                            <span className="block truncate max-w-xs">{plan.title}</span>
                            <span className="block text-[10px] text-gray-400 font-normal line-clamp-1 mt-0.5">{plan.description}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-3 text-gray-500 font-medium">{plan.authorName || 'Ẩn danh'}</td>
                        <td className="py-4 pr-3 text-gray-400 font-medium">
                          {new Date(plan.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handlePreview(plan.id)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            title="Xem chi tiết để duyệt"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleApprove(plan.id)}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Phê duyệt"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setRejectingPlanId(plan.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Từ chối"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalCount > pageSize && (
                <div className="flex justify-center items-center gap-3 pt-4 border-t border-gray-50">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:border-gray-900 disabled:opacity-40 transition-all"
                  >
                    Trước
                  </button>
                  <span className="text-xs text-gray-500">
                    Trang {page} / {Math.ceil(totalCount / pageSize)}
                  </span>
                  <button
                    disabled={page >= Math.ceil(totalCount / pageSize)}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:border-gray-900 disabled:opacity-40 transition-all"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Preview Drawer / Details panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Xem trước nội dung</h3>
          
          {isPreviewLoading ? (
            <div className="py-20 text-center">
              <RefreshCw className="animate-spin text-primary mx-auto" size={24} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Đang tải cấu trúc...</p>
            </div>
          ) : previewPlan ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-2 border-b border-gray-100 pb-4">
                <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight leading-snug">{previewPlan.title}</h4>
                <div className="flex gap-4 text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-1"><User size={10} /> {previewPlan.authorName || 'Ẩn danh'}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(previewPlan.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-2 leading-relaxed">{previewPlan.description}</p>
                {previewPlan.plan?.goal && (
                  <p className="text-[10px] text-gray-800 bg-gray-50 border border-gray-100 p-2 rounded-xl mt-2 font-bold">
                    Mục tiêu: <span className="font-medium text-gray-600">{previewPlan.plan.goal}</span>
                  </p>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Cấu trúc nhiệm vụ ({previewPlan.plan?.tasks?.length || 0})</span>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {previewPlan.plan?.tasks?.filter(t => !t.parentTaskId).map(task => {
                    const subtasks = previewPlan.plan?.tasks?.filter(st => st.parentTaskId === task.id) || [];
                    return (
                      <div key={task.id} className="bg-gray-50 border border-gray-100 p-3 rounded-2xl space-y-2">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">{task.priority}</span>
                          <span className="text-xs font-black text-gray-800 block">{task.title}</span>
                          {task.description && <span className="text-[10px] text-gray-400 block leading-relaxed">{task.description}</span>}
                        </div>
                        {subtasks.length > 0 && (
                          <div className="pl-3 border-l border-gray-200 space-y-1.5 pt-0.5">
                            {subtasks.map(st => (
                              <div key={st.id}>
                                <span className="text-[11px] font-bold text-gray-700 block">• {st.title}</span>
                                {st.description && <span className="text-[9px] text-gray-400 block">{st.description}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions inside preview */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleApprove(previewPlan.id)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> Duyệt kế hoạch
                </button>
                <button
                  onClick={() => setRejectingPlanId(previewPlan.id)}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-500/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <X size={14} /> Từ chối
                </button>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-gray-300 font-bold uppercase tracking-wider text-[10px]">
              Chọn xem chi tiết một kế hoạch để duyệt
            </div>
          )}
        </div>

      </div>

      {/* Reject Modal */}
      {rejectingPlanId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-5 transform animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-black text-sm text-gray-800">Từ chối Kế hoạch</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Cung cấp lý do từ chối gửi cho tác giả
              </p>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Lý do từ chối</label>
                <textarea
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Lộ trình sơ sài, sai chính tả nhiều, hoặc nội dung không mang tính thực tế..."
                  className="w-full h-28 p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs text-gray-600 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingPlanId(null);
                    setRejectReason('');
                  }}
                  className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-2xl text-xs hover:bg-red-600 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <>
                      <X size={14} /> Xác nhận từ chối
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCommunityPlans;
