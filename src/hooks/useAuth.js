import { useContext, useDebugValue } from 'react';
import AuthContext from '../context/AuthProvider';

/**
 * useAuth 훅
 * 사용자 인증 상태와 관련된 정보를 반환
 * 
 * @returns {Object} AuthContext - 인증 상태와 관련된 컨텍스트 데이터
 * 
 * @example
 * const { auth, login, logout } = useAuth();
 */
const useAuth = () => {
  const { auth } = useContext(AuthContext); // AuthContext에서 auth 상태 가져오기

  /**
   * React DevTools에서 표시되는 디버그 정보
   * 사용자 인증 상태에 따라 'Logged in' 또는 'Logged out'으로 표시
   */
  useDebugValue(auth, (auth) => (auth?.admin_id ? 'Logged in' : 'Logged out'));

  return useContext(AuthContext); // AuthContext 반환
};

export default useAuth;
