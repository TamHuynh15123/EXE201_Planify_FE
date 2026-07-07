import React, { useState } from 'react';
import { X, Send, Star, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { communityService } from '../services/communityService';

interface PlanCompletionFeedbackModalProps {
  isOpen: boolean;
  planId: string;
  planTitle: string;
  isAIGenerated: boolean;
  onClose: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 9999,
  backgroundColor: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '28px',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
  border: '1px solid #f0f0f0',
  overflow: 'hidden',
};

export const PlanCompletionFeedbackModal: React.FC<PlanCompletionFeedbackModalProps> = ({
  isOpen, planId, planTitle, isAIGenerated, onClose,
}) => {
  const [isEffective, setIsEffective]   = useState<boolean | null>(null);
  const [reason, setReason]             = useState('');
  const [suggestions, setSuggestions]   = useState('');
  const [rating, setRating]             = useState<number | undefined>(undefined);
  const [hoverRating, setHoverRating]   = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSkip = () => {
    localStorage.setItem(`plan_feedback_done_${planId}`, 'skipped');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEffective === null) { setError('Vui lòng chọn mức độ hiệu quả.'); return; }
    if (!isEffective && !reason.trim()) { setError('Vui lòng cho biết lý do kế hoạch không hiệu quả.'); return; }

    setIsSubmitting(true); setError(null);
    try {
      await communityService.submitPlanFeedback({
        planId,
        isEffective,
        reason: reason.trim() || undefined,
        suggestions: suggestions.trim() || undefined,
        rating,
      });
      localStorage.setItem(`plan_feedback_done_${planId}`, 'submitted');
      setSuccess(true);
      setTimeout(onClose, 2500);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {success ? (
          /* ── Success ── */
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} color="#22c55e" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 900, color: '#111' }}>Cảm ơn bạn!</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Phản hồi của bạn giúp AI Planify ngày càng tốt hơn.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #f5f5f5', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 24 }}>🎉</span>
                  <h2 style={{ margin: '6px 0 4px', fontSize: 15, fontWeight: 900, color: '#1a1a2e' }}>Chúc mừng! Kế hoạch hoàn thành!</h2>
                  <p style={{ margin: 0, fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>{planTitle}</p>
                </div>
                <button onClick={handleSkip} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 12, color: '#888' }}>
                  <X size={18} />
                </button>
              </div>
              {isAIGenerated && (
                <p style={{ margin: '12px 0 0', fontSize: 12, color: '#6d28d9', fontWeight: 500 }}>
                  Kế hoạch này được AI tạo ra — hãy cho chúng tôi biết nó có hữu ích không nhé!
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>

              {/* Effectiveness */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Kế hoạch AI có hiệu quả không? <span style={{ color: '#ef4444' }}>*</span>
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setIsEffective(true)}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: 16, border: `2px solid ${isEffective === true ? '#22c55e' : '#e5e7eb'}`,
                      backgroundColor: isEffective === true ? '#f0fdf4' : '#fafafa',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontWeight: 700, fontSize: 13, color: isEffective === true ? '#16a34a' : '#6b7280',
                      transition: 'all 0.15s',
                    }}
                  >
                    <ThumbsUp size={16} /> Có, hiệu quả
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEffective(false)}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: 16, border: `2px solid ${isEffective === false ? '#ef4444' : '#e5e7eb'}`,
                      backgroundColor: isEffective === false ? '#fef2f2' : '#fafafa',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontWeight: 700, fontSize: 13, color: isEffective === false ? '#dc2626' : '#6b7280',
                      transition: 'all 0.15s',
                    }}
                  >
                    <ThumbsDown size={16} /> Không hiệu quả
                  </button>
                </div>
              </div>

              {/* Reason (chỉ hiện khi không hiệu quả) */}
              {isEffective === false && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Lý do <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={reason} onChange={e => setReason(e.target.value)}
                    rows={2} maxLength={1000}
                    placeholder="Kế hoạch không phù hợp vì..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 14, border: '1.5px solid #e5e7eb', fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#374151' }}
                  />
                </div>
              )}

              {/* Suggestions */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Đề xuất cải thiện
                </label>
                <textarea
                  value={suggestions} onChange={e => setSuggestions(e.target.value)}
                  rows={2} maxLength={2000}
                  placeholder="AI nên thêm/bớt... hoặc điều chỉnh..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 14, border: '1.5px solid #e5e7eb', fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#374151' }}
                />
              </div>

              {/* Star rating */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Đánh giá tổng thể
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star} type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(rating === star ? undefined : star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 28, lineHeight: 1, transition: 'transform 0.1s' }}
                    >
                      <Star
                        size={26}
                        fill={(hoverRating || rating || 0) >= star ? '#f59e0b' : 'none'}
                        color={(hoverRating || rating || 0) >= star ? '#f59e0b' : '#d1d5db'}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                  {rating && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
                      {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'][rating]}
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
                  type="button" onClick={handleSkip}
                  style={{ flex: 1, padding: '12px', borderRadius: 16, border: '1.5px solid #e5e7eb', backgroundColor: 'white', color: '#6b7280', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Bỏ qua
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 16, border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: 'white', fontWeight: 700, fontSize: 13, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {isSubmitting
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Đang gửi...</>
                    : <><Send size={14} />Gửi phản hồi</>
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
