import { FaCheck } from 'react-icons/fa6';

export default function Completion({ successfulMessage }) {
  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 bg-green-200 text-white p-2 rounded-md shadow-md mt-20 z-50"
      role="alert"
    >
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0">
          <FaCheck
            aria-hidden="true"
            className="h-5 w-5 text-green-500 text-md"
          />
        </div>
        <div className="ml-3">
          <p className="text-md font-medium text-green-800">
            {successfulMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
