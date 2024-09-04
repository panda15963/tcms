import { useState, useEffect } from 'react';
import KOR_Flags from '../../img/KOR_Flags.svg';
import ENG_Flags from '../../img/ENG_Flags.svg';

export default function SwitchLanguages({ onClick }) {
  // Always default to Korean ('KOR') on page load, regardless of localStorage
  const [language, changeLanguage] = useState('KOR');
  const isEnglish = language === 'ENG';

  useEffect(() => {
    // Check if a user had previously selected a language and load it only if it's stored
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    } else {
      // If no language is stored, default to 'KOR'
      changeLanguage('KOR');
    }
  }, []); // Empty dependency array means this runs once on component mount

  useEffect(() => {
    // When language changes, store it in localStorage
    localStorage.setItem('language', language);
    onClick(language); // Pass the selected language to parent component if needed
  }, [language, onClick]);

  const handleLanguageChange = () => {
    const newLanguage = isEnglish ? 'KOR' : 'ENG';
    changeLanguage(newLanguage);
  };

  return (
    <div className="px-4 text-sm font-semibold">
      <button
        type="button"
        onClick={handleLanguageChange}
        className="focus:outline-none"
      >
        <img
          src={isEnglish ? ENG_Flags : KOR_Flags}
          alt={isEnglish ? 'English Flag' : 'Korean Flag'}
          className="inline-block h-10 w-10 rounded-full"
        />
      </button>
    </div>
  );
}
