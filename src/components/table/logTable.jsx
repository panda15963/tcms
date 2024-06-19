const logs = [
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
  export default function LogTable() {
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
                  {logs.map((log) => (
                      <tr key={log.name} className="divide-x divide-gray-500">
                          <td className="px-6 py-4 text-sm leading-5 text-black
                          text-center font-semibold">{log.name}</td>
                          <td className="px-6 py-4 text-sm leading-5 text-black
                          text-center font-semibold">{log.latitude}</td>
                          <td className="px-6 py-4 text-sm leading-5 text-black
                          text-center font-semibold">{log.longitude}</td>
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
  