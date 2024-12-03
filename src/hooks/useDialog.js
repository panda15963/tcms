import { useContext } from 'react';
import { DialogContext } from '../context/DialogProvider';

/**
 * useDialog 훅
 * 
 * DialogContext를 사용하여 다이얼로그 상태 및 기능에 접근하는 커스텀 훅입니다.
 * 이 훅을 사용하면 다이얼로그의 열기, 닫기, 상태 관리와 같은 기능에 쉽게 접근할 수 있습니다.
 * 
 * @returns {Object} DialogContext에서 제공하는 상태 및 메서드
 * @throws {Error} DialogContext가 Provider 외부에서 호출될 경우 오류를 던집니다.
 * 
 * @example
 * const { openDialog, closeDialog } = useDialog();
 * openDialog({ title: 'Example', content: 'This is a dialog' });
 */
export const useDialog = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }

  return context;
};
