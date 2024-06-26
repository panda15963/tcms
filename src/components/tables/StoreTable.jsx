const stores = [
  {
    name: '123골프 클럽 6홀',
    latitude: '126.9062861',
    longitude: '37.6414556',
  },
  {
    name: '123골프 클럽 9홀',
    latitude: '126.9062861',
    longitude: '37.6414556',
  },
];

const tableHeader = [
  {
    title: '가게 이름',
  },
  {
    title: '위도',
  },
  {
    title: '경도',
  },
];
export default function StoreTable() {
  return (
    <div className="flow-root">
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2">
          {tableHeader.map(
            (header) =>
              header && (
                <th
                  key={header.title}
                  className="px-6 py-3 text-center text-sm font-bold text-black border-2 tracking-wider"
                >
                  {header.title}
                </th>
              ),
          )}
        </thead>
        <tbody className="divide-y divide-gray-500">
          {stores.length === 0 && (
            <tr>
              <td
                colSpan={tableHeader.length}
                className="px-6 py-4 whitespace-nowrap text-center border-2 text-sm text-black"
              >
                가게가 없습니다.
              </td>
            </tr>
          )}
          {stores.map((store) => (
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-center border-2 text-sm text-black">
                {store.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center border-2 text-sm text-black">
                {store.latitude}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center border-2 text-sm text-black">
                {store.longitude}
              </td>              
            </tr>            
          ))}
        </tbody>
      </table>
    </div>
  );
}