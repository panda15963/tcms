import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import English from './locales/ENG.json';
import Korean from './locales/KOR.json';

// 언어 리소스 정의
const resources = {
  eng: {
    translation: English, // 영어 번역 파일
  },
  kor: {
    translation: Korean, // 한국어 번역 파일
  },
};

i18n
  .use(LanguageDetector) // 브라우저의 언어를 감지하여 설정
  .use(initReactI18next) // react-i18next와 i18n 인스턴스 연결
  .init({
    fallbackLng: 'kor', // 기본 언어 설정 (한국어)
    debug: false, // 디버깅 모드 비활성화
    resources, // 로컬 번역 리소스 설정
    interpolation: {
      escapeValue: false, // React는 기본적으로 값을 escape 처리함
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'], // 언어 감지 우선순위
      caches: ['cookie', 'localStorage'], // 언어 정보를 저장할 위치
    },
  });

export default i18n;
