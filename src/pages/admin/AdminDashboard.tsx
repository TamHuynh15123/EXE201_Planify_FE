import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Shield,
  UserCheck
} from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { userService, UserAdminResponse } from '../../services/userService';

interface ChartPoint {
  year: number;
  month: number;
  revenue: number;
}

interface DailyChartPoint {
  year: number;
  month: number;
  day: number;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [revenueStats, setRevenueStats] = useState<{
    totalRevenue: number;
    successCount: number;
    newUsersCount: number;
    dailyRevenue: Array<DailyChartPoint>;
    monthlyRevenue: Array<ChartPoint>;
    yearlyRevenue: Array<{ year: number; revenue: number }>;
  } | null>(null);
  const [usersList, setUsersList] = useState<UserAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | '12m'>('12m');
  
  // Interactive chart state
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; day?: number; month: number; year: number; revenue: number } | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await subscriptionService.adminGetRevenueStatistics();
        setRevenueStats(response.data);
      } catch (error) {
        console.error('Error fetching revenue statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await userService.adminGetAllUsers();
        setUsersList(response.data || []);
      } catch (error) {
        console.error('Error fetching users for admin:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchStats();
    fetchUsers();
  }, []);

  const totalRevenue = revenueStats?.totalRevenue || 0;
  const successCount = revenueStats?.successCount || 0;
  const dailyData = revenueStats?.dailyRevenue || [];
  const monthlyData = revenueStats?.monthlyRevenue || [];

  // Dynamically resolve active chart data and fallback mock data
  const getChartConfig = () => {
    if (activeRange === '7d') {
      const sortedDaily = [...dailyData]
        .sort((a, b) => {
          const dateA = new Date(a.year, a.month - 1, a.day);
          const dateB = new Date(b.year, b.month - 1, b.day);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(-7);

      const hasRealData = sortedDaily.length > 0;
      const data = hasRealData ? sortedDaily : [
        { year: 2026, month: 6, day: 3, revenue: 1200000 },
        { year: 2026, month: 6, day: 4, revenue: 2500000 },
        { year: 2026, month: 6, day: 5, revenue: 1800000 },
        { year: 2026, month: 6, day: 6, revenue: 3200000 },
        { year: 2026, month: 6, day: 7, revenue: 2900000 },
        { year: 2026, month: 6, day: 8, revenue: 4100000 },
        { year: 2026, month: 6, day: 9, revenue: 3800000 }
      ];
      return { data, hasRealData };
    } 
    
    if (activeRange === '30d') {
      const sortedDaily = [...dailyData]
        .sort((a, b) => {
          const dateA = new Date(a.year, a.month - 1, a.day);
          const dateB = new Date(b.year, b.month - 1, b.day);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(-30);

      const hasRealData = sortedDaily.length > 0;
      
      // Generate mock 30 days
      const mock30d = [];
      const baseDate = new Date(2026, 5, 9);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        const val = 1500000 + Math.sin(i * 0.4) * 800000 + (i % 3 === 0 ? 600000 : 0);
        mock30d.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          revenue: Math.round(val / 100000) * 100000
        });
      }
      
      const data = hasRealData ? sortedDaily : mock30d;
      return { data, hasRealData };
    }

    // Default: '12m'
    const sortedMonthly = [...monthlyData]
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
      .slice(-12);

    const hasRealData = sortedMonthly.length > 0;
    const mock12m = [
      { year: 2025, month: 7, revenue: 12000000 },
      { year: 2025, month: 8, revenue: 19000000 },
      { year: 2025, month: 9, revenue: 15000000 },
      { year: 2025, month: 10, revenue: 32000000 },
      { year: 2025, month: 11, revenue: 22000000 },
      { year: 2025, month: 12, revenue: 29000000 },
      { year: 2026, month: 1, revenue: 35000000 },
      { year: 2026, month: 2, revenue: 28000000 },
      { year: 2026, month: 3, revenue: 42000000 },
      { year: 2026, month: 4, revenue: 39000000 },
      { year: 2026, month: 5, revenue: 51000000 },
      { year: 2026, month: 6, revenue: 48000000 }
    ];
    
    const data = hasRealData ? sortedMonthly : mock12m;
    return { data, hasRealData };
  };

  const { data: chartData, hasRealData } = getChartConfig();

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
  const avgOrderValue = successCount > 0 ? Math.round(totalRevenue / successCount) : 0;

  // SVG Coordinates mapping
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 20;
  const chartWidth = svgWidth - 2 * paddingX;
  const chartHeight = svgHeight - 2 * paddingY;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * chartWidth;
    const y = (svgHeight - paddingY) - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z` 
    : '';

  // Tiny Sparkline generators for metrics cards
  const generateSparkline = (dataArr: number[]) => {
    const maxVal = Math.max(...dataArr, 1);
    const w = 100;
    const h = 30;
    const coords = dataArr.map((val, idx) => {
      const cx = (idx / (dataArr.length - 1)) * w;
      const cy = h - 2 - (val / maxVal) * (h - 6);
      return { cx, cy };
    });
    return coords.reduce((path, c, i) => {
      return i === 0 ? `M ${c.cx} ${c.cy}` : `${path} L ${c.cx} ${c.cy}`;
    }, '');
  };

  // Sparkline data mapping
  const revenueTrend = chartData.map(d => d.revenue);
  const usersTrend = [35, 42, 38, 59, 72, 85, 128];
  const conversionTrend = [88, 91, 89, 90, 92, 91, 92];

  // Mouse Move over main chart to track coordinates
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    
    // Scale clientX back to the 600px viewBox
    const viewBoxX = (clientX / rect.width) * svgWidth;

    // Find the closest point in chartData
    let closestIdx = 0;
    let minDistance = Infinity;
    
    points.forEach((p, idx) => {
      const distance = Math.abs(p.x - viewBoxX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    const target = points[closestIdx];
    setHoveredPoint({
      x: target.x,
      y: target.y,
      day: (target as any).day,
      month: target.month,
      year: target.year,
      revenue: target.revenue
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const stats = [
    { 
      label: 'Tổng Doanh Thu', 
      value: isLoading ? 'Đang tải...' : `${totalRevenue.toLocaleString('vi-VN')} đ`, 
      icon: <DollarSign className="text-indigo-600" size={16} />, 
      trend: '+18.4%', 
      isPositive: true,
      sparkline: generateSparkline(revenueTrend),
      sparkColor: 'stroke-indigo-600'
    },
    { 
      label: 'Tổng người dùng', 
      value: isLoadingUsers ? 'Đang tải...' : `${usersList.length} `, 
      icon: <Users className="text-emerald-600" size={16} />, 
      trend: '+12.3%', 
      isPositive: true,
      sparkline: generateSparkline(usersTrend),
      sparkColor: 'stroke-emerald-500'
    },
    { 
      label: 'Giá trị đơn TB (AOV)', 
      value: isLoading ? 'Đang tải...' : `${avgOrderValue.toLocaleString('vi-VN')} đ`, 
      icon: <Activity className="text-amber-600" size={16} />, 
      trend: '-2.1%', 
      isPositive: false,
      sparkline: generateSparkline(conversionTrend),
      sparkColor: 'stroke-amber-500'
    },
  ];

  // Search filter logic for user directory
  const filteredUsers = usersList.filter(u => 
    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 min-h-screen bg-[#fcfcfd] p-1.5 font-sans antialiased text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Báo cáo doanh thu</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Quản lý hiệu suất kinh doanh, giao dịch đăng ký gói dịch vụ hệ thống.</p>
        </div>

        {/* Date Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
          <button 
            onClick={() => setActiveRange('7d')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeRange === '7d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            7 ngày qua
          </button>
          <button 
            onClick={() => setActiveRange('30d')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeRange === '30d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            30 ngày qua
          </button>
          <button 
            onClick={() => setActiveRange('12m')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeRange === '12m' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            12 tháng qua
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/50 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <span className="p-2 bg-slate-50 rounded-xl border border-slate-100">{stat.icon}</span>
              </div>
              <p className="text-2xl font-black tracking-tight text-slate-900">{stat.value}</p>
            </div>
            
            <div className="flex justify-between items-end pt-5 mt-5 border-t border-slate-50">
              <span className={`text-xs font-extrabold flex items-center gap-1 ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </span>
              
              {/* Sparkline Graph */}
              <svg className="w-20 h-6 overflow-visible" viewBox="0 0 100 30">
                <path 
                  d={stat.sparkline} 
                  fill="none" 
                  className={stat.sparkColor} 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/30">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Biểu đồ doanh số</h2>
              <p className="text-xs font-medium text-slate-400">
                {activeRange === '12m' 
                  ? 'Doanh thu theo chu kỳ thanh toán thực tế hàng tháng.' 
                  : 'Doanh thu chi tiết theo ngày.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-wider text-indigo-600">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              {hasRealData ? 'Dữ liệu thực tế' : 'Dữ liệu demo'}
            </span>
          </div>

          {/* SVG Line Chart Container */}
          <div className="relative pt-4">
            <svg 
              ref={chartRef}
              className="w-full h-64 overflow-visible cursor-crosshair" 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 1, 2, 3].map((g) => {
                const y = paddingY + (g / 3) * chartHeight;
                return (
                  <line 
                    key={g} 
                    x1={paddingX} 
                    y1={y} 
                    x2={svgWidth - paddingX} 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Shaded Area under Curve */}
              {areaPath && (
                <path 
                  d={areaPath} 
                  fill="url(#chartGradient)" 
                />
              )}

              {/* Smooth trend Line */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#4F46E5" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Node Dots */}
              {points.map((p, idx) => (
                <circle 
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="white"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              ))}

              {/* Hover Indicator Elements */}
              {hoveredPoint && (
                <g>
                  {/* Vertical Track line */}
                  <line 
                    x1={hoveredPoint.x} 
                    y1={paddingY} 
                    x2={hoveredPoint.x} 
                    y2={svgHeight - paddingY} 
                    stroke="#4F46E5" 
                    strokeWidth="1.5" 
                    strokeDasharray="2 2"
                  />
                  {/* Outer Pulsing Glow */}
                  <circle 
                    cx={hoveredPoint.x} 
                    cy={hoveredPoint.y} 
                    r="8" 
                    fill="#4F46E5" 
                    fillOpacity="0.25"
                  />
                  {/* Inner Node Dot */}
                  <circle 
                    cx={hoveredPoint.x} 
                    cy={hoveredPoint.y} 
                    r="5" 
                    fill="#4F46E5" 
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* Interactive Tooltip Card */}
            {hoveredPoint && (
              <div 
                className="absolute bg-slate-900 text-white rounded-xl p-3 shadow-xl pointer-events-none z-20 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100 - 32}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {hoveredPoint.day 
                    ? `${hoveredPoint.day}/${hoveredPoint.month}/${hoveredPoint.year}` 
                    : `Tháng ${hoveredPoint.month}/${hoveredPoint.year}`}
                </p>
                <p className="text-xs font-black">
                  {hoveredPoint.revenue.toLocaleString('vi-VN')} đ
                </p>
              </div>
            )}
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between mt-5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider px-2">
            {chartData.map((d, i) => {
              const isDaily = 'day' in d;
              const shouldShow = 
                activeRange !== '30d' || 
                i === 0 || 
                i === Math.floor(chartData.length / 2) || 
                i === chartData.length - 1 || 
                i % 6 === 0;

              return (
                <span key={i} className={`flex-1 text-center truncate px-1 ${shouldShow ? 'opacity-100' : 'opacity-0'}`}>
                  {isDaily ? `${(d as any).day}/${d.month}` : `T${d.month}/${d.year.toString().slice(-2)}`}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Accounts Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Danh sách người dùng</h2>
            <p className="text-xs font-medium text-slate-400">Quản lý tài khoản hệ thống và thông tin gói dịch vụ tương ứng.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên hoặc email..." 
              className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
            />
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-xs font-bold text-slate-400">Đang tải danh sách người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-slate-400">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-8 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Gói dịch vụ</th>
                  <th className="px-6 py-4">Mã tài khoản (ID)</th>
                  <th className="px-6 py-4">Ngày hết hạn</th>
                  <th className="px-8 py-4 text-center">Trạng thái gói</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredUsers.map((userAccount) => {
                  const isPremium = userAccount.planName && userAccount.planName.toLowerCase() !== 'free';
                  const isExpired = userAccount.planStatus?.toLowerCase() === 'expired';
                  
                  return (
                    <tr key={userAccount.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-8 py-4.5">
                        <div className="font-extrabold text-slate-900">{userAccount.fullName || 'Chưa cập nhật'}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{userAccount.email}</div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-1.5">
                          {userAccount.roles?.includes('Admin') ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100/40">
                              <Shield size={10} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200/40">
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
                      <td className="px-8 py-4.5 text-center">
                        {isPremium ? (
                          isExpired ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Hết hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/50 animate-pulse">
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
        
        {/* Table Footer Actions */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Tổng số: {filteredUsers.length} tài khoản</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
