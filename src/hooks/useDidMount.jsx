import { useEffect } from 'react';

/**
 * useDidMount 훅
 * 
 * 컴포넌트가 마운트될 때 단 한 번 실행되는 콜백 함수를 처리하기 위한 커스텀 훅입니다.
 * 
 * @param {Function} callback - 컴포넌트가 마운트될 때 실행할 콜백 함수
 * 
 * @example
 * useDidMount(() => {
 *   console.log('Component has been mounted');
 * });
 */
const useDidMount = (callback) => {
  useEffect(() => {
    if (typeof callback === 'function') {
      callback();
    } else {
      console.warn('useDidMount expects a function as its argument.');
    }
  }, []); // 빈 의존성 배열을 사용하여 컴포넌트가 마운트될 때만 실행
};

export default useDidMount;
