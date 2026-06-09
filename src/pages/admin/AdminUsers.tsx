import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  UserCheck, 
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { userService, UserAdminResponse } from '../../services/userService';
import { useToast } from '../../context/ToastContext';

const AdminUsers: React.FC = () => {
  const { showToast } = useToast();
  const [usersList, setUsersList] = useState<UserAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced filters state
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userService.adminGetAllUsers();
      setUsersList(response.data || []);
    } catch (error: any) {
      console.error('Error fetching users for admin:', error);
      showToast(error.message || 'Không thể tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter logic
  const filteredUsers = usersList.filter(user => {
    // 1. Search Query Match
    const matchesSearch = 
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.id && user.id.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Role Match
    let matchesRole = true;
    if (roleFilter !== 'All') {
      const isAdmin = user.roles?.includes('Admin');
      if (roleFilter === 'Admin' && !isAdmin) matchesRole = false;
      if (roleFilter === 'User' && isAdmin) matchesRole = false;
    }

    // 3. Plan Match
    let matchesPlan = true;
    if (planFilter !== 'All') {
      const planName = user.planName || 'Free';
      if (planFilter === 'Free' && planName.toLowerCase() !== 'free') matchesPlan = false;
      if (planFilter === 'Premium' && planName.toLowerCase() === 'free') matchesPlan = false;
    }

    return matchesSearch && matchesRole && matchesPlan;
  });



  return (
    <div className="space-y-6 min-h-screen bg-[#fcfcfd] p-1">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tra cứu thông tin tài khoản, vai trò và trạng thái gói dịch vụ của tất cả thành viên.
          </p>
        </div>
        <button 
          onClick={fetchUsers}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm text-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tổng số tài khoản</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {isLoading ? '...' : usersList.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Shield size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Quản trị viên (Admin)</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {isLoading ? '...' : usersList.filter(u => u.roles?.includes('Admin')).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tài khoản Premium</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {isLoading ? '...' : usersList.filter(u => u.planName && u.planName.toLowerCase() !== 'free').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên, email hoặc ID..."
            className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter size={14} />
            <span>Lọc theo:</span>
          </div>

          {/* Role Filter */}
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white"
          >
            <option value="All">Tất cả vai trò</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>

          {/* Plan Filter */}
          <select 
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white"
          >
            <option value="All">Tất cả gói</option>
            <option value="Free">Gói mặc định (Free)</option>
            <option value="Premium">Gói trả phí (Premium)</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-xs font-bold text-slate-400">Đang tải danh sách người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <AlertCircle className="text-slate-300 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-400">Không tìm thấy người dùng nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Thành viên</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Gói dịch vụ</th>
                  <th className="px-6 py-4">Mã tài khoản (ID)</th>
                  <th className="px-6 py-4">Ngày hết hạn</th>
                  <th className="px-6 py-4 text-center">Trạng thái gói</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredUsers.map((userAccount) => {
                  const isPremium = userAccount.planName && userAccount.planName.toLowerCase() !== 'free';
                  const isExpired = userAccount.planStatus?.toLowerCase() === 'expired';
                  
                  return (
                    <tr key={userAccount.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center font-black text-slate-600 uppercase text-xs">
                            {userAccount.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{userAccount.fullName || 'Chưa cập nhật'}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{userAccount.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-1.5">
                          {userAccount.roles?.includes('Admin') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100/40">
                              <Shield size={10} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200/40">
                              <UserCheck size={10} /> User
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`text-xs font-black ${isPremium ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {userAccount.planName || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-mono text-[10px] text-slate-400 select-all">{userAccount.id}</td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium">
                        {userAccount.subscriptionExpiresAt 
                          ? new Date(userAccount.subscriptionExpiresAt).toLocaleDateString('vi-VN') 
                          : 'Vô thời hạn'}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        {isPremium ? (
                          isExpired ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Hết hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Đang hoạt động
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
                            Mặc định
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-450">
          <span>Hiển thị {filteredUsers.length} trên tổng số {usersList.length} tài khoản</span>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
