import { useLanguage } from '../../context/LanguageProvider';
import KOR_Flags from '../../img/KOR_Flags.png';
import ENG_Flags from '../../img/ENG_Flags.png';

export default function LanguageToggle() {
  // useLanguage 훅을 사용해 현재 언어와 언어 변경 함수를 가져옴
  const { language, changeLanguage } = useLanguage();

  // 현재 언어가 영어인지 여부를 판단
  const isEnglish = language === 'ENG';

  /**
   * 토글 스위치가 변경될 때 호출되는 함수
   * 현재 언어에 따라 한국어(KOR)와 영어(ENG)를 전환
   */
  const handleLanguageChange = () => {
    changeLanguage(isEnglish ? 'KOR' : 'ENG'); // 언어 변경
  };

  return (
    <div className="px-4 text-sm font-semibold">
      <button
        type="button"
        onClick={handleLanguageChange}
        className="focus:outline-none"
      >
        {/* 현재 선택된 언어에 맞는 국기 이미지 표시 */}
        <img
          src={isEnglish ? ENG_Flags : KOR_Flags}
          alt={isEnglish ? 'English Flag' : 'Korean Flag'}
          className="inline-block h-10 w-10 rounded-full"
        />
      </button>
    </div>
  );
}
