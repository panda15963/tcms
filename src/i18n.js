import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
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
  .use(Backend) // HTTP를 통해 번역 파일 로드 (기본 경로: public/assets/locals/en/translation.json)
  .use(LanguageDetector) // 브라우저의 언어를 감지하여 설정
  .use(initReactI18next) // react-i18next와 i18n 인스턴스 연결
  .init({
    fallbackLng: 'kor', // 사용자가 사용하는 언어가 없을 경우 기본 언어 설정 (한국어)
    debug: true, // 디버깅 모드 활성화 (콘솔에 출력)
    interpolation: {
      escapeValue: false, // React는 기본적으로 값을 escape 처리함
    },
    resources, // 번역 리소스 설정
  });

export default i18n;
