import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { createContext, useState } from 'react';

/**
 * ToastContext 생성
 * @description 토스트 메시지 표시를 위한 Context 생성
 */
export const ToastContext = createContext({
  showToast: null, // 토스트 메시지 표시 함수 초기값
});

/**
 * 토스트 타입 정의
 * @description 토스트 메시지의 종류를 나타냄
 */
export const ToastTypes = {
  SUCCESS: 'success', // 성공 메시지
  ERROR: 'error', // 에러 메시지
  WARNING: 'warning', // 경고 메시지
};

/**
 * ToastProvider 컴포넌트
 * @description 자식 컴포넌트에 토스트 메시지 표시 기능을 제공
 * @param {Object} children - 자식 컴포넌트
 * @returns {JSX.Element} ToastProvider 컴포넌트
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]); // 현재 표시 중인 토스트 메시지 관리

  /**
   * 토스트 메시지 표시 함수
   * @param {string} type - 토스트 타입 (success, error, warning)
   * @param {string} title - 토스트 제목
   * @param {string} message - 토스트 메시지 내용
   * @param {number} timeout - 토스트 메시지가 사라지기까지의 시간(ms)
   */
  const showToast = (type, title, message, timeout = 3000) => {
    const id = Date.now(); // 고유 ID 생성
    setToasts((toasts) => [...toasts, { id, type, title, message }]); // 새로운 토스트 추가
    setTimeout(() => close(id), timeout); // 지정된 시간 후 토스트 닫기
  };

  /**
   * 특정 토스트 메시지 닫기
   * @param {number} id - 닫을 토스트의 고유 ID
   */
  const close = (id) =>
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id));

  /**
   * 토스트 타입에 따른 아이콘 반환
   * @param {string} type - 토스트 타입
   * @returns {JSX.Element|null} 토스트 아이콘
   */
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
      default:
        return null;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, close }}>
      {children} {/* ToastProvider 내부 콘텐츠 렌더링 */}
      <div className="space-y-4 fixed top-16 right-4 pointer-events-auto w-full max-w-sm overflow-hidden z-50">
        {/* 현재 표시 중인 토스트 메시지 렌더링 */}
        {toasts.map(({ type, id, title, message }) => (
          <div
            key={id}
            className="p-2 bg-white border border-gray-200 rounded-lg ring-2 ring-black ring-opacity-5"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">{getToastIcon(type)}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => close(id)} // 토스트 닫기 버튼 클릭 핸들러
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
