import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, ListTree, Save, RefreshCw, 
  PlusCircle, ChevronRight, Sparkles, CheckCircle2,
  Clock, Target, AlertCircle, Trash2, Edit3, MessageSquare
} from 'lucide-react';
import { Plan, PlanTask, TaskStatus } from '../types/plan.types';
import { planService } from '../services/planService';
import AIChat from '../components/AIChat';

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const fetchPlanDetails = async () => {
    if (!id) return;
    try {
      const response = await planService.getPlanById(id);
      let planData: Plan | null = null;
      const rawData = (response as any).data || (response as any).Data || response;
      
      if (rawData && (rawData.id || rawData.Id)) {
        const mapTask = (t: any): PlanTask => ({
          ...t,
          id: t.id || t.Id,
          title: t.title || t.Title,
          description: t.description || t.Description,
          parentTaskId: t.parentTaskId || t.ParentTaskId,
          priority: (t.priority || t.Priority || 'medium').toLowerCase(),
          status: (t.status || t.Status || 'todo').toLowerCase(),
          progress: t.progress !== undefined ? t.progress : (t.Progress !== undefined ? t.Progress : 0),
          dueDate: t.dueDate || t.DueDate,
          subTasks: (t.subTasks || t.SubTasks || []).map(mapTask)
        });

        planData = {
          ...rawData,
          id: rawData.id || rawData.Id,
          title: rawData.title || rawData.Title,
          description: rawData.description || rawData.Description,
          goal: rawData.goal || rawData.Goal,
          progress: rawData.progress !== undefined ? rawData.progress : (rawData.Progress !== undefined ? rawData.Progress : 0),
          deadline: rawData.deadline || rawData.Deadline,
          isPublic: rawData.isPublic !== undefined ? rawData.isPublic : (rawData.IsPublic !== undefined ? rawData.IsPublic : false),
          tasks: (rawData.tasks || rawData.Tasks || []).map(mapTask)
        };
        if (planData.id) {
          localStorage.setItem('currentPlanId', planData.id);
        }
      }
      setPlan(planData);
    } catch (error: any) {
      console.error('Error fetching plan details:', error);
      if (!error.message.includes('405')) {
        localStorage.removeItem('currentPlanId');
        navigate('/my-plans');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const handleUpdateTaskStatus = async (taskId: string, targetStatus: string) => {
    if (!plan?.id) return;
    try {
      await planService.updateTaskStatus(plan.id, taskId, targetStatus);
      fetchPlanDetails();
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <RefreshCw className="animate-spin text-primary mb-4" size={32} />
      <p className="text-gray-500 font-medium">Đang tải kế hoạch...</p>
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <AlertCircle size={64} className="text-red-400 mb-4" />
      <h2 className="text-2xl font-black text-gray-900 mb-2">Không tìm thấy kế hoạch</h2>
      <Link to="/my-plans" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg mt-4">Quay lại danh sách</Link>
    </div>
  );

  const categories = plan.tasks?.filter(t => !t.parentTaskId).map(category => {
    const subTasks = category.subTasks && category.subTasks.length > 0 
      ? category.subTasks 
      : plan.tasks?.filter(t => t.parentTaskId === category.id) || [];
    return { ...category, subTasks };
  }) || [];

  const completedTasksCount = categories.reduce((acc, category) => {
    if (category.subTasks && category.subTasks.length > 0) {
      return acc + category.subTasks.filter(st => st.status === 'done').length;
    }
    return acc + (category.status === 'done' ? 1 : 0);
  }, 0);
  
  const totalTasksCount = categories.reduce((acc, category) => {
    return acc + (category.subTasks && category.subTasks.length > 0 ? category.subTasks.length : 1);
  }, 0);

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'done': case 'xong': return 'bg-[#D1FAE5] text-[#059669]';
      case 'in_progress': case 'đang': return 'bg-[#DBEAFE] text-[#2563EB]';
      default: return 'bg-[#F3F4F6] text-[#4B5563]';
    }
  };

  const getStatusText = (status: string) => {
    switch(status.toLowerCase()) {
      case 'done': case 'xong': return 'Xong';
      case 'in_progress': case 'đang': return 'Đang';
      default: return 'Chờ';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': case 'cao': return 'bg-[#FEE2E2] text-[#DC2626]';
      case 'medium': case 'tb': return 'bg-[#FEF3C7] text-[#D97706]';
      default: return 'bg-[#F3F4F6] text-[#6B7280]';
    }
  };

  const getPriorityText = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': case 'cao': return 'Cao';
      case 'medium': case 'tb': return 'TB';
      default: return 'Thấp';
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Main Header Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5"><Clock size={16} /> Deadline: 14 ngày</span>
              <span className="flex items-center gap-1.5"><ListTree size={16} /> Tổng task: {totalTasksCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              <Edit3 size={16} /> Chỉnh sửa
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
              <Trash2 size={16} /> Xóa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Progress Section */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">TIẾN ĐỘ</h2>
              <span className="text-2xl font-black text-[#4F46E5]">{plan.progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] transition-all duration-1000" 
                style={{ width: `${plan.progress}%` }}
              ></div>
            </div>
            <div className="flex gap-8 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[#10B981]"></div>
                <span className="text-gray-500">Hoàn thành:</span>
                <span className="text-gray-900">{completedTasksCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[#4F46E5]"></div>
                <span className="text-gray-500">Còn lại:</span>
                <span className="text-gray-900">{totalTasksCount - completedTasksCount}</span>
              </div>
            </div>
          </div>

          {/* AI Sidebar Section */}
          <div className="bg-white border-2 border-[#C7D2FE] rounded-2xl p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#4F46E5]">
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-primary/20">
                  <img src="/ai-bot.jpg" alt="AI Bot" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-gray-900">AI Trợ lý kế hoạch</h3>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Chat với AI để chỉnh sửa và tối ưu kế hoạch của bạn
              </p>
            </div>
            <button 
              onClick={() => setIsAiChatOpen(true)}
              className="w-full py-4 border-2 border-gray-900 rounded-xl font-black text-gray-900 text-sm hover:bg-gray-50 transition-all mt-6"
            >
              Bắt đầu hội thoại
            </button>
          </div>
        </div>

        {/* AI Chat Component */}
        <AIChat 
          isOpen={isAiChatOpen} 
          onClose={() => setIsAiChatOpen(false)} 
          initialMessage={`Chào bạn! Tôi thấy bạn đang thực hiện kế hoạch "${plan.title}". Tôi có thể giúp gì cho bạn để hoàn thành mục tiêu "${plan.goal}" không?`}
        />

        {/* Task List Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-10">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-6 border-b border-gray-100 text-xs font-black text-gray-900 uppercase tracking-widest">
            <div className="col-span-6">Công việc</div>
            <div className="col-span-2 text-center">Trạng thái</div>
            <div className="col-span-2 text-center">Ưu tiên</div>
            <div className="col-span-2 text-right">Ngày</div>
          </div>

          {/* Task Groups */}
          <div className="mt-8 space-y-12">
            {categories.map((category) => (
              <div key={category.id} className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                  <span className="text-xs font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                    {category.subTasks?.filter(st => st.status === 'done').length || 0}/{category.subTasks?.length || 0}
                  </span>
                </div>

                <div className="space-y-2">
                  {(category.subTasks && category.subTasks.length > 0 ? category.subTasks : [category]).map((task, idx) => (
                    <div 
                      key={task.id} 
                      className="grid grid-cols-12 gap-4 items-center py-4 group hover:bg-gray-50/50 rounded-xl transition-all"
                    >
                      <div className="col-span-6 flex items-center gap-4">
                        <button 
                          onClick={() => handleUpdateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            task.status === 'done' ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-white border-[#4F46E5] text-transparent hover:border-[#10B981]'
                          }`}
                        >
                          {task.status === 'done' && <CheckCircle2 size={12} />}
                        </button>
                        <span className={`text-sm font-bold tracking-tight ${task.status === 'done' ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-center relative">
                        <div className="relative group/status">
                          <button 
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest min-w-[70px] text-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${getStatusStyle(task.status)}`}
                          >
                            {getStatusText(task.status)}
                          </button>
                          
                          {/* Modern Status Selector Dropdown */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-20 overflow-hidden">
                            {[
                              { id: 'todo', label: 'Chờ', style: 'hover:bg-gray-50 text-gray-600' },
                              { id: 'in_progress', label: 'Đang', style: 'hover:bg-blue-50 text-[#2563EB]' },
                              { id: 'done', label: 'Xong', style: 'hover:bg-emerald-50 text-[#059669]' }
                            ].map((s) => (
                              <button
                                key={s.id}
                                onClick={() => handleUpdateTaskStatus(task.id, s.id)}
                                className={`w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-left transition-colors ${s.style}`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest min-w-[70px] text-center ${getPriorityStyle(task.priority)}`}>
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right text-xs font-bold text-gray-400">
                        Ngày {idx + 1 + (categories.indexOf(category) * 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-12">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">TIMELINE</h2>
          <div className="space-y-6">
            {categories.map((category, idx) => {
              const progress = category.subTasks?.length 
                ? Math.round((category.subTasks.filter(st => st.status === 'done').length / category.subTasks.length) * 100) 
                : (category.status === 'done' ? 100 : 0);
              
              return (
                <div key={category.id} className="grid grid-cols-12 items-center gap-6">
                  <div className="col-span-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    Day {idx * 2 + 1}-{idx * 2 + 2}
                  </div>
                  <div className="col-span-2 text-xs font-bold text-gray-600">
                    {category.title}
                  </div>
                  <div className="col-span-7 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4F46E5] transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="col-span-1 text-right text-[10px] font-black text-gray-300">
                    {progress}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all">
            <PlusCircle size={16} /> Thêm task mới
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all">
            <RefreshCw size={16} /> Tạo lại bằng AI
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-[#4F46E5] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-[#4338CA] transition-all ml-auto">
            <Save size={16} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
