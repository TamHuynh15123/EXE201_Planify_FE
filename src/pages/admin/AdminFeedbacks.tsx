import React, { useState, useEffect, useCallback } from 'react';
import {
  ThumbsUp, ThumbsDown, Star, RefreshCw,
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import {
  adminFeedbackService,
  GeneralFeedbackItem,
  PlanFeedbackItem,
} from '../../services/adminFeedbackService';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  ai_quality:      '🤖 Chất lượng AI',
  ui_ux:           '🎨 Giao diện',
  performance:     '⚡ Hiệu suất',
  bug_report:      '🐛 Báo lỗi',
  feature_request: '💡 Tính năng',
  content:         '📝 Nội dung',
  subscription:    '💳 Gói đăng ký',
  general:         '💬 Khác',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Chờ xử lý', color: '#d97706', bg: '#fef3c7' },
  reviewed: { label: 'Đang xem',  color: '#2563eb', bg: '#dbeafe' },
  resolved: { label: 'Đã xử lý', color: '#16a34a', bg: '#dcfce7' },
};

function StarDisplay({ value }: { value?: number | null }) {
  if (!value) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>;
  return (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s} size={13}
          fill={s <= value ? '#f59e0b' : 'none'}
          color={s <= value ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontSize: 13, color: '#6b7280' }}>
      <span>Tổng <strong style={{ color: '#111' }}>{total}</strong> kết quả</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: page <= 1 ? '#f9fafb' : 'white', cursor: page <= 1 ? 'default' : 'pointer', color: page <= 1 ? '#d1d5db' : '#374151' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ padding: '6px 14px', borderRadius: 8, background: '#7c3aed', color: 'white', fontWeight: 700 }}>{page}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: page >= totalPages ? '#f9fafb' : 'white', cursor: page >= totalPages ? 'default' : 'pointer', color: page >= totalPages ? '#d1d5db' : '#374151' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── General Feedback Tab ───────────────────────────────────────────────────────

function GeneralFeedbackTab() {
  const [items, setItems]     = useState<GeneralFeedbackItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [catFilter, setCatFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFeedbackService.getGeneralFeedbacks(page, pageSize, catFilter || undefined, statusFilter || undefined);
      setItems(res.items ?? []);
      setTotal(res.totalCount ?? 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [page, catFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await adminFeedbackService.updateGeneralFeedbackStatus(id, newStatus);
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as any } : i));
    } finally { setUpdatingId(null); }
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', color: '#374151', cursor: 'pointer' }}>
          <option value="">Tất cả danh mục</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', color: '#374151', cursor: 'pointer' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="reviewed">Đang xem</option>
          <option value="resolved">Đã xử lý</option>
        </select>
        <button onClick={load}
          style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Đang tải...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Không có dữ liệu</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => {
            const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Row header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : item.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111', flex: 1 }}>{item.title}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f5f3ff', color: '#7c3aed', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.userName ?? 'Ẩn danh'}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                      <StarDisplay value={item.rating} />
                    </div>
                  </div>
                  {/* Status badge + selector */}
                  <select
                    value={item.status}
                    disabled={updatingId === item.id}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleStatusChange(item.id, e.target.value)}
                    style={{ padding: '4px 10px', borderRadius: 20, border: 'none', fontWeight: 700, fontSize: 11, color: sc.color, background: sc.bg, cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="reviewed">Đang xem</option>
                    <option value="resolved">Đã xử lý</option>
                  </select>
                  <Eye size={16} color={isOpen ? '#7c3aed' : '#9ca3af'} />
                </div>
                {/* Expanded detail */}
                {isOpen && item.description && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f3f4f6' }}>
                    <p style={{ margin: '12px 0 0', fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}

// ── Plan Feedback Tab ──────────────────────────────────────────────────────────

function PlanFeedbackTab() {
  const [items, setItems]     = useState<PlanFeedbackItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFeedbackService.getPlanFeedbacks(page, pageSize);
      setItems(res.items ?? []);
      setTotal(res.totalCount ?? 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Stats
  const effective   = items.filter(i => i.isEffective).length;
  const ineffective = items.filter(i => !i.isEffective).length;
  const avgRating   = items.filter(i => i.rating).reduce((s, i) => s + (i.rating ?? 0), 0) / (items.filter(i => i.rating).length || 1);

  return (
    <div>
      {/* Stats row */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Hiệu quả', value: effective, icon: <ThumbsUp size={16} color="#16a34a" />, bg: '#dcfce7', color: '#16a34a' },
            { label: 'Không hiệu quả', value: ineffective, icon: <ThumbsDown size={16} color="#dc2626" />, bg: '#fef2f2', color: '#dc2626' },
            { label: 'Điểm trung bình', value: avgRating.toFixed(1), icon: <Star size={16} color="#f59e0b" />, bg: '#fef3c7', color: '#d97706' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '14px 18px', borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', gap: 10 }}>
              {s.icon}
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Đang tải...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Chưa có khảo sát nào</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => {
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : item.id)}>
                  {/* Effective badge */}
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: item.isEffective ? '#dcfce7' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.isEffective ? <ThumbsUp size={16} color="#16a34a" /> : <ThumbsDown size={16} color="#dc2626" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.planTitle ?? 'Kế hoạch không xác định'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.userName ?? 'Ẩn danh'}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                      <StarDisplay value={item.rating} />
                    </div>
                  </div>
                  <Eye size={16} color={isOpen ? '#7c3aed' : '#9ca3af'} />
                </div>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f3f4f6' }}>
                    {item.reason && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lý do không hiệu quả</p>
                        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{item.reason}</p>
                      </div>
                    )}
                    {item.suggestions && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đề xuất cải thiện</p>
                        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{item.suggestions}</p>
                      </div>
                    )}
                    {!item.reason && !item.suggestions && (
                      <p style={{ margin: '12px 0 0', fontSize: 13, color: '#9ca3af' }}>Không có nội dung bổ sung.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const AdminFeedbacks: React.FC = () => {
  const [tab, setTab] = useState<'general' | 'plan'>('general');

  const tabs = [
    { key: 'general', label: '💬 Góp ý chung', desc: 'Phản hồi tổng quát từ người dùng' },
    { key: 'plan',    label: '🤖 Khảo sát AI Plan', desc: 'Đánh giá hiệu quả kế hoạch AI' },
  ] as const;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#111' }}>Quản lý Feedback</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>Xem và xử lý phản hồi từ người dùng về ứng dụng và chất lượng AI.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #f3f4f6', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', background: 'transparent',
              fontWeight: tab === t.key ? 800 : 500,
              fontSize: 14,
              color: tab === t.key ? '#7c3aed' : '#6b7280',
              borderBottom: tab === t.key ? '2px solid #7c3aed' : '2px solid transparent',
              marginBottom: -2,
              transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'general' ? <GeneralFeedbackTab /> : <PlanFeedbackTab />}
    </div>
  );
};

export default AdminFeedbacks;
