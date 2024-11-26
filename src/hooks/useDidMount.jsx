import { useEffect } from 'react';

const useDidMount = (callback) => {
  useEffect(() => {
    callback();
  }, []); // 빈 의존성 배열을 사용하여 컴포넌트가 마운트될 때만 실행
};

export default useDidMount;
