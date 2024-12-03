import { useContext } from 'react';
import { LoadingBarContext } from '../context/LoadingContextProvider';

/**
 * useLoading 훅
 * 
 * 로딩 바 상태를 관리하는 컨텍스트를 제공하는 커스텀 훅입니다. 
 * 이 훅은 `LoadingBarContext`를 사용하여 로딩 상태를 컨트롤합니다.
 * 
 * @returns {Object} context - 로딩 상태와 관련된 함수와 상태값
 * @throws {Error} 컨텍스트가 정의되지 않은 경우 (Provider 없이 사용한 경우)
 * 
 * @example
 * const { isLoading, startLoading, stopLoading } = useLoading();
 */
function useLoading() {
  const context = useContext(LoadingBarContext);

  if (!context) {
    throw new Error('useLoading must be used within a LoadingContextProvider');
  }

  return context;
}

export default useLoading;
