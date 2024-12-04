import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * AlertMessage 컴포넌트 - 경고 메시지를 표시하는 팝업
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {string} props.message - 표시할 경고 메시지
 * @param {function} props.onClose - 팝업 닫기 이벤트 핸들러
 */
const AlertMessage = ({ message, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        {/* 경고 아이콘 및 제목 */}
        <div className="flex items-center space-x-3">
          <FaExclamationTriangle className="text-yellow-500 h-6 w-6" />
          <h2 className="text-lg font-semibold text-gray-800">{t('AlertMessage.Title')}</h2>
        </div>

        {/* 경고 메시지 */}
        <p className="mt-3 text-sm text-gray-600">{message}</p>

        {/* 확인 버튼 */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose} // 버튼 클릭 시 팝업 닫기
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            {t('AlertMessage.Check')} {/* 확인 버튼 텍스트 (다국어 지원) */}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AlertMessage;