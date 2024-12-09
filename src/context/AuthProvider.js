import { createContext, useEffect, useState } from 'react';

// AuthContext 생성
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null); // 인증 상태 관리
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem('user'); // 로컬 스토리지에서 'user' 가져오기

    if (storedUser) {
      setAuth(JSON.parse(storedUser)); // JSON 파싱 후 인증 상태 업데이트
    }
    setLoading(false); // 로딩 완료
  }, []);

  // 로그인 함수
  const login = (userData) => {
    console.log('🚀 ~ login ~ userData:', userData);

    setAuth(userData); // 인증 상태 업데이트
    localStorage.setItem('user', JSON.stringify(userData)); // 로컬 스토리지에 사용자 데이터 저장
  };

  // 로그아웃 함수
  const logout = () => {
    setAuth(null);
    localStorage.removeItem('user');
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('REFRESH_TOKEN');
  };

  const isAuthenticated = !!auth; // 사용자 인증 여부 확인
  const isActiveManagement = auth && auth.admin_use_yn === 'Y'; // 관리 권한 여부 확인

  // 컨텍스트 값 정의
  const authContextValue = {
    auth,
    isAuthenticated,
    login,
    logout,
    isActiveManagement,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children} {/* 로딩 완료 후 children 컴포넌트 렌더링 */}
    </AuthContext.Provider>
  );
};
export default AuthContext;
