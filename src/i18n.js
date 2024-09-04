import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import English from './locales/ENG.json';
import Korean from './locales/KOR.json';

const resources = {
  eng: {
    translation: English
  },
  kor: {
    translation: Korean
  }
};

i18n
  .use(Backend) // Load translations using http (default public/assets/locals/en/translation.json)
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    fallbackLng: 'kor', // Fallback language if the user language is not available
    debug: true,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources,
  });
  
export default i18n;