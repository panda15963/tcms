import UsageStatusTable from '../../components/tables/statTables/UsageStatusTable';

export default function UsageStatus() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
        실시간 도구 사용 정보
      </h1>
      <div className="w-10/12 max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="border border-black rounded-lg">
          <UsageStatusTable />
        </div>
      </div>
    </div>
  );
}
