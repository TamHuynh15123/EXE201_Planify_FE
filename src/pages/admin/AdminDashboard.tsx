import React from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Người dùng mới', value: '128', icon: <Users className="text-blue-600" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Doanh thu tháng', value: '45.2M', icon: <TrendingUp className="text-green-600" />, trend: '+8%', color: 'bg-green-50' },
    { label: 'Gói đang hoạt động', value: '850', icon: <CreditCard className="text-purple-600" />, trend: '+5%', color: 'bg-purple-50' },
    { label: 'Tỷ lệ duy trì', value: '92%', icon: <Activity className="text-orange-600" />, trend: '+2%', color: 'bg-orange-50' },
  ];

  const recentActivities = [
    { user: 'Nguyễn Văn A', action: 'Nâng cấp lên gói Premium', time: '2 phút trước', icon: <CheckCircle className="text-green-500" size={16} /> },
    { user: 'Trần Thị B', action: 'Tạo kế hoạch mới', time: '15 phút trước', icon: <Calendar className="text-blue-500" size={16} /> },
    { user: 'Lê Văn C', action: 'Đăng ký tài khoản', time: '45 phút trước', icon: <Users className="text-purple-500" size={16} /> },
    { user: 'Phạm Minh D', action: 'Gia hạn gói Pro', time: '1 giờ trước', icon: <Clock className="text-orange-500" size={16} /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chào mừng trở lại, Admin!</h1>
        <p className="text-gray-500">Dưới đây là tổng quan về hệ thống Planify hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Tăng trưởng người dùng</h2>
            <select className="bg-gray-50 border-none text-sm font-semibold text-gray-500 rounded-lg px-3 py-1 outline-none">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 70, 45, 90, 65, 85, 55].map((height, i) => (
              <div key={i} className="flex-1 bg-primary/10 rounded-t-lg hover:bg-primary/30 transition-colors relative group">
                <div 
                  className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {height} users
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
          <div className="space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{activity.user}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors">
            Xem tất cả hoạt động
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
