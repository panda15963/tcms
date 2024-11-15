import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle } from 'react-icons/fa';

const AlertMessage = ({ message, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <div className="flex items-center space-x-3">
          <FaExclamationTriangle className="text-yellow-500 h-6 w-6" />
          <h2 className="text-lg font-semibold text-gray-800"></h2>
        </div>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            {t('AlertMessage.Check')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
