import React, { useState } from 'react';
import { X, Send, Star, CheckCircle2, ChevronDown } from 'lucide-react';
import { feedbackService, FeedbackCategory, SubmitGeneralFeedbackPayload } from '../services/feedbackService';

const CATEGORIES: { value: FeedbackCategory; label: string; emoji: string; desc: string }[] = [
  { value: 'ui_ux',           label: 'Giao diện & Trải nghiệm', emoji: '🎨', desc: 'Góp ý thiết kế, bố cục, màu sắc' },
  { value: 'ai_quality',      label: 'Chất lượng AI',           emoji: '🤖', desc: 'Độ chính xác của kế hoạch AI tạo ra' },
  { value: 'performance',     label: 'Hiệu suất',               emoji: '⚡', desc: 'Tốc độ tải trang, phản hồi chậm' },
  { value: 'bug_report',      label: 'Báo lỗi',                 emoji: '🐛', desc: 'Tính năng không hoạt động đúng' },
  { value: 'feature_request', label: 'Đề xuất tính năng',       emoji: '💡', desc: 'Muốn có thêm tính năng mới' },
  { value: 'content',         label: 'Nội dung',                emoji: '📝', desc: 'Lỗi chính tả, thông tin không chính xác' },
  { value: 'subscription',    label: 'Gói đăng ký',             emoji: '💳', desc: 'Thắc mắc thanh toán, gói dùng thử' },
  { value: 'general',         label: 'Khác',                    emoji: '💬', desc: 'Góp ý tổng quát khác' },
];

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 9999,
  backgroundColor: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
  border: '1px solid #f0f0f0',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GeneralFeedbackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [category, setCategory]         = useState<FeedbackCategory>('general');
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [rating, setRating]             = useState<number | undefined>(undefined);
  const [hoverRating, setHoverRating]   = useState(0);
  const [isCatOpen, setIsCatOpen]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);

  if (!isOpen) return null;

  const selectedCat = CATEGORIES.find(c => c.value === category)!;

  const handleClose = () => {
    setTitle(''); setDescription(''); setRating(undefined);
    setCategory('general'); setError(null); setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề phản hồi.'); return; }
    setIsSubmitting(true); setError(null);
    try {
      const payload: SubmitGeneralFeedbackPayload = {
        category, title: title.trim(),
        description: description.trim() || undefined,
        rating,
      };
      await feedbackService.submitGeneral(payload);
      setSuccess(true);
      setTimeout(handleClose, 2500);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={cardStyle}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#111' }}>Gửi góp ý cho chúng tôi</h2>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Mọi phản hồi đều giúp Planify tốt hơn mỗi ngày.</p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 10, color: '#9ca3af' }}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} color="#22c55e" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 900, color: '#111' }}>Cảm ơn bạn!</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Phản hồi của bạn đã được ghi nhận.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Hạng mục</label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button" onClick={() => setIsCatOpen(!isCatOpen)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', backgroundColor: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: 18 }}>{selectedCat.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111' }}>{selectedCat.label}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedCat.desc}</p>
                  </div>
                  <ChevronDown size={14} color="#9ca3af" style={{ transform: isCatOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
                </button>
                {isCatOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, backgroundColor: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', overflow: 'hidden', zIndex: 10, maxHeight: 240, overflowY: 'auto' }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value} type="button"
                        onClick={() => { setCategory(cat.value); setIsCatOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', border: 'none', backgroundColor: category === cat.value ? '#f5f3ff' : 'white', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: category === cat.value ? '#7c3aed' : '#374151' }}>{cat.label}</p>
                          <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{cat.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Tiêu đề <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                maxLength={255} placeholder="Tóm tắt ngắn gọn vấn đề hoặc đề xuất..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 14, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#374151' }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Mô tả chi tiết</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                maxLength={3000} rows={3}
                placeholder="Mô tả thêm về vấn đề, các bước tái hiện lỗi, hoặc gợi ý của bạn..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 14, border: '1.5px solid #e5e7eb', fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#374151', lineHeight: 1.6 }}
              />
            </div>

            {/* Star rating */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Đánh giá trải nghiệm</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star} type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(rating === star ? undefined : star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  >
                    <Star
                      size={24}
                      fill={(hoverRating || rating || 0) >= star ? '#f59e0b' : 'none'}
                      color={(hoverRating || rating || 0) >= star ? '#f59e0b' : '#d1d5db'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
                {rating && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
                    {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, fontSize: 12, color: '#dc2626' }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button" onClick={handleClose}
                style={{ flex: 1, padding: '12px', borderRadius: 16, border: '1.5px solid #e5e7eb', backgroundColor: 'white', color: '#6b7280', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                type="submit" disabled={isSubmitting}
                style={{
                  flex: 2, padding: '12px', borderRadius: 16, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: 'white', fontWeight: 700, fontSize: 13,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isSubmitting
                  ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Đang gửi...</>
                  : <><Send size={14} />Gửi góp ý</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
