import { FaCheck } from 'react-icons/fa6';

export default function Completion({ successfulMessage }) {
  /**
   * 성공적인 작업(예: 올바른 좌표 입력) 시 나타나는 초록색 팝업
   * @param {string} successfulMessage - 성공 메시지
   */
  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 bg-green-200 text-white p-2 rounded-md shadow-md mt-20 z-50"
      role="alert" // 접근성을 위한 role 속성
    >
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0">
          {/* 성공을 나타내는 체크 아이콘 */}
          <FaCheck
            aria-hidden="true" // 스크린 리더에서 무시하도록 설정
            className="h-5 w-5 text-green-500 text-md" // 아이콘 크기 및 색상 설정
          />
        </div>
        <div className="ml-3">
          {/* 성공 메시지 출력 */}
          <p className="text-md font-medium text-green-800">
            {successfulMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
