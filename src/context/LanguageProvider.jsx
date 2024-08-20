import { createContext, useState, useContext } from 'react';

// 언어를 위한 컨텍스트 생성
const LanguageContext = createContext();

/**
 * 커스텀 훅: 언어 컨텍스트를 사용하기 위한 훅
 * 이 훅을 통해 컴포넌트에서 언어 설정에 접근할 수 있습니다.
 */
export const useLanguage = () => useContext(LanguageContext);

/**
 * LanguageProvider 컴포넌트
 * 애플리케이션 전체에서 사용할 언어 설정을 제공하는 컨텍스트 프로바이더입니다.
 * @param {ReactNode} children - 자식 컴포넌트
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('KOR'); // 기본 언어를 한국어(KOR)로 설정

  /**
   * 언어를 변경하는 함수
   * @param {string} lang - 선택된 언어 (예: 'ENG' 또는 'KOR')
   */
  const changeLanguage = (lang) => {
    setLanguage(lang); // 언어 상태를 업데이트
  };

  return (
    // LanguageContext.Provider를 통해 하위 컴포넌트에서 언어 설정과 변경 함수에 접근 가능
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children} {/* 자식 컴포넌트 렌더링 */}
    </LanguageContext.Provider>
  );
};
