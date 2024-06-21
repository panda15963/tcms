const stores = [
  {
    name: '123골프 클럽 6홀',
    latitude: '126.9062861',
  },
  {
    name: '123골프 클럽 9홀',
    latitude: '126.9062861',
  },
];

const tableHeader = [
  {
    title: 'Meta List',
  },
  {
    title: 'Info',
  },
];
export default function MetaDataListTable() {
  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 sm:rounded-lg border-2 border-gray-500">
            <table className="min-w-full divide-y divide-gray-500">
              <thead>
                <tr className="divide-x divide-gray-500">
                  {tableHeader.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-center text-md leading-4 font-semibold text-black border-r-1 border-gray-500"
                    >
                      {header.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-500">
                {stores.map((store) => (
                    <tr key={store.name} className="divide-x divide-gray-500">
                        <td className="px-6 py-4 text-sm leading-5 text-black
                        text-center font-semibold">{store.name}</td>
                        <td className="px-6 py-4 text-sm leading-5 text-black
                        text-center font-semibold">{store.latitude}</td>
                        <td className="px-6 py-4 text-sm leading-5 text-black
                        text-center font-semibold">{store.longitude}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
