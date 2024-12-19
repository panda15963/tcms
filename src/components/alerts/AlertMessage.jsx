import { FiAlertTriangle } from "react-icons/fi";

/**
 * AlertMessage 컴포넌트 - 경고 메시지를 표시하는 팝업
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {string} props.message - 표시할 경고 메시지
 * @param {function} props.onClose - 팝업 닫기 이벤트 핸들러
 */
const AlertMessage = ({ message }) => {
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        {/* 경고 아이콘 및 제목 */}
        <div className="shrink-0">
          <FiAlertTriangle
            aria-hidden="true"
            className="size-5 text-yellow-400"
          />
        </div>
        <div className="ml-3">
          {/* 경고 메시지 */}
          <div className="mt-2 text-sm text-yellow-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
