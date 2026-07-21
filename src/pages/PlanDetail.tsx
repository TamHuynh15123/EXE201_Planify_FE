import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
  ListTree, RefreshCw, Clock, AlertCircle, 
  Trash2, Send, User, Calendar, BookOpen, 
  ChevronRight, ChevronDown, CheckCircle, 
  Sparkles, Layers, X, History, Search, Plus, Globe
} from 'lucide-react';
import { Plan, PlanTask, TaskStatus, TaskPriority } from '../types/plan.types';
import { planService } from '../services/planService';
import { aiService } from '../services/aiService';
import { communityService } from '../services/communityService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { PlanCompletionFeedbackModal } from '../components/PlanCompletionFeedbackModal';

// Helper component to render AI messages with simple custom formatting for readability
const FormattedMessage: React.FC<{ content: string; onApplyAction?: () => void; onRejectAction?: () => void }> = ({ content, onApplyAction, onRejectAction }) => {
  if (!content) return null;

  // Split by newline to process line by line
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  let currentListType: 'bullet' | 'ordered' | null = null;

  const flushList = (key: string | number) => {
    if (currentList.length === 0) return;
    if (currentListType === 'bullet') {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-4 my-1.5 space-y-1 text-gray-700">
          {currentList}
        </ul>
      );
    } else if (currentListType === 'ordered') {
      renderedElements.push(
        <ol key={`list-${key}`} className="list-decimal pl-4 my-1.5 space-y-1 text-gray-700">
          {currentList}
        </ol>
      );
    }
    currentList = [];
    currentListType = null;
  };

  // Helper to parse bold text
  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Render action buttons placeholder [APPLY_DELAY_FIX]
    if (trimmedLine === '[APPLY_DELAY_FIX]') {
      renderedElements.push(
        <div key={`action-${index}`} className="mt-3 flex gap-2">
          {onApplyAction && (
            <button
              onClick={onApplyAction}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
            >
              ✅ Đồng ý áp dụng
            </button>
          )}
          {onRejectAction && (
            <button
              onClick={onRejectAction}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all border border-gray-200"
            >
              ❌ Không đồng ý
            </button>
          )}
        </div>
      );
      return;
    }
    
    // Check if line is a bullet point
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ')) {
      if (currentListType !== 'bullet') {
        flushList(index);
        currentListType = 'bullet';
      }
      const itemContent = trimmedLine.replace(/^[-*•]\s+/, '');
      currentList.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {parseInlineStyles(itemContent)}
        </li>
      );
    }
    // Check if line is a numbered list
    else if (/^\d+\.\s+/.test(trimmedLine)) {
      if (currentListType !== 'ordered') {
        flushList(index);
        currentListType = 'ordered';
      }
      const itemContent = trimmedLine.replace(/^\d+\.\s+/, '');
      currentList.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {parseInlineStyles(itemContent)}
        </li>
      );
    }
    // Check if line is a heading
    else if (trimmedLine.startsWith('### ')) {
      flushList(index);
      renderedElements.push(
        <h4 key={`h3-${index}`} className="text-xs font-black text-gray-900 mt-3 mb-1.5">
          {parseInlineStyles(trimmedLine.slice(4))}
        </h4>
      );
    }
    else if (trimmedLine.startsWith('## ')) {
      flushList(index);
      renderedElements.push(
        <h3 key={`h2-${index}`} className="text-sm font-black text-gray-900 mt-3 mb-1.5">
          {parseInlineStyles(trimmedLine.slice(3))}
        </h3>
      );
    }
    else if (trimmedLine.startsWith('# ')) {
      flushList(index);
      renderedElements.push(
        <h2 key={`h1-${index}`} className="text-base font-black text-gray-900 mt-3 mb-1.5">
          {parseInlineStyles(trimmedLine.slice(2))}
        </h2>
      );
    }
    // Empty line
    else if (trimmedLine === '') {
      flushList(index);
      renderedElements.push(<div key={`space-${index}`} className="h-1.5" />);
    }
    // Normal paragraph line
    else {
      flushList(index);
      renderedElements.push(
        <p key={`p-${index}`} className="mb-1 leading-relaxed text-gray-700">
          {parseInlineStyles(line)}
        </p>
      );
    }
  });

  // Flush any remaining lists
  flushList('final');

  return <div className="space-y-0.5">{renderedElements}</div>;
};

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  // States
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'kanban' | 'timeline'>('roadmap');
  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit task states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Create task states
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskParentId, setCreateTaskParentId] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPriority, setCreatePriority] = useState<TaskPriority>('medium');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createDueDate, setCreateDueDate] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Delete task confirmation states
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<PlanTask | null>(null);
  
  // Publish Community states
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDescription, setPublishDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleOpenPublishModal = () => {
    if (!plan) return;

    // Yêu cầu hoàn thành 100% tiến độ mới được publish
    if (plan.progress < 100 && plan.status !== 'completed') {
      showToast('Kế hoạch phải đạt 100% tiến độ mới có thể chia sẻ lên thư viện cộng đồng!', 'warning');
      return;
    }

    setPublishTitle(plan.title);
    setPublishDescription(plan.description || '');
    setIsPublishModalOpen(true);
  };

  const handlePublishPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    if (!publishTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề chia sẻ', 'warning');
      return;
    }

    setIsPublishing(true);
    try {
      await communityService.publishPlan({
        planId: plan.id,
        title: publishTitle.trim(),
        description: publishDescription.trim() || undefined,
        categoryId: plan.categoryId || '3fa85f64-5717-4562-b3fc-2c963f66afa6'
      });
      showToast('Gửi phê duyệt chia sẻ thành công!', 'success');
      setIsPublishModalOpen(false);
    } catch (error: any) {
      showToast('Lỗi khi gửi phê duyệt: ' + error.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };
  
  // Plans List States (for Sidebar History)
  const [plansList, setPlansList] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');

  // Workspace AI Chat States
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Delay Alert States
  const [searchParams] = useSearchParams();
  const [pendingDelayPlanData, setPendingDelayPlanData] = useState<any>(null);
  // Strategy AI đã chọn — dùng để biết strategy ngược khi user bấm "Không đồng ý"
  const [pendingDelayStrategy, setPendingDelayStrategy] = useState<'reschedule' | 'extend_deadline' | null>(null);

  // Plan Completion Feedback
  const [showCompletionFeedback, setShowCompletionFeedback] = useState(false);

  // Fetch all plans list
  const fetchAllPlans = useCallback(async () => {
    try {
      const response = await planService.getAllPlans();
      const rawPlans = (response as any).data || (response as any).Data || response;
      if (Array.isArray(rawPlans)) {
        setPlansList(rawPlans);
      }
    } catch (error) {
      console.error('Error fetching all plans list:', error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Fetch plan details
  const fetchPlanDetails = useCallback(async () => {
    if (!id) return;
    try {
      // Load the plans list at the same time to ensure it is in sync
      fetchAllPlans();

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
          priority: (t.priority || t.Priority || 'medium').toLowerCase() as TaskPriority,
          status: (t.status || t.Status || 'todo').toLowerCase() as TaskStatus,
          progress: t.progress !== undefined ? t.progress : (t.Progress !== undefined ? t.Progress : 0),
          dueDate: t.dueDate || t.DueDate,
          startDate: t.startDate || t.StartDate,
          subTasks: (t.subTasks || t.SubTasks || []).map(mapTask)
        });

        const parsedPlan: Plan = {
          ...rawData,
          id: rawData.id || rawData.Id,
          title: rawData.title || rawData.Title,
          description: rawData.description || rawData.Description,
          goal: rawData.goal || rawData.Goal,
          progress: rawData.progress !== undefined ? rawData.progress : (rawData.Progress !== undefined ? rawData.Progress : 0),
          deadline: rawData.deadline || rawData.Deadline,
          isPublic: rawData.isPublic !== undefined ? rawData.isPublic : (rawData.IsPublic !== undefined ? rawData.IsPublic : false),
          categoryId: rawData.categoryId || rawData.CategoryId || null,
          tasks: (rawData.tasks || rawData.Tasks || []).map(mapTask)
        };
        planData = parsedPlan;
        
        if (parsedPlan.id) {
          localStorage.setItem('currentPlanId', parsedPlan.id);
        }

        // Initialize expanded state for categories if not set
        setExpandedCategories(prev => {
          const updated = { ...prev };
          parsedPlan.tasks.forEach(t => {
            if (!t.parentTaskId && updated[t.id] === undefined) {
              updated[t.id] = true;
            }
          });
          return updated;
        });
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
  }, [id, navigate, fetchAllPlans]);

  useEffect(() => {
    fetchPlanDetails();
  }, [fetchPlanDetails]);

  // ── Plan Completion Feedback: hiện popup khi plan đạt 100% ──────────────────────
  useEffect(() => {
    if (!plan?.id || !plan.isAIGenerated) return;
    if (plan.progress < 100 && plan.status !== 'completed' && plan.status !== 'done') return;

    const key = `plan_feedback_done_${plan.id}`;
    if (localStorage.getItem(key)) return; // đã gửi hoặc đã skip

    // Delay nhỏ để user thấy trang đã load xong
    const timer = setTimeout(() => setShowCompletionFeedback(true), 800);
    return () => clearTimeout(timer);
  }, [plan?.id, plan?.progress, plan?.status, plan?.isAIGenerated]);

  // ── Delay Alert: tự động phân tích khi navigate từ thông báo ────────────────
  useEffect(() => {
    const action = searchParams.get('action');
    if (action !== 'analyze-delay' || !plan?.id) return;

    // Xóa query param khỏi URL (không reload)
    window.history.replaceState({}, '', window.location.pathname);

    const runAnalysis = async () => {
      setIsChatLoading(true);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: '🔍 Đang phân tích tình trạng trễ tiến độ của kế hoạch...' }
      ]);
      try {
        const res = await aiService.analyzeDelay(plan.id);
        const strategyLabel = res.strategy === 'reschedule'
          ? '📅 **Dồn lại lịch:** Sắp xếp các task trễ sang những ngày còn trống, giữ nguyên deadline chung.'
          : '📆 **Mở rộng deadline:** Thời gian còn lại quá ít, AI đề xuất điều chỉnh deadline tổng thể và sắp xếp lại các subtask trễ.';

        const summaryMsg = `**📊 Phân tích trễ tiến độ:**
- 🔴 Số task quá hạn: **${res.overdueCount} task**
- ⏰ Thời gian đến deadline: **${res.daysToDeadline} ngày**
- Chiến lược được chọn: ${strategyLabel}

${res.message}

Bạn có muốn áp dụng đề xuất này không?
[APPLY_DELAY_FIX]`;

        setPendingDelayPlanData(res.proposedPlanData);
        setPendingDelayStrategy(res.strategy as 'reschedule' | 'extend_deadline');
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: summaryMsg };
          return updated;
        });
      } catch (err: any) {
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: `❌ Không thể phân tích: ${err.message}` };
          return updated;
        });
      } finally {
        setIsChatLoading(false);
      }
    };

    runAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, plan?.id]);

  // ── Apply delay fix khi user bấm đồng ý ────────────────────────────────────
  const handleApplyDelayFix = async () => {
    if (!plan?.id || !pendingDelayPlanData) return;
    setIsChatLoading(true);
    setChatMessages(prev => [...prev, { role: 'user', content: '✅ Tôi đồng ý áp dụng đề xuất này.' }]);
    try {
      await aiService.applyDelayFix(plan.id, pendingDelayPlanData);
      setPendingDelayPlanData(null);
      setPendingDelayStrategy(null);
      showToast('Đã áp dụng đề xuất AI thành công!', 'success');
      await fetchPlanDetails();
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: '🎉 Kế hoạch đã được tối ưu lại! Các task trễ đã được sắp xếp hợp lý hơn.' }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ Áp dụng thất bại: ${err.message}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Reject delay fix: gọi lại AI với strategy ngược lại ─────────────────────
  const handleRejectDelayFix = async () => {
    if (!plan?.id || !pendingDelayStrategy) return;

    // Flip sang strategy ngược lại
    const oppositeStrategy = pendingDelayStrategy === 'reschedule' ? 'extend_deadline' : 'reschedule';
    const oppositeLabel = oppositeStrategy === 'reschedule'
      ? '📅 Dồn lại lịch (giữ nguyên deadline chung)'
      : '📆 Mở rộng deadline tổng thể';

    setIsChatLoading(true);
    setPendingDelayPlanData(null);
    setPendingDelayStrategy(null);
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: '❌ Tôi không đồng ý. Hãy thử phương án khác.' },
      { role: 'assistant', content: `🔄 Được, tôi sẽ áp dụng phương án **${oppositeLabel}**. Đang phân tích lại...` }
    ]);

    try {
      const res = await aiService.analyzeDelay(plan.id, oppositeStrategy);
      const strategyLabel = res.strategy === 'reschedule'
        ? '📅 **Dồn lại lịch:** Sắp xếp các task trễ sang những ngày còn trống, giữ nguyên deadline chung.'
        : '📆 **Mở rộng deadline:** AI đề xuất điều chỉnh deadline tổng thể và sắp xếp lại các subtask trễ.';

      const summaryMsg = `**📊 Phương án thay thế:**
- 🔴 Số task quá hạn: **${res.overdueCount} task**
- ⏰ Thời gian đến deadline: **${res.daysToDeadline} ngày**
- Chiến lược mới: ${strategyLabel}

${res.message}

Bạn có muốn áp dụng phương án này không?
[APPLY_DELAY_FIX]`;

      setPendingDelayPlanData(res.proposedPlanData);
      setPendingDelayStrategy(res.strategy as 'reschedule' | 'extend_deadline');
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: summaryMsg };
        return updated;
      });
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ Không thể phân tích phương án thay thế: ${err.message}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Sync scroll for workspace AI chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle plan transition state (e.g. from state passed in router or switch plan reset)
  useEffect(() => {
    if (id) {
      const stateHistory = location.state?.chatMessages;
      if (stateHistory && stateHistory.length > 0) {
        setChatMessages(stateHistory);
        // Clear location state after reading to prevent repeating on refresh
        window.history.replaceState({}, document.title);
      } else {
        // Switching to a new plan manually should reset message history
        setChatMessages([]);
      }
    }
  }, [id, location.state]);

  // Initial welcome message from AI based on Plan when empty
  useEffect(() => {
    if (plan && plan.id === id && chatMessages.length === 0) {
      setChatMessages([
        {
          role: 'assistant',
          content: `Chào bạn! Tôi là Planify AI. Tôi đang hỗ trợ bạn thực hiện lộ trình "${plan.title}". Bạn cần tôi tối ưu hóa hay gợi ý thêm tài liệu học tập gì không?`
        }
      ]);
    }
  }, [plan, id, chatMessages.length]);

  const toInputDateFormat = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title || '');
      setEditDescription(selectedTask.description || '');
      setEditPriority(selectedTask.priority || 'medium');
      setEditStartDate(toInputDateFormat(selectedTask.startDate));
      setEditDueDate(toInputDateFormat(selectedTask.dueDate));
    }
  }, [selectedTask]);

  const handleOpenCreateTaskModal = (parentId: string | null) => {
    setCreateTaskParentId(parentId);
    setCreateTitle('');
    setCreateDescription('');
    setCreatePriority('medium');
    setCreateStartDate('');
    setCreateDueDate('');
    setIsCreateTaskModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan?.id) return;
    if (!createTitle.trim()) {
      showToast('Tiêu đề nhiệm vụ không được để trống.', 'warning');
      return;
    }
    if (createStartDate && createDueDate && new Date(createStartDate) > new Date(createDueDate)) {
      showToast('Ngày bắt đầu không thể sau ngày hạn chót.', 'warning');
      return;
    }

    setIsCreatingTask(true);
    try {
      const data = {
        title: createTitle.trim(),
        parentTaskId: createTaskParentId,
        description: createDescription.trim(),
        priority: createPriority,
        startDate: createStartDate ? new Date(createStartDate).toISOString() : undefined,
        dueDate: createDueDate ? new Date(createDueDate).toISOString() : undefined,
        orderIndex: 0
      };
      
      await planService.createPlanTask(plan.id, data);
      showToast('Thêm nhiệm vụ thành công!', 'success');
      setIsCreateTaskModalOpen(false);
      await fetchPlanDetails();
    } catch (error: any) {
      showToast('Thêm nhiệm vụ thất bại: ' + error.message, 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleSaveTaskEdit = async () => {
    if (!plan?.id || !selectedTask) return;
    if (!editTitle.trim()) {
      showToast('Tiêu đề nhiệm vụ không được để trống.', 'warning');
      return;
    }
    if (editStartDate && editDueDate && new Date(editStartDate) > new Date(editDueDate)) {
      showToast('Ngày bắt đầu không thể sau ngày hạn chót.', 'warning');
      return;
    }

    setIsSavingTask(true);
    try {
      const data = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        startDate: editStartDate ? new Date(editStartDate).toISOString() : null,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null
      };

      await planService.updatePlanTask(plan.id, selectedTask.id, data);
      showToast('Cập nhật nhiệm vụ thành công!', 'success');
      setIsDrawerOpen(false);
      await fetchPlanDetails();
    } catch (error: any) {
      showToast('Cập nhật nhiệm vụ thất bại: ' + error.message, 'error');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    setTaskToDelete(selectedTask);
    setIsDeleteTaskModalOpen(true);
  };

  const handleDeleteTaskConfirm = async () => {
    if (!plan?.id || !taskToDelete) return;
    
    setIsDeletingTask(true);
    try {
      await planService.deletePlanTask(plan.id, taskToDelete.id);
      showToast('Xóa nhiệm vụ thành công!', 'success');
      setIsDeleteTaskModalOpen(false);
      setIsDrawerOpen(false);
      setTaskToDelete(null);
      await fetchPlanDetails();
    } catch (error: any) {
      showToast('Xóa nhiệm vụ thất bại: ' + error.message, 'error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, targetStatus: string) => {
    if (!plan?.id) return;
    try {
      await planService.updateTaskStatus(plan.id, taskId, targetStatus);
      showToast('Cập nhật trạng thái thành công!', 'success');
      
      // Refresh details
      await fetchPlanDetails();
      
      // Update selected task in drawer if open
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: targetStatus as TaskStatus } : null);
      }
    } catch (error: any) {
      showToast('Cập nhật trạng thái thất bại: ' + error.message, 'error');
    }
  };

  // HTML5 Drag and Drop Handlers for Kanban Board
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Find the task and check if status is already correct
    const allTasks = flatTasks();
    const task = allTasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      await handleUpdateTaskStatus(taskId, targetStatus);
    }
  };

  const handleSendWorkspaceMessage = async () => {
    if (!chatInput.trim() || isChatLoading || !plan) return;

    const userMsg = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    
    const originalInput = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Gọi API refinePlan để chỉnh sửa trực tiếp kế hoạch hiện tại
      const response = await aiService.refinePlan(plan.id, originalInput);
      
      // Map data tương tự như fetchPlanDetails để đồng bộ kiểu dữ liệu
      const rawData = response.plan as any;
      const mapTask = (t: any): PlanTask => ({
        ...t,
        id: t.id || t.Id,
        title: t.title || t.Title,
        description: t.description || t.Description,
        parentTaskId: t.parentTaskId || t.ParentTaskId,
        priority: (t.priority || t.Priority || 'medium').toLowerCase() as TaskPriority,
        status: (t.status || t.Status || 'todo').toLowerCase() as TaskStatus,
        progress: t.progress !== undefined ? t.progress : (t.Progress !== undefined ? t.Progress : 0),
        dueDate: t.dueDate || t.DueDate,
        startDate: t.startDate || t.StartDate,
        subTasks: (t.subTasks || t.SubTasks || []).map(mapTask)
      });

      const parsedPlan: Plan = {
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

      // Cập nhật kế hoạch trực tiếp trên giao diện
      setPlan(parsedPlan);

      // Cập nhật danh sách lịch sử ở cột trái
      fetchAllPlans();

      const aiReply = response.message || 'Tôi đã tinh chỉnh lộ trình thành công theo yêu cầu của bạn!';
      setChatMessages(prev => [...prev, { 
        role: 'assistant' as const, 
        content: aiReply 
      }]);
      
      showToast('Đã tinh chỉnh lộ trình trực tiếp!', 'success');
      setIsChatLoading(false);

    } catch (error: any) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Không thể xử lý yêu cầu chỉnh sửa kế hoạch. Vui lòng thử lại.' 
      }]);
      showToast('Lỗi khi tinh chỉnh lộ trình: ' + error.message, 'error');
      setIsChatLoading(false);
    }
  };

  const handleConfirmDraftPlan = async () => {
    if (!plan?.id) return;
    try {
      await planService.confirmPlan(plan.id);
      showToast('Kế hoạch đã được lưu thành công!', 'success');
      await fetchPlanDetails();
    } catch (error: any) {
      showToast('Lỗi khi xác nhận kế hoạch: ' + error.message, 'error');
    }
  };

  const handleDiscardDraftPlan = async () => {
    if (!plan?.id) return;
    try {
      await planService.deleteDraftPlan(plan.id);
      showToast('Đã hủy bản nháp kế hoạch.', 'info');
      localStorage.removeItem('currentPlanId');
      navigate('/my-plans');
    } catch (error: any) {
      showToast('Lỗi khi hủy bản nháp: ' + error.message, 'error');
    }
  };

  const handleDeleteActivePlan = async () => {
    if (!plan?.id) return;
    try {
      await planService.deletePlan(plan.id);
      showToast('Đã xóa kế hoạch thành công.', 'success');
      localStorage.removeItem('currentPlanId');
      navigate('/my-plans');
    } catch (error: any) {
      showToast('Lỗi khi xóa kế hoạch: ' + error.message, 'error');
    }
  };

  // Flatten tasks to display in Kanban/Timeline easily
  const flatTasks = (): PlanTask[] => {
    if (!plan) return [];
    const list: PlanTask[] = [];
    plan.tasks.forEach(parent => {
      // Add parent
      list.push(parent);
      // Add children
      if (parent.subTasks && parent.subTasks.length > 0) {
        list.push(...parent.subTasks);
      }
    });
    return list;
  };

  // Formatting date strings helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const getStatusColorClass = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'Đã xong';
      case 'in_progress': return 'Đang làm';
      default: return 'Cần làm';
    }
  };

  const getPriorityColorClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600';
      case 'medium': return 'bg-amber-50 text-amber-600';
      default: return 'bg-emerald-50 text-emerald-600';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Vừa';
      default: return 'Thấp';
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Render Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <RefreshCw className="animate-spin text-primary mb-4" size={36} />
        <p className="text-gray-500 font-bold tracking-wide animate-pulse">ĐANG TẢI LỘ TRÌNH CHI TIẾT...</p>
      </div>
    );
  }

  // Render Not Found
  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle size={64} className="text-red-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Không tìm thấy lộ trình</h2>
        <p className="text-gray-500 mb-6">Có thể lộ trình đã bị xóa hoặc bạn không có quyền truy cập.</p>
        <Link to="/my-plans" className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Quay lại danh sách</Link>
      </div>
    );
  }

  // Calculate statistics
  const doneTasks = flatTasks().filter(t => t.status === 'done').length;
  const inProgressTasks = flatTasks().filter(t => t.status === 'in_progress').length;
  const todoTasks = flatTasks().filter(t => t.status === 'todo').length;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-surface font-sans flex flex-col">
      {/* Main Workspace 3-Column Grid */}
      <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-6 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
        
        {/* COLUMN 1: PLAN HISTORY (Left Sidebar - 2 Columns) */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-800">
              <History size={16} className="text-primary" />
              <h3 className="font-black text-sm">Lịch sử kế hoạch</h3>
            </div>
            
            <Link 
              to="/planning" 
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black transition-all"
            >
              <Plus size={14} /> Tạo lộ trình mới
            </Link>

            {/* Search Input */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Tìm kiếm kế hoạch..."
                value={searchHistoryQuery}
                onChange={(e) => setSearchHistoryQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-200 transition-all text-[11px] font-medium"
              />
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchHistoryQuery && (
                <button 
                  onClick={() => setSearchHistoryQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* List of plans */}
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {plansLoading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <RefreshCw className="animate-spin text-gray-300" size={20} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đang tải lịch sử...</span>
              </div>
            ) : (
              (() => {
                const filteredPlans = plansList.filter(p => 
                  p.title.toLowerCase().includes(searchHistoryQuery.toLowerCase()) ||
                  (p.description || p.goal || '').toLowerCase().includes(searchHistoryQuery.toLowerCase())
                );

                if (filteredPlans.length === 0) {
                  return (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      {searchHistoryQuery ? 'Không tìm thấy kế hoạch phù hợp' : 'Chưa có kế hoạch nào được tạo'}
                    </div>
                  );
                }

                return filteredPlans.map((item) => {
                  const isActive = item.id === plan.id;
                  return (
                    <Link
                      key={item.id}
                      to={`/plans/${item.id}`}
                      className={`block p-3 rounded-2xl border transition-all text-left ${
                        isActive 
                          ? 'bg-primary/5 border-primary/20 shadow-xs' 
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                          isActive ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {item.isAIGenerated ? <Sparkles size={12} /> : <BookOpen size={12} />}
                        </div>
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className={`text-xs font-black truncate ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                              {item.title}
                            </h4>
                            {item.status === 'draft' && (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md flex-shrink-0 animate-pulse">
                                Nháp
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold truncate">
                            {item.description || item.goal}
                          </p>
                          
                          {/* Mini Progress */}
                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex-grow bg-gray-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] font-black text-gray-500">{item.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                });
              })()
            )}
          </div>
        </div>

        {/* COLUMN 2: ACTIVE PLAN DETAILS (Middle Canvas - 7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl shadow-sm p-6 flex flex-col gap-6">
          {/* Active Plan Header */}
          <div className="space-y-4 pb-6 border-b border-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {plan.status === 'draft' ? (
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse">
                    Bản nháp AI (Chưa lưu)
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Đang hoạt động
                  </span>
                )}
                {plan.isAIGenerated && (
                  <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> Planify AI
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {plan.status === 'draft' ? (
                  <>
                    <button 
                      onClick={handleDiscardDraftPlan}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <X size={12} /> Hủy bỏ
                    </button>
                    <button 
                      onClick={handleConfirmDraftPlan}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 shadow-md shadow-primary/20 transition-all"
                    >
                      <CheckCircle size={12} /> Xác nhận & Lưu
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleOpenPublishModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/20 bg-primary/5 rounded-xl text-[10px] font-bold text-primary hover:bg-primary/10 active:scale-95 transition-all"
                    >
                      <Globe size={12} /> Chia sẻ
                    </button>
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight leading-tight">{plan.title}</h1>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{plan.description || plan.goal}</p>
            </div>

            {/* Progress Segment */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold">Tiến độ tổng thể</span>
                <span className="font-black text-primary">{plan.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" 
                  style={{ width: `${plan.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tab Selector & Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-50">
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setActiveTab('roadmap')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'roadmap' ? 'bg-white text-primary shadow-xs' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ListTree size={12} /> Sơ đồ
              </button>
              <button 
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'kanban' ? 'bg-white text-primary shadow-xs' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Layers size={12} /> Kanban
              </button>
              <button 
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'timeline' ? 'bg-white text-primary shadow-xs' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Calendar size={12} /> Dòng thời gian
              </button>
            </div>

            <div className="flex gap-3 text-[9px] font-black text-gray-400 uppercase tracking-wider">
              <div>Cần làm: <span className="text-gray-700">{todoTasks}</span></div>
              <div className="w-px h-3 bg-gray-200"></div>
              <div>Đang làm: <span className="text-blue-500">{inProgressTasks}</span></div>
              <div className="w-px h-3 bg-gray-200"></div>
              <div>Đã xong: <span className="text-emerald-500">{doneTasks}</span></div>
            </div>
          </div>

          {/* TAB 1: ROADMAP TREE VIEW */}
          {activeTab === 'roadmap' && (
            <div className="flex-grow space-y-4 max-h-[600px] overflow-y-auto pr-1">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Lộ trình các chặng</h3>
                <button
                  onClick={() => handleOpenCreateTaskModal(null)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black rounded-xl transition-all hover:scale-105"
                >
                  <Plus size={12} /> Thêm nhiệm vụ chính
                </button>
              </div>

              {plan.tasks.filter(t => !t.parentTaskId).map((category, idx) => {
                const subtasks = category.subTasks && category.subTasks.length > 0 
                  ? category.subTasks 
                  : plan.tasks.filter(t => t.parentTaskId === category.id);
                const isExpanded = expandedCategories[category.id] !== false;
                const completedSub = subtasks.filter(s => s.status === 'done').length;

                return (
                  <div key={category.id} className="border border-gray-100 rounded-3xl p-4 hover:border-gray-200 transition-all bg-white shadow-xs">
                    {/* Category Header Card */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 flex-grow min-w-0">
                        <button 
                          onClick={() => toggleCategory(category.id)}
                          className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors flex-shrink-0"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <div className="w-5.5 h-5.5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary flex-shrink-0">
                          {idx + 1}
                        </div>
                        <h3 
                          className="font-black text-gray-800 text-xs hover:text-primary cursor-pointer transition-colors truncate max-w-[200px]"
                          onClick={() => {
                            setSelectedTask(category);
                            setIsDrawerOpen(true);
                          }}
                        >
                          {category.title}
                        </h3>
                        {subtasks.length > 0 && (
                          <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0">
                            {completedSub}/{subtasks.length} Hoàn thành
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${getPriorityColorClass(category.priority)}`}>
                          {getPriorityLabel(category.priority)}
                        </span>
                        {subtasks.length === 0 && (
                          <button 
                            onClick={() => handleUpdateTaskStatus(category.id, category.status === 'done' ? 'todo' : 'done')}
                            className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                              category.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 hover:border-primary'
                            }`}
                          >
                            {category.status === 'done' && <CheckCircle size={10} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subtasks List */}
                    {isExpanded && (
                      <div className="mt-3 pl-8 space-y-1.5 border-l border-dashed border-gray-100 ml-3.5">
                        {subtasks.map((task) => (
                          <div 
                            key={task.id}
                            className="flex items-center justify-between p-2.5 hover:bg-gray-50/50 rounded-xl group transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button 
                                onClick={() => handleUpdateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                                className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                  task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 hover:border-emerald-500'
                                }`}
                              >
                                {task.status === 'done' && <CheckCircle size={10} />}
                              </button>
                              <span 
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsDrawerOpen(true);
                                }}
                                className={`text-[11px] font-bold hover:text-primary cursor-pointer transition-colors truncate ${
                                  task.status === 'done' ? 'text-gray-300 line-through font-normal' : 'text-gray-600'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getPriorityColorClass(task.priority)}`}>
                                {getPriorityLabel(task.priority)}
                              </span>
                              <span className={`px-1.5 py-0.5 border rounded text-[8px] font-black uppercase tracking-wider ${getStatusColorClass(task.status)}`}>
                                {getStatusLabel(task.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        <button
                          onClick={() => handleOpenCreateTaskModal(category.id)}
                          className="flex items-center gap-1.5 p-2 hover:bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400 hover:text-primary transition-all w-full text-left border border-dashed border-gray-100 hover:border-primary/20"
                        >
                          <Plus size={12} /> Thêm nhiệm vụ con...
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => {
                const columnTasks = flatTasks().filter(t => t.status === status);
                
                return (
                  <div 
                    key={status}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    className="bg-gray-50/50 border border-gray-100 rounded-3xl p-3 flex flex-col min-h-[350px]"
                  >
                    {/* Lane Header */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'done' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></span>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                          {status === 'done' ? 'Đã xong' : status === 'in_progress' ? 'Đang làm' : 'Cần làm'}
                        </h4>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 bg-white border border-gray-100 w-4.5 h-4.5 rounded-full flex items-center justify-center">
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-grow space-y-2 overflow-y-auto pr-0.5">
                      {columnTasks.length === 0 ? (
                        <div className="h-full border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-center p-4 text-gray-300">
                          <p className="text-[9px] font-bold">Kéo thả thẻ nhiệm vụ vào đây</p>
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDrawerOpen(true);
                            }}
                            className="bg-white border border-gray-100 rounded-2xl p-3 shadow-xs hover:shadow-sm hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing group relative"
                          >
                            <h5 className="text-[11px] font-black text-gray-800 leading-snug group-hover:text-primary transition-colors mb-1.5 truncate">
                              {task.title}
                            </h5>
                            
                            <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-gray-50">
                              <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded ${getPriorityColorClass(task.priority)}`}>
                                {getPriorityLabel(task.priority)}
                              </span>
                              {task.dueDate && (
                                <span className="text-[8.5px] text-gray-400 font-bold flex items-center gap-1">
                                  <Clock size={8} /> {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TIMELINE GANTT VIEW */}
          {activeTab === 'timeline' && (
            <div className="flex-grow space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {plan.tasks.filter(t => !t.parentTaskId).map((category, idx) => {
                const subtasks = category.subTasks && category.subTasks.length > 0 
                  ? category.subTasks 
                  : plan.tasks.filter(t => t.parentTaskId === category.id);
                const completed = subtasks.filter(s => s.status === 'done').length;
                const progressPercent = subtasks.length 
                  ? Math.round((completed / subtasks.length) * 100) 
                  : (category.status === 'done' ? 100 : 0);

                return (
                  <div key={category.id} className="grid grid-cols-12 items-center gap-3 p-3 border border-gray-50 hover:bg-gray-50/20 rounded-2xl transition-all bg-white shadow-xs">
                    {/* Phase number & name */}
                    <div className="col-span-12 md:col-span-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          GĐ {idx + 1}
                        </span>
                        <h4 className="text-[11px] font-black text-gray-800 truncate" title={category.title}>
                          {category.title}
                        </h4>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                        <Calendar size={8} />
                        {category.startDate ? formatDate(category.startDate) : 'Chờ thiết lập'} - {category.dueDate ? formatDate(category.dueDate) : 'Chờ thiết lập'}
                      </p>
                    </div>

                    {/* Progress Slider Display */}
                    <div className="col-span-12 md:col-span-6 flex items-center gap-2">
                      <div className="flex-grow bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 w-6 text-right">{progressPercent}%</span>
                    </div>

                    {/* Target Button to Detail */}
                    <div className="col-span-12 md:col-span-2 text-right">
                      <button 
                        onClick={() => {
                          setSelectedTask(category);
                          setIsDrawerOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-gray-50 hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase text-gray-600 transition-all w-full text-center"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMN 3: AI CHAT CO-PILOT (Right Sidebar - 3 Columns) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          {/* AI Header */}
          <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-primary/5 to-secondary/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-primary/20 overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
              <img src="/ai-bot.png" alt="AI Bot" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm text-gray-900 truncate">Planify AI Co-Pilot</h3>
              <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Đang hoạt động
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/20">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 bg-white">
                    {msg.role === 'user' ? (
                      <div className="w-full h-full bg-primary text-white flex items-center justify-center">
                        <User size={12} />
                      </div>
                    ) : (
                      <img src="/ai-bot.png" alt="AI" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none shadow-xs shadow-primary/10' 
                      : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-xs'
                  }`}>
                    {msg.role === 'user' ? msg.content : <FormattedMessage content={msg.content} onApplyAction={handleApplyDelayFix} onRejectAction={pendingDelayStrategy ? handleRejectDelayFix : undefined} />}
                  </div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-xl overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                    <img src="/ai-bot.png" alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 bg-white text-gray-400 rounded-2xl rounded-tl-none border border-gray-100 shadow-xs italic text-[10px] flex items-center gap-1.5">
                    <RefreshCw size={10} className="animate-spin text-primary" />
                    AI đang phân tích & xây dựng lộ trình...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 border-t border-gray-50 bg-white flex flex-wrap gap-1.5 overflow-x-auto select-none">
            {[
              { label: '💡 Thêm tài liệu', text: 'Gợi ý tài liệu và video tự học bổ sung cho các nhiệm vụ trong lộ trình này.' },
              { label: '⚡ Tối ưu lộ trình', text: 'Hãy tinh chỉnh lộ trình này tối ưu hơn, tập trung vào kiến thức cốt lõi và rút ngắn thời gian.' },
              { label: '➕ Thêm thực hành', text: 'Hãy thiết kế bổ sung thêm các bài tập thực hành/dự án cụ thể cho lộ trình.' },
              { label: '📅 Thay đổi hạn chót', text: 'Chỉnh sửa lại dòng thời gian của lộ trình chi tiết hơn.' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setChatInput(chip.text);
                }}
                className="text-[9px] font-bold bg-gray-50 hover:bg-primary/5 hover:text-primary border border-gray-100 rounded-lg px-2 py-1 transition-all flex-shrink-0 cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-50 bg-white">
            <div className="relative">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendWorkspaceMessage()}
                placeholder="Yêu cầu AI cập nhật hay hỏi về task..."
                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs"
              />
              <button 
                onClick={handleSendWorkspaceMessage}
                disabled={!chatInput.trim() || isChatLoading}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                  chatInput.trim() && !isChatLoading ? 'bg-primary text-white shadow-xs' : 'text-gray-300'
                }`}
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Task Details Side-Over Drawer */}
      {isDrawerOpen && selectedTask && (
        <div className="fixed inset-0 z-[1000] overflow-hidden">
          {/* Overlay background */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            {/* Drawer Content */}
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Chi tiết nhiệm vụ
                  </span>
                  <h3 className="text-sm font-black text-gray-900 truncate max-w-[280px]">
                    {selectedTask.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                
                {/* Details Fields */}
                <div className="space-y-4">
                  {/* Title Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tên nhiệm vụ</label>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary/20 rounded-2xl text-xs font-bold text-gray-700 outline-none transition-all"
                      placeholder="Nhập tên nhiệm vụ..."
                    />
                  </div>

                  {/* Status Dropdown selector & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Trạng thái</label>
                      <select 
                        value={selectedTask.status}
                        onChange={(e) => handleUpdateTaskStatus(selectedTask.id, e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-transparent hover:border-gray-200 rounded-2xl text-xs font-bold text-gray-700 outline-none transition-all appearance-none"
                      >
                        <option value="todo">Cần làm</option>
                        <option value="in_progress">Đang làm</option>
                        <option value="done">Đã xong</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Độ ưu tiên</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                        className="w-full p-3 bg-gray-50 border border-transparent hover:border-gray-200 rounded-2xl text-xs font-bold text-gray-700 outline-none transition-all appearance-none"
                      >
                        <option value="low">Thấp</option>
                        <option value="medium">Vừa</option>
                        <option value="high">Cao</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-50 py-4 my-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Bắt đầu</label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary/20 rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Hạn chót</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary/20 rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mô tả công việc</label>
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary/20 rounded-2xl text-xs text-gray-600 leading-relaxed min-h-[100px] outline-none transition-all resize-none"
                      placeholder="Nhập mô tả chi tiết nhiệm vụ..."
                    />
                  </div>
                </div>

                {/* AI Study Resources Section */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen size={16} />
                    <h4 className="text-xs font-black uppercase tracking-wider">Tài liệu học tập gợi ý</h4>
                  </div>
                  
                  <p className="text-[11px] text-gray-400 font-bold leading-normal">
                    AI đã tổng hợp một số liên kết tham khảo uy tín dựa trên tên nhiệm vụ để giúp bạn bắt đầu:
                  </p>

                  <div className="space-y-3">
                    <a 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent('Hướng dẫn tự học ' + (editTitle || selectedTask.title))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-red-50/20 hover:bg-red-50/50 border border-red-100/50 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        YT
                      </div>
                      <div className="flex-grow">
                        <h5 className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors">Video Youtube Hướng dẫn</h5>
                        <p className="text-[9px] text-gray-400 font-bold">Tìm kiếm các bài giảng video...</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent('Tài liệu tự học ' + (editTitle || selectedTask.title) + ' pdf')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50/20 hover:bg-blue-50/50 border border-blue-100/50 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        GG
                      </div>
                      <div className="flex-grow">
                        <h5 className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Tìm giáo trình & tài liệu PDF</h5>
                        <p className="text-[9px] text-gray-400 font-bold">Tìm kiếm tài liệu học thuật trên Google...</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button 
                  onClick={handleDeleteTask}
                  disabled={isDeletingTask}
                  className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-2xl text-xs transition-all text-center flex items-center justify-center gap-1.5"
                >
                  {isDeletingTask ? <RefreshCw className="animate-spin" size={12} /> : <Trash2 size={12} />}
                  Xóa nhiệm vụ
                </button>
                <button 
                  onClick={handleSaveTaskEdit}
                  disabled={isSavingTask}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl text-xs hover:scale-[1.02] active:scale-95 disabled:opacity-40 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  {isSavingTask ? <RefreshCw className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                  Lưu thay đổi
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Xóa kế hoạch"
        message="Bạn có chắc chắn muốn xóa kế hoạch này và tất cả nhiệm vụ liên quan không? Hành động này không thể hoàn tác."
        confirmText="Xóa kế hoạch"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleDeleteActivePlan}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Delete Task Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteTaskModalOpen}
        title="Xóa nhiệm vụ"
        message={`Bạn có chắc chắn muốn xóa nhiệm vụ "${taskToDelete?.title}" ${taskToDelete?.subTasks && taskToDelete.subTasks.length > 0 ? 'và toàn bộ nhiệm vụ con của nó ' : ''}không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa nhiệm vụ"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleDeleteTaskConfirm}
        onCancel={() => {
          setIsDeleteTaskModalOpen(false);
          setTaskToDelete(null);
        }}
      />

      {/* Create Task Modal */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-5 transform animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-black text-sm text-gray-800">
                {createTaskParentId ? 'Thêm nhiệm vụ con thủ công' : 'Thêm nhiệm vụ chính thủ công'}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {createTaskParentId ? 'Nhiệm vụ này sẽ thuộc về nhiệm vụ cha đã chọn.' : 'Nhiệm vụ này sẽ là một phần chính của kế hoạch.'}
              </p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tiêu đề nhiệm vụ</label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Nhập tiêu đề nhiệm vụ..."
                  className="w-full p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs font-semibold text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mô tả chi tiết</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Nhập mô tả chi tiết công việc..."
                  className="w-full h-24 p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs text-gray-600 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bắt đầu</label>
                  <input
                    type="date"
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary/20 rounded-2xl text-xs font-bold text-gray-700 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hạn chót</label>
                  <input
                    type="date"
                    value={createDueDate}
                    onChange={(e) => setCreateDueDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary/20 rounded-2xl text-xs font-bold text-gray-700 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Độ ưu tiên</label>
                <select
                  value={createPriority}
                  onChange={(e) => setCreatePriority(e.target.value as TaskPriority)}
                  className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary/20 rounded-2xl text-xs font-bold text-gray-700 outline-none transition-all appearance-none"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Vừa</option>
                  <option value="high">Cao</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl text-xs hover:scale-105 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  {isCreatingTask ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <>
                      <Plus size={14} /> Thêm nhiệm vụ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Community Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-5 transform animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-black text-sm text-gray-800">Chia sẻ Kế hoạch lên Thư viện</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Kế hoạch sẽ được gửi đến Admin để phê duyệt trước khi công khai.
              </p>
            </div>

            <form onSubmit={handlePublishPlan} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tiêu đề hiển thị</label>
                <input
                  type="text"
                  required
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  placeholder="Tiêu đề hiển thị trên thư viện cộng đồng..."
                  className="w-full p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs font-semibold text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mô tả giới thiệu</label>
                <textarea
                  value={publishDescription}
                  onChange={(e) => setPublishDescription(e.target.value)}
                  placeholder="Mô tả mục đích, kết quả hoặc hướng dẫn áp dụng cho lộ trình này..."
                  className="w-full h-24 p-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-xs text-gray-600 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPublishModalOpen(false);
                    setPublishTitle('');
                    setPublishDescription('');
                  }}
                  className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl text-xs hover:scale-105 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  {isPublishing ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <>
                      <Globe size={14} /> Gửi phê duyệt
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Completion Feedback Popup */}
      {plan && (
        <PlanCompletionFeedbackModal
          isOpen={showCompletionFeedback}
          planId={plan.id}
          planTitle={plan.title}
          isAIGenerated={plan.isAIGenerated ?? false}
          onClose={() => setShowCompletionFeedback(false)}
        />
      )}
    </div>
  );
};

export default PlanDetail;
