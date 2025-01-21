import { useState, useEffect } from 'react';
import korflag from '../../assets/images/flag_kor.png'; // 한국어 국기 이미지
import usaflag from '../../assets/images/flag_usa.png'; // 영어 국기 이미지

/**
 * SwitchLanguages 컴포넌트
 * @description 언어 전환 버튼을 제공하며, 현재 선택된 언어를 저장하고 부모 컴포넌트로 전달
 * @param {Function} onClick - 선택된 언어를 부모 컴포넌트에 전달하는 함수
 * @returns {JSX.Element} 언어 전환 컴포넌트
 */
export default function SwitchLanguages({ onClick }) {
  // 기본 언어를 한국어('KOR')로 설정
  const [language, changeLanguage] = useState('KOR');
  const isEnglish = language === 'ENG'; // 현재 언어가 영어인지 여부 확인

  /**
   * 컴포넌트가 처음 로드될 때 실행
   * localStorage에서 저장된 언어를 불러오거나 기본 언어('KOR')로 설정
   */
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language'); // 저장된 언어 가져오기
    if (savedLanguage) {
      changeLanguage(savedLanguage); // 저장된 언어로 변경
    } else {
      changeLanguage('KOR'); // 기본 언어 설정
    }
  }, []);

  /**
   * 언어가 변경될 때마다 실행
   * localStorage에 언어를 저장하고 부모 컴포넌트에 선택된 언어를 전달
   */
  useEffect(() => {
    localStorage.setItem('language', language); // 선택된 언어를 localStorage에 저장
    onClick(language); // 부모 컴포넌트로 선택된 언어 전달
  }, [language, onClick]);

  /**
   * 언어 변경 처리 함수
   * 현재 언어에 따라 한국어('KOR') 또는 영어('ENG')로 변경
   */
  const handleLanguageChange = () => {
    const newLanguage = isEnglish ? 'KOR' : 'ENG';
    changeLanguage(newLanguage); // 언어 상태 업데이트
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <div className="px-4 text-sm font-semibold">
      <button
        type="button"
        onClick={handleLanguageChange} // 언어 변경 버튼 클릭 이벤트
        className="focus:outline-none transform scale-95"
      >
        <img
          src={isEnglish ? usaflag : korflag} // 현재 언어에 따라 표시할 국기 이미지 선택
          alt={isEnglish ? 'English Flag' : 'Korean Flag'} // 현재 언어에 따라 대체 텍스트 설정
          className="inline-block h-10 w-10 rounded-full cursor-default"
          style={{ userSelect: 'none' }}
          onContextMenu={handleContextMenu}
        />
      </button>
    </div>
  );
}
