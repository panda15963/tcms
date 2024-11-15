import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Table headers
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: '도구명' },
  { id: 3, name: '버전명' },
  { id: 4, name: '로그 수신 시간' },
  { id: 5, name: '로그 레벨' },
  { id: 6, name: '상세 로그' },
];

const TableData = [
  {
    id: 1,
    pc: '100',
    tool: 'A',
    version: '1.0',
    collectTime: '2021-09-01 00:00:00',
    level: 'INFO',
    detail: 'This is a sample log message',
  },
  {
    id: 2,
    pc: '200',
    tool: 'A',
    version: '2.0',
    collectTime: '2021-09-01 00:00:00',
    level: 'ERROR',
    detail: 'This is a sample log message',
  },
  {
    id: 3,
    pc: '300',
    tool: 'A',
    version: '3.0',
    collectTime: '2021-09-01 00:00:00',
    level: 'DEBUG',
    detail: 'This is a sample log message',
  },
  {
    id: 4,
    pc: '400',
    tool: 'B',
    version: '1.1',
    collectTime: '2021-09-01 01:00:00',
    level: 'WARN',
    detail: 'This is a warning log message',
  },
  {
    id: 5,
    pc: '500',
    tool: 'B',
    version: '2.1',
    collectTime: '2021-09-01 02:00:00',
    level: 'ERROR',
    detail: 'This is an error log message',
  },
  {
    id: 6,
    pc: '600',
    tool: 'C',
    version: '3.1',
    collectTime: '2021-09-01 03:00:00',
    level: 'INFO',
    detail: 'This is an info log message',
  },
  {
    id: 7,
    pc: '700',
    tool: 'C',
    version: '1.2',
    collectTime: '2021-09-01 04:00:00',
    level: 'DEBUG',
    detail: 'This is a debug log message',
  },
  {
    id: 8,
    pc: '800',
    tool: 'A',
    version: '2.2',
    collectTime: '2021-09-01 05:00:00',
    level: 'INFO',
    detail: 'This is an info log message',
  },
  {
    id: 9,
    pc: '900',
    tool: 'B',
    version: '3.2',
    collectTime: '2021-09-01 06:00:00',
    level: 'ERROR',
    detail: 'This is an error log message',
  },
  {
    id: 10,
    pc: '1000',
    tool: 'C',
    version: '1.3',
    collectTime: '2021-09-01 07:00:00',
    level: 'WARN',
    detail: 'This is a warning log message',
  },
];


// Component Definition
export default function LogTable() {
  const { t } = useTranslation();
  const columns = useMemo(() => TableHeader(t), [t]);

  return (
    <div className="flow-root">
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-100 border-2">
          <tr>
            {columns.map((header) => (
              <th
                key={header.id}
                className="px-4 py-3 border-2 text-center text-sm font-semibold text-black uppercase tracking-wider whitespace-nowrap"
              >
                {header.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {TableData.map((data) => (
            <tr key={data.id}>
              {['pc', 'tool', 'version', 'collectTime', 'level', 'detail'].map(
                (field) => (
                  <td
                    key={`${data.id}-${field}`}
                    className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 tracking-wide whitespace-nowrap"
                  >
                    {data[field]}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
