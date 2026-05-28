import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, BillingCycle } from '../../types/subscription.types';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const AdminSubscriptions: React.FC = () => {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: '',
    title: '',
    message: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    billingCycle: 'monthly' as BillingCycle,
    aiRequestsLimit: 0,
    storageLimitMb: 0,
    maxPlans: 0,
    features: '',
    isActive: true,
  });

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await subscriptionService.adminGetAllPlans();
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showToast('Không thể tải danh sách gói dịch vụ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        billingCycle: plan.billingCycle,
        aiRequestsLimit: plan.aiRequestsLimit,
        storageLimitMb: plan.storageLimitMb,
        maxPlans: plan.maxPlans,
        features: plan.features,
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: 0,
        billingCycle: 'monthly',
        aiRequestsLimit: 0,
        storageLimitMb: 0,
        maxPlans: 0,
        features: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await subscriptionService.adminUpdatePlan(editingPlan.id, formData);
        showToast('Cập nhật gói dịch vụ thành công', 'success');
      } else {
        await subscriptionService.adminCreatePlan(formData);
        showToast('Tạo gói dịch vụ mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      showToast(error.message || 'Có lỗi xảy ra khi lưu gói dịch vụ', 'error');
    }
  };

  const handleDeactivate = (id: string) => {
    setConfirmModal({
      isOpen: true,
      id: id,
      title: 'Vô hiệu hóa gói dịch vụ?',
      message: 'Người dùng sẽ không thể đăng ký gói này nữa. Các người dùng đang sử dụng vẫn có thể tiếp tục cho đến khi hết hạn.'
    });
  };

  const confirmDeactivate = async () => {
    try {
      await subscriptionService.adminDeactivatePlan(confirmModal.id);
      showToast('Đã vô hiệu hóa gói dịch vụ', 'success');
      fetchPlans();
    } catch (error: any) {
      console.error('Error deactivating plan:', error);
      showToast(error.message || 'Không thể vô hiệu hóa gói', 'error');
    }
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Gói dịch vụ</h1>
          <p className="text-gray-500">Thiết lập và quản lý các gói đăng ký cho người dùng</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus size={20} />
          Tạo gói mới
        </button>
      </div>

      {/* Stats/Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số gói</p>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{plans.filter(p => p.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-xl text-red-600">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã vô hiệu hóa</p>
              <p className="text-2xl font-bold text-gray-900">{plans.filter(p => !p.isActive).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tên gói..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-4 py-2 border border-gray-200 rounded-xl transition-colors">
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên gói</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá (VND)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chu kỳ</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Giới hạn AI</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kế hoạch tối đa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Không tìm thấy gói nào</td>
                </tr>
              ) : filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{plan.name}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {plan.price.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-600">{plan.billingCycle}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {plan.aiRequestsLimit} reqs/mo
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {plan.maxPlans} plans
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      plan.isActive 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {plan.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(plan)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeactivate(plan.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        disabled={!plan.isActive}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Simple implementation for now */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPlan ? 'Cập nhật gói dịch vụ' : 'Tạo gói dịch vụ mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Tên gói</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Giá (VND)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Chu kỳ thanh toán</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.billingCycle}
                    onChange={e => setFormData({...formData, billingCycle: e.target.value as BillingCycle})}
                  >
                    <option value="monthly">Hàng tháng</option>
                    <option value="yearly">Hàng năm</option>
                    <option value="lifetime">Trọn đời</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Giới hạn yêu cầu AI</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.aiRequestsLimit}
                    onChange={e => setFormData({...formData, aiRequestsLimit: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Dung lượng lưu trữ (MB)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.storageLimitMb}
                    onChange={e => setFormData({...formData, storageLimitMb: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Số lượng kế hoạch tối đa</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.maxPlans}
                    onChange={e => setFormData({...formData, maxPlans: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Tính năng (phân tách bằng dấu phẩy)</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-24"
                  value={formData.features}
                  onChange={e => setFormData({...formData, features: e.target.value})}
                  placeholder="Ví dụ: Tạo kế hoạch AI, Xuất PDF, Không quảng cáo"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Trạng thái hoạt động
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  {editingPlan ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Confirm Modal */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        confirmText="Vô hiệu hóa ngay"
        onConfirm={confirmDeactivate}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default AdminSubscriptions;
