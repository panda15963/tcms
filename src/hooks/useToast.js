import { useContext } from 'react';
import { ToastContext } from '../context/ToastProvider';

/**
 * useToast 훅
 * 
 * `ToastContext`를 사용하여 토스트 메시지와 관련된 상태와 메서드를 제공하는 커스텀 훅입니다.
 * 
 * @returns {Object} context - 토스트 메시지와 관련된 함수 및 상태
 * @throws {Error} 컨텍스트가 정의되지 않은 경우 (ToastProvider 없이 사용한 경우)
 * 
 * @example
 * const { showToast } = useToast();
 * showToast('This is a toast message!', { type: 'success' });
 */
const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

export default useToast;
