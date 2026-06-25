import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  BookOpen,
  Filter,
  FileText
} from 'lucide-react';
import { adminTemplateService } from '../../services/adminTemplateService';
import { adminFrameworkService } from '../../services/adminFrameworkService';
import { PlanTemplate, PlanFramework } from '../../types/admin.types';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const AdminPlanTemplates: React.FC = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [frameworks, setFrameworks] = useState<PlanFramework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PlanTemplate | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: '',
    title: '',
    message: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frameworkId: '' as string | null,
    categoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6' as string | null,
    templateContent: '',
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load templates
      const templatesRes = await adminTemplateService.getAll();
      const templatesData = (templatesRes as any).data || (templatesRes as any).Data || templatesRes;
      if (Array.isArray(templatesData)) {
        setTemplates(templatesData);
      } else {
        setTemplates([]);
      }

      // Load frameworks for dropdown options
      const frameworksRes = await adminFrameworkService.getAll();
      const frameworksData = (frameworksRes as any).data || (frameworksRes as any).Data || frameworksRes;
      if (Array.isArray(frameworksData)) {
        setFrameworks(frameworksData.filter(fw => fw.isActive));
      }
    } catch (error: any) {
      console.error('Error loading templates/frameworks:', error);
      showToast('Lỗi khi tải dữ liệu: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (tpl?: PlanTemplate) => {
    if (tpl) {
      setEditingTemplate(tpl);
      setFormData({
        title: tpl.title,
        description: tpl.description || '',
        frameworkId: tpl.frameworkId || '',
        categoryId: tpl.categoryId || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        templateContent: tpl.templateContent || '',
        isActive: tpl.isActive,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        description: '',
        frameworkId: frameworks.length > 0 ? frameworks[0].id : '',
        categoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        templateContent: '{"tasks": []}',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Tiêu đề không được để trống', 'warning');
      return;
    }

    const payload = {
      ...formData,
      frameworkId: formData.frameworkId === '' ? null : formData.frameworkId,
      categoryId: formData.categoryId === '' ? null : formData.categoryId,
    };

    try {
      if (editingTemplate) {
        await adminTemplateService.update(editingTemplate.id, payload);
        showToast('Cập nhật template thành công', 'success');
      } else {
        await adminTemplateService.create(payload);
        showToast('Tạo template mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleDeleteClick = (tpl: PlanTemplate) => {
    setConfirmModal({
      isOpen: true,
      id: tpl.id,
      title: 'Xóa template',
      message: `Bạn có chắc chắn muốn xóa template "${tpl.title}" không? Hành động này không thể hoàn tác.`
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await adminTemplateService.delete(confirmModal.id);
      showToast('Xóa template thành công', 'success');
      fetchData();
    } catch (error: any) {
      showToast('Lỗi khi xóa template: ' + error.message, 'error');
    }
  };

  const handleToggleActive = async (tpl: PlanTemplate) => {
    try {
      if (tpl.isActive) {
        await adminTemplateService.deactivate(tpl.id);
        showToast(`Đã vô hiệu hóa template "${tpl.title}"`, 'info');
      } else {
        await adminTemplateService.update(tpl.id, {
          title: tpl.title,
          description: tpl.description || '',
          frameworkId: tpl.frameworkId,
          categoryId: tpl.categoryId,
          templateContent: tpl.templateContent || '',
          isActive: true
        });
        showToast(`Đã kích hoạt template "${tpl.title}"`, 'success');
      }
      fetchData();
    } catch (error: any) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch = 
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tpl.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFramework = 
      !frameworkFilter || tpl.frameworkId === frameworkFilter;

    return matchesSearch && matchesFramework;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BookOpen className="text-primary animate-pulse" /> Quản lý Templates
          </h1>
          <p className="text-gray-500 text-xs mt-1">Quản lý các bản mẫu lộ trình công việc được thiết lập sẵn của hệ thống.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} /> Thêm Template mới
        </button>
      </div>

      {/* Toolbars & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm">
        <div className="relative flex-grow">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-gray-200 transition-all text-xs font-medium"
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative flex-shrink-0 min-w-[200px]">
          <select
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-gray-200 appearance-none text-xs font-bold text-gray-600 transition-all"
          >
            <option value="">Tất cả Frameworks</option>
            {frameworks.map(fw => (
              <option key={fw.id} value={fw.id}>{fw.name}</option>
            ))}
          </select>
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid view list */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold tracking-widest uppercase">Đang tải templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          Không tìm thấy template nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  {tpl.frameworkName && (
                    <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/5 block w-max">
                      {tpl.frameworkName}
                    </span>
                  )}
                  <h3 className="font-black text-gray-800 text-sm truncate">{tpl.title}</h3>
                </div>
                <button 
                  onClick={() => handleToggleActive(tpl)}
                  className={`p-1 rounded-lg transition-colors ${tpl.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'}`}
                  title={tpl.isActive ? 'Click để vô hiệu hóa' : 'Click để kích hoạt'}
                >
                  {tpl.isActive ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                </button>
              </div>

              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-grow">
                {tpl.description || 'Không có mô tả chi tiết cho template này.'}
              </p>

              {tpl.templateContent && (
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-2 text-gray-500">
                  <FileText size={14} className="text-primary flex-shrink-0" />
                  <span className="text-[10px] font-bold truncate tracking-tight font-mono">{tpl.templateContent}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-gray-50 pt-4 mt-2">
                <button 
                  onClick={() => handleOpenModal(tpl)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  title="Chỉnh sửa"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(tpl)}
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
                  {editingTemplate ? 'Cập nhật Template' : 'Thêm Template Mới'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Thiết lập lộ trình mẫu cho người dùng
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tiêu Đề Template</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Lộ trình chinh phục IELTS 7.0, Front-end ReactJS Developer..."
                  className="w-full p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs font-semibold text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Framework Áp Dụng</label>
                <select
                  value={formData.frameworkId || ''}
                  onChange={(e) => setFormData({ ...formData, frameworkId: e.target.value || null })}
                  className="w-full p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs font-bold text-gray-700"
                >
                  <option value="">Không bắt buộc (Tự do)</option>
                  {frameworks.map(fw => (
                    <option key={fw.id} value={fw.id}>{fw.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mô Tả Chi Tiết</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả bối cảnh, đối tượng áp dụng và kết quả đầu ra của lộ trình mẫu..."
                  className="w-full h-24 p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs text-gray-600 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nội Dung Nhiệm Vụ Mẫu (JSON)</label>
                <textarea 
                  value={formData.templateContent}
                  onChange={(e) => setFormData({ ...formData, templateContent: e.target.value })}
                  placeholder='{"tasks": [{"title": "Nhiệm vụ 1", "description": "Mô tả", "subtasks": []}]}'
                  className="w-full h-36 p-3.5 bg-gray-50 border border-transparent rounded-2xl font-mono text-[10px] outline-none focus:bg-white focus:border-primary/20 transition-all text-gray-600 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox"
                  id="isActiveTemplate"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4.5 h-4.5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isActiveTemplate" className="text-xs font-bold text-gray-700 select-none cursor-pointer">
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

export default AdminPlanTemplates;
