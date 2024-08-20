import { FaExclamationCircle } from 'react-icons/fa';

export default function Error({ errorMessage }) {
  /**
   * 오류 발생 시 화면에 뜨는 빨간색 오류 팝업
   * @param {string} errorMessage - 오류 메시지
   */
  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 bg-red-200 text-white p-2 rounded-md shadow-md mt-20 z-50"
      role="alert" // 접근성을 위한 role 속성
    >
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0">
          {/* 오류를 나타내는 경고 아이콘 */}
          <FaExclamationCircle
            aria-hidden="true" // 스크린 리더에서 무시하도록 설정
            className="h-5 w-5 text-red-500 text-md" // 아이콘 크기 및 색상 설정
          />
        </div>
        <div className="ml-3">
          {/* 오류 메시지 출력 */}
          <p className="text-md font-medium text-red-800">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}
