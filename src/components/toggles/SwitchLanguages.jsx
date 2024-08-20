import { Switch } from '@headlessui/react';
import { useLanguage } from '../../context/LanguageProvider';
import Korea_Flags from '../../img/Korea_Flags.png';
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
    <div className="flex items-center space-x-4 px-4 text-sm font-semibold">
      {/* 현재 선택된 언어를 텍스트로 표시 */}
      <span>{isEnglish ? 'English' : '한국어'}</span>

      {/* 현재 선택된 언어에 맞는 국기 이미지 표시 */}
      <img
        src={isEnglish ? ENG_Flags : Korea_Flags}
        alt={isEnglish ? 'English Flag' : 'Korean Flag'}
        className="w-8 h-8"
      />

      {/* 언어를 변경할 수 있는 토글 스위치 */}
      <Switch
        checked={isEnglish} // 스위치가 현재 영어로 설정되어 있는지 여부
        onChange={handleLanguageChange} // 스위치가 변경되면 언어 전환
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors ease-in-out duration-200 ${
          isEnglish ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        {/* 스위치의 버튼 (흰색 원) */}
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ease-in-out duration-200 ${
            isEnglish ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </Switch>
    </div>
  );
}
