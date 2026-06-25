import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Grid
} from 'lucide-react';
import { adminFrameworkService } from '../../services/adminFrameworkService';
import { PlanFramework } from '../../types/admin.types';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const AdminPlanFrameworks: React.FC = () => {
  const { showToast } = useToast();
  const [frameworks, setFrameworks] = useState<PlanFramework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<PlanFramework | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: '',
    title: '',
    message: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    isActive: true,
  });

  const fetchFrameworks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminFrameworkService.getAll();
      const data = (response as any).data || (response as any).Data || response;
      if (Array.isArray(data)) {
        setFrameworks(data);
      } else {
        setFrameworks([]);
      }
    } catch (error: any) {
      console.error('Error fetching frameworks:', error);
      showToast('Không thể tải danh sách framework: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  const handleOpenModal = (fw?: PlanFramework) => {
    if (fw) {
      setEditingFramework(fw);
      setFormData({
        name: fw.name,
        description: fw.description || '',
        keywords: fw.keywords || '',
        isActive: fw.isActive,
      });
    } else {
      setEditingFramework(null);
      setFormData({
        name: '',
        description: '',
        keywords: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Tên framework không được để trống', 'warning');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      keywords: formData.keywords || undefined,
      isActive: formData.isActive
    };

    try {
      if (editingFramework) {
        await adminFrameworkService.update(editingFramework.id, payload);
        showToast('Cập nhật framework thành công', 'success');
      } else {
        await adminFrameworkService.create(payload);
        showToast('Tạo framework mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchFrameworks();
    } catch (error: any) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleDeleteClick = (fw: PlanFramework) => {
    setConfirmModal({
      isOpen: true,
      id: fw.id,
      title: 'Xóa framework',
      message: `Bạn có chắc chắn muốn xóa framework "${fw.name}" không? Hành động này không thể hoàn tác.`
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await adminFrameworkService.delete(confirmModal.id);
      showToast('Xóa framework thành công', 'success');
      fetchFrameworks();
    } catch (error: any) {
      showToast('Lỗi khi xóa framework: ' + error.message, 'error');
    }
  };

  const handleToggleActive = async (fw: PlanFramework) => {
    try {
      if (fw.isActive) {
        await adminFrameworkService.deactivate(fw.id);
        showToast(`Đã vô hiệu hóa framework "${fw.name}"`, 'info');
      } else {
        await adminFrameworkService.update(fw.id, {
          name: fw.name,
          description: fw.description || '',
          keywords: fw.keywords,
          isActive: true
        });
        showToast(`Đã kích hoạt framework "${fw.name}"`, 'success');
      }
      fetchFrameworks();
    } catch (error: any) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const filteredFrameworks = frameworks.filter(fw => 
    fw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fw.keywords || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fw.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Grid className="text-primary animate-pulse" /> Quản lý Frameworks
          </h1>
          <p className="text-gray-500 text-xs mt-1">Quản lý các cấu trúc và khung sườn hoạch định kế hoạch chuẩn của hệ thống.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} /> Thêm Framework mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm">
        <div className="relative flex-grow">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên, slug, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-gray-200 transition-all text-xs font-medium"
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold tracking-widest uppercase">Đang tải frameworks...</div>
      ) : filteredFrameworks.length === 0 ? (
        <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          Không tìm thấy framework nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFrameworks.map((fw) => (
            <div key={fw.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-black text-gray-800 text-sm truncate">{fw.name}</h3>
                </div>
                <button 
                  onClick={() => handleToggleActive(fw)}
                  className={`p-1 rounded-lg transition-colors ${fw.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'}`}
                  title={fw.isActive ? 'Click để vô hiệu hóa' : 'Click để kích hoạt'}
                >
                  {fw.isActive ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                </button>
              </div>

              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-grow">
                {fw.description || 'Không có mô tả chi tiết cho framework này.'}
              </p>

              {fw.keywords && (
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-2 text-gray-500">
                  <span className="text-[10px] font-bold tracking-tight">Từ khóa: <span className="font-medium text-gray-600">{fw.keywords}</span></span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-gray-50 pt-4 mt-2">
                <button 
                  onClick={() => handleOpenModal(fw)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  title="Chỉnh sửa"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(fw)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Form Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] border border-gray-100 transform animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-black text-sm text-gray-800">
                  {editingFramework ? 'Cập nhật Framework' : 'Thêm Framework Mới'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Thiết lập cấu trúc lập kế hoạch
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tên Framework</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Agile Roadmap, Pomodoro Focus, OKRs Planning..."
                  className="w-full p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs font-semibold text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mô Tả Chi Tiết</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả mục đích và cách áp dụng của cấu trúc này..."
                  className="w-full h-24 p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs text-gray-600 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Từ khóa (Keywords)</label>
                <input 
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Ví dụ: coding, logic, study, ielts..."
                  className="w-full p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs font-semibold text-gray-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4.5 h-4.5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-gray-700 select-none cursor-pointer">
                  Kích hoạt trạng thái hoạt động ngay
                </label>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-100 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl text-xs hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 transition-all"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm deletion */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Xác nhận xóa"
        cancelText="Quay lại"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default AdminPlanFrameworks;
