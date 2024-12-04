import { createContext, useEffect, useState } from 'react';

/**
 * LoadingBarContext
 * @description 로딩 상태를 관리하기 위한 Context
 * @property {boolean} loading - 현재 로딩 상태
 * @property {Function} setLoading - 로딩 상태를 업데이트하는 함수
 */
export const LoadingBarContext = createContext({
  loading: false, // 로딩 상태 초기값
  setLoading: null, // 로딩 상태 업데이트 함수 초기값
});

/**
 * LoadingBarProvider 컴포넌트
 * @description 로딩 상태를 관리하고 자식 컴포넌트에 전달
 * @param {Object} children - Provider 내부에 렌더링할 자식 컴포넌트
 * @returns {JSX.Element} LoadingBarProvider 컴포넌트
 */
export const LoadingBarProvider = ({ children }) => {
  const [loading, setLoading] = useState(false); // 로딩 상태 관리
  const value = { loading, setLoading }; // Context에 제공할 값

  /**
   * 로딩 상태 변경 시 콘솔에 출력 (디버깅 용도)
   */
  useEffect(() => {
    console.log('LOADING BAR SHOW ==> ', loading);
  }, [loading]);

  return (
    <LoadingBarContext.Provider value={value}>
      {children} {/* LoadingBarProvider 내부 콘텐츠 렌더링 */}
    </LoadingBarContext.Provider>
  );
};
