import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { createContext, useCallback, useState } from 'react';

/**
 * DialogContext
 * @description 다이얼로그 상태 및 제어를 위한 Context
 */
export const DialogContext = createContext();

/**
 * DialogTypes
 * @description 다이얼로그의 다양한 타입을 정의
 * @property {string} REQUEST - 요청 타입
 * @property {string} SUCCESS - 성공 타입
 * @property {string} DELETE - 삭제 타입
 */
export const DialogTypes = {
  REQUEST: 'request', // 요청 타입
  SUCCESS: 'success', // 성공 타입
  DELETE: 'delete', // 삭제 타입
};

/**
 * 초기 다이얼로그 내용 상태
 */
const initialDialogContent = {
  type: '', // 다이얼로그 타입
  title: '', // 다이얼로그 제목
  content: '', // 다이얼로그 내용
};

/**
 * DialogProvider
 * @description 다이얼로그 상태를 관리하고 자식 컴포넌트에 제공
 * @param {Object} children - Provider 내부에서 렌더링할 자식 컴포넌트
 * @returns {JSX.Element} DialogProvider 컴포넌트
 */
export const DialogProvider = ({ children }) => {
  const [isOpen, setOpen] = useState(false); // 다이얼로그 열림 상태 관리
  const [dialogContent, setDialogContent] = useState(initialDialogContent); // 다이얼로그 내용 상태 관리
  const [onConfirm, setOnConfirm] = useState(null); // 확인 콜백 함수 상태 관리

  /**
   * 다이얼로그 표시 함수
   * @param {string} type - 다이얼로그 타입
   * @param {string} title - 다이얼로그 제목
   * @param {string} content - 다이얼로그 내용
   * @param {Function} confirmCallback - 확인 버튼 클릭 시 실행할 콜백 함수
   */
  const showDialog = useCallback((type, title, content, confirmCallback) => {
    setDialogContent((preVal) => ({
      ...preVal,
      type: type, // 다이얼로그 타입 설정
      title: title, // 다이얼로그 제목 설정
      content: content, // 다이얼로그 내용 설정
    }));
    setOnConfirm(() => confirmCallback); // 확인 콜백 함수 설정
    setOpen(true); // 다이얼로그 열기
  }, []);

  /**
   * 다이얼로그 닫기 함수
   */
  const closeDialog = useCallback(() => {
    setOpen(false); // 다이얼로그 닫기
    setOnConfirm(null); // 확인 콜백 초기화
    setDialogContent(initialDialogContent); // 다이얼로그 내용 초기화
  }, []);

  return (
    <DialogContext.Provider
      value={{
        isOpen, // 다이얼로그 열림 상태
        showDialog, // 다이얼로그 표시 함수
        closeDialog, // 다이얼로그 닫기 함수
        dialogContent, // 다이얼로그 내용
        onConfirm, // 확인 콜백
      }}
    >
      {children} {/* 다이얼로그 프로바이더 내부 콘텐츠 렌더링 */}
    </DialogContext.Provider>
  );
};
