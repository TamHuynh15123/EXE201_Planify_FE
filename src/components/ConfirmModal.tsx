import React from 'react';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const themes = {
    danger: {
      bg: 'bg-red-50',
      icon: <AlertTriangle className="text-red-600" size={24} />,
      button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
      border: 'border-red-100'
    },
    warning: {
      bg: 'bg-yellow-50',
      icon: <AlertCircle className="text-yellow-600" size={24} />,
      button: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200',
      border: 'border-yellow-100'
    },
    info: {
      bg: 'bg-blue-50',
      icon: <Info className="text-blue-600" size={24} />,
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
      border: 'border-blue-100'
    }
  };

  const theme = themes[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 transform animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`${theme.bg} p-3 rounded-2xl`}>
              {theme.icon}
            </div>
            <button 
              onClick={onCancel}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 leading-relaxed">{message}</p>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`flex-1 px-6 py-3.5 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${theme.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
