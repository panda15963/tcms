import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { createContext, useState } from 'react';

export const ToastContext = createContext({
  showToast: null,
});

export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, title, message, timeout = 3000) => {
    const id = Date.now();
    // console.log("OPENING TOAST ==> ", component);
    setToasts((toasts) => [...toasts, { id, type, title, message }]);
    setTimeout(() => close(id), timeout);
  };

  const close = (id) =>
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id));

  const getToastIcon = (type) => {
    switch (type) {
      case ToastTypes.SUCCESS:
        return (
          <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden />
        );
      case ToastTypes.ERROR:
        return <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden />;
      case ToastTypes.WARNING:
        return (
          <ExclamationCircleIcon
            className="h-6 w-6 text-yellow-400"
            aria-hidden
          />
        );
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, close }}>
      {children}
      <div className="space-y-4 fixed top-16 right-4  pointer-events-auto w-full max-w-sm overflow-hidden z-50">
        {toasts.map(({ type, id, title, message }) => (
          <div
            key={id}
            className="p-2 bg-white border border-gray-200 rounded-lg ring-2 ring-black ring-opacity-5"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">{getToastIcon(type)}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm  text-gray-500">{message}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => close(id)}
                >
                  <span className="sr-only">닫기</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
