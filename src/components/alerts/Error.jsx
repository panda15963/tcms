import { FaExclamationCircle } from 'react-icons/fa';

export default function Error({ errorMessage }) {
  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 bg-red-200 text-white p-2 rounded-md shadow-md mt-20 z-50"
      role="alert"
    >
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0">
          <FaExclamationCircle
            aria-hidden="true"
            className="h-5 w-5 text-red-500 text-md"
          />
        </div>
        <div className="ml-3">
          <p className="text-md font-medium text-red-800">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}
