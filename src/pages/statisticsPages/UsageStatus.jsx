import UsageStatusTable from '../../components/tables/statTables/UsageStatusTable';
import { IoReloadSharp } from 'react-icons/io5';

export default function UsageStatus() {
  function handleReload() {
    console.log('reload');
    // 새로 고침 로직을 여기에 추가하세요.
  }

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          실시간 도구 사용 정보
        </h1>
        <button
          onClick={handleReload}
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp className="mr-2" />
          새로 고침
        </button>
      </div>
      <div className="w-10/12 max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="border border-black rounded-lg">
          <UsageStatusTable />
        </div>
      </div>
    </div>
  );
}
