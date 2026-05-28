import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300
              ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-100 text-red-800' : ''}
              ${toast.type === 'warning' ? 'bg-white border-yellow-100 text-yellow-800' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-100 text-blue-800' : ''}
            `}
          >
            <div className={`
              p-2 rounded-xl
              ${toast.type === 'success' ? 'bg-green-50 text-green-600' : ''}
              ${toast.type === 'error' ? 'bg-red-50 text-red-600' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-50 text-yellow-600' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 text-blue-600' : ''}
            `}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <XCircle size={20} />}
              {toast.type === 'warning' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            
            <div className="flex-grow mr-2">
              <p className="text-sm font-bold leading-tight">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
