import React, { useState } from 'react';
import { 
  Target, Calendar, BarChart, Sparkles, RefreshCw, Save, 
  ListTree, PlusCircle, ChevronRight, Shield, Globe, 
  Info, Clock, Plus, Trash2, Layout
} from 'lucide-react';
import { Plan, CreatePlanDto, CreatePlanTaskDto, TaskPriority } from '../types/plan.types';
import { planService } from '../services/planService';
import { useNavigate } from 'react-router-dom';

interface LocalTask extends Omit<CreatePlanTaskDto, 'parentTaskId' | 'startDate' | 'dueDate'> {
  localId: string;
  parentLocalId: string | null;
  startDate: string;
  dueDate: string;
}

const Planning: React.FC = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>('ai');
  const [manualStep, setManualStep] = useState<1 | 2>(1);
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null);
  
  // AI Form States
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [detailLevel, setDetailLevel] = useState('medium');

  // Manual Form States (Step 1)
  const [planData, setPlanData] = useState<CreatePlanDto>({
    title: '',
    description: '',
    goal: '',
    templateId: null,
    frameworkId: null,
    categoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    isPublic: false,
    deadline: '',
  });

  // Task States (Step 2)
  const [localTasks, setLocalTasks] = useState<LocalTask[]>([]);

  const generateLocalId = () => Math.random().toString(36).substr(2, 9);

  const addLocalTask = (parentLocalId: string | null = null) => {
    const newTask: LocalTask = {
      localId: generateLocalId(),
      parentLocalId: parentLocalId,
      title: '',
      description: '',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      orderIndex: localTasks.length
    };
    setLocalTasks([...localTasks, newTask]);
  };

  const updateLocalTask = (localId: string, field: keyof LocalTask, value: any) => {
    setLocalTasks(localTasks.map(t => t.localId === localId ? { ...t, [field]: value } : t));
  };

  const removeLocalTask = (localId: string) => {
    setLocalTasks(localTasks.filter(t => t.localId !== localId && t.parentLocalId !== localId));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatToISO = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString();
    try {
      return new Date(dateStr).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const handleCreatePlanShell = async () => {
    if (!planData.title) {
      alert('Vui lòng nhập tên kế hoạch');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formattedPlan: CreatePlanDto = {
        ...planData,
        deadline: formatToISO(planData.deadline),
      };

      const planResponse = await planService.createManualPlan(formattedPlan);
      const rawPlan = (planResponse as any).data || planResponse;
      const plan = {
        ...rawPlan,
        id: rawPlan.id || rawPlan.Id
      };
      setCreatedPlan(plan);
      setManualStep(2);
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTasks = async () => {
    if (localTasks.length === 0) {
      alert('Hãy thêm ít nhất một nhiệm vụ');
      return;
    }

    if (!createdPlan?.id) return;

    setIsSubmitting(true);
    try {
      const planId = createdPlan.id;
      const rootTasks = localTasks.filter(t => t.parentLocalId === null);
      
      for (const root of rootTasks) {
        const formattedRoot: CreatePlanTaskDto = {
          title: root.title,
          description: root.description,
          priority: root.priority as TaskPriority,
          startDate: formatToISO(root.startDate),
          dueDate: formatToISO(root.dueDate),
          orderIndex: root.orderIndex,
          parentTaskId: null
        };
        
        const rootResponse = await planService.createPlanTask(planId, formattedRoot);
        const rawRoot = (rootResponse as any).data || rootResponse;
        const realRootId = rawRoot.id || rawRoot.Id;

        const children = localTasks.filter(t => t.parentLocalId === root.localId);
        for (const child of children) {
          const formattedChild: CreatePlanTaskDto = {
            title: child.title,
            description: child.description,
            priority: child.priority as TaskPriority,
            startDate: formatToISO(child.startDate),
            dueDate: formatToISO(child.dueDate),
            orderIndex: child.orderIndex,
            parentTaskId: realRootId
          };
          await planService.createPlanTask(planId, formattedChild);
        }
      }

      alert('Tất cả nhiệm vụ đã được lưu thành công!');
      navigate(`/plans/${planId}`);
    } catch (error: any) {
      alert('Lỗi khi lưu nhiệm vụ: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAiPlanner = () => (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 lg:p-12 space-y-8">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <Target size={18} className="text-primary" /> Mục tiêu của bạn
          </label>
          <textarea 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="VD: Tôi muốn học ReactJS từ cơ bản đến nâng cao trong vòng 2 tháng để có thể đi làm..."
            className="w-full h-40 p-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-gray-700 leading-relaxed resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Calendar size={18} className="text-primary" /> Thời hạn mong muốn
            </label>
            <input 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-border rounded-xl outline-none focus:border-primary transition-all text-gray-700"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <BarChart size={18} className="text-primary" /> Độ chi tiết
            </label>
            <select 
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-border rounded-xl outline-none focus:border-primary transition-all text-gray-700 appearance-none"
            >
              <option value="low">Cơ bản (Các mốc chính)</option>
              <option value="medium">Vừa phải (Nhiệm vụ hàng tuần)</option>
              <option value="high">Chi tiết (Nhiệm vụ hàng ngày)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button className="flex-grow bg-gradient-ai text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group">
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            Tạo kế hoạch thông minh
          </button>
          <button className="px-8 py-4 bg-white border border-border text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <Save size={20} />
            Lưu nháp
          </button>
        </div>
      </div>
    </div>
  );

  const renderManualStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 lg:p-10 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Layout size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Bước 1: Thông tin chung</h2>
            </div>
            <div className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giai đoạn khởi tạo</div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tên kế hoạch</label>
              <input 
                type="text"
                value={planData.title}
                onChange={(e) => setPlanData({...planData, title: e.target.value})}
                placeholder="VD: Lộ trình chinh phục IELTS 7.5..."
                className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mục tiêu cốt lõi</label>
                <textarea 
                  value={planData.goal}
                  onChange={(e) => setPlanData({...planData, goal: e.target.value})}
                  placeholder="Điều gì thúc đẩy bạn?"
                  className="w-full h-32 p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-gray-700 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả chi tiết</label>
                <textarea 
                  value={planData.description}
                  onChange={(e) => setPlanData({...planData, description: e.target.value})}
                  placeholder="Ghi chú thêm về bối cảnh hoặc tài liệu..."
                  className="w-full h-32 p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-gray-700 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hạn chót</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date"
                    value={planData.deadline}
                    onChange={(e) => setPlanData({...planData, deadline: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-primary/30 transition-all text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chế độ hiển thị</label>
                <div className="flex bg-gray-50 p-1 rounded-xl">
                  <button 
                    onClick={() => setPlanData({...planData, isPublic: false})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${!planData.isPublic ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                  >
                    <Shield size={16} /> Riêng tư
                  </button>
                  <button 
                    onClick={() => setPlanData({...planData, isPublic: true})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${planData.isPublic ? 'bg-white shadow-sm text-accent' : 'text-gray-400'}`}
                  >
                    <Globe size={16} /> Công khai
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Danh mục</label>
                <select 
                  value={planData.categoryId}
                  onChange={(e) => setPlanData({...planData, categoryId: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-primary/30 transition-all text-gray-700 appearance-none"
                >
                  <option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">Học tập & Phát triển</option>
                  <option value="8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d">Công việc</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <button 
          onClick={handleCreatePlanShell}
          disabled={isSubmitting}
          className={`w-full bg-gradient-ai text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70' : ''}`}
        >
          {isSubmitting ? <RefreshCw className="animate-spin" size={22} /> : <ChevronRight size={22} />}
          Tiếp tục thiết lập lộ trình
        </button>
      </div>
    </div>
  );

  const renderManualStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-primary text-lg">{createdPlan?.title}</h3>
          <p className="text-sm text-primary/60">Đã khởi tạo thành công. Bây giờ hãy thêm các nhiệm vụ chi tiết.</p>
        </div>
        <button 
          onClick={() => setManualStep(1)}
          className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          Sửa thông tin chung
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <ListTree className="text-primary" size={20} />
            <h3 className="font-bold text-gray-800">Thiết kế lộ trình</h3>
          </div>
          <button 
            onClick={() => addLocalTask(null)}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <PlusCircle size={18} /> Thêm bước chính
          </button>
        </div>

        <div className="space-y-6">
          {localTasks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Plus size={32} />
              </div>
              <p className="text-gray-400 font-medium">Lộ trình của bạn đang trống. Hãy thêm bước đầu tiên!</p>
            </div>
          )}

          {localTasks.map((task) => {
            const isSubtask = task.parentLocalId !== null;
            return (
              <div key={task.localId} className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative ${isSubtask ? 'ml-12 border-l-4 border-l-primary/20' : ''}`}>
                {!isSubtask && (
                  <div className={`w-1.5 absolute top-0 bottom-0 left-0 ${
                    task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}></div>
                )}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-grow space-y-3">
                      <div className="flex items-center gap-2">
                        {isSubtask && <ChevronRight size={14} className="text-primary/40" />}
                        <input 
                          type="text"
                          value={task.title}
                          onChange={(e) => updateLocalTask(task.localId, 'title', e.target.value)}
                          placeholder={isSubtask ? "Tên bước nhỏ..." : "Tên nhiệm vụ chính..."}
                          className={`w-full outline-none placeholder:text-gray-300 font-bold text-gray-800 ${isSubtask ? 'text-md' : 'text-lg'}`}
                        />
                      </div>
                      <textarea 
                        value={task.description}
                        onChange={(e) => updateLocalTask(task.localId, 'description', e.target.value)}
                        placeholder="Mô tả công việc cần làm..."
                        className="w-full text-sm text-gray-500 outline-none resize-none h-10 bg-transparent"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:border-l lg:pl-6 border-gray-100">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ưu tiên</label>
                        <div className="flex gap-1">
                          {['low', 'medium', 'high'].map((p) => (
                            <button
                              key={p}
                              onClick={() => updateLocalTask(task.localId, 'priority', p)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                                task.priority === p 
                                  ? p === 'high' ? 'bg-red-50 text-red-600' : p === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                  : 'text-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {p === 'low' ? 'Thấp' : p === 'medium' ? 'Vừa' : 'Cao'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Bắt đầu</label>
                        <input 
                          type="date"
                          value={task.startDate}
                          onChange={(e) => updateLocalTask(task.localId, 'startDate', e.target.value)}
                          className="block text-[11px] font-medium text-gray-600 outline-none bg-gray-50 p-1.5 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Kết thúc</label>
                        <input 
                          type="date"
                          value={task.dueDate}
                          onChange={(e) => updateLocalTask(task.localId, 'dueDate', e.target.value)}
                          className="block text-[11px] font-medium text-gray-600 outline-none bg-gray-50 p-1.5 rounded"
                        />
                      </div>

                      <button 
                        onClick={() => removeLocalTask(task.localId)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {!isSubtask && (
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                        Trạng thái: <span className="text-primary">Đang thiết lập</span>
                      </div>
                      <button 
                        onClick={() => addLocalTask(task.localId)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-primary/60 hover:text-primary transition-colors"
                      >
                        <Plus size={14} /> Thêm bước con
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleSaveTasks}
          disabled={isSubmitting}
          className={`flex-grow bg-gradient-ai text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70' : ''}`}
        >
          {isSubmitting ? <RefreshCw className="animate-spin" size={22} /> : <Save size={22} />}
          {isSubmitting ? 'Đang lưu lộ trình...' : 'Hoàn tất & Lưu lộ trình'}
        </button>
        <button className="px-10 py-5 bg-white border border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all">
          Lưu bản nháp
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Kiến Tạo Lộ Trình</h1>
          <p className="text-gray-500 font-medium">Lựa chọn phương thức tối ưu nhất để hiện thực hóa mục tiêu của bạn.</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-1">
            <button 
              onClick={() => setActiveMode('ai')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeMode === 'ai' 
                ? 'bg-gradient-ai text-white shadow-lg shadow-primary/25 scale-105' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={18} />
              Trí Tuệ Nhân Tạo
            </button>
            <button 
              onClick={() => {
                setActiveMode('manual');
                if (!createdPlan) setManualStep(1);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeMode === 'manual' 
                ? 'bg-gradient-ai text-white shadow-lg shadow-primary/25 scale-105' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListTree size={18} />
              Tự Lên Kế Hoạch
            </button>
          </div>
        </div>

        {activeMode === 'ai' ? renderAiPlanner() : (
          manualStep === 1 ? renderManualStep1() : renderManualStep2()
        )}

        {activeMode === 'ai' && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Cụ thể hóa', desc: 'Mô tả càng chi tiết, kế hoạch càng chính xác.', icon: <Info size={18} /> },
              { title: 'Thời gian thực', desc: 'AI sẽ tự động điều chỉnh nếu bạn lỡ deadline.', icon: <Clock size={18} /> },
              { title: 'Tích hợp', desc: 'Dễ dàng xuất sang Google Calendar hoặc Notion.', icon: <Layout size={18} /> }
            ].map((tip, idx) => (
              <div key={idx} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  {tip.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-3">{tip.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planning;
