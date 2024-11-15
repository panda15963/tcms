import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Table headers
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: '도구명' },
  { id: 3, name: '버전명' },
  { id: 4, name: '수신 시간' },
  { id: 5, name: '항목' },
  { id: 6, name: '이전 설정 값' },
  { id: 7, name: '신규 설정 값' },
];

// Table data
const TableData = [
  {
    id: 1,
    pc: '100',
    tool: 'A',
    version: '1.0',
    collectTime: '2021-09-01 00:00:00',
    item: 'Log Path',
    previousItem: 'C:\\',
    newItem: 'C:\\temp\\',
  },
  {
    id: 2,
    pc: 'PC2',
    tool: 'B',
    version: '2.0',
    collectTime: '2021-09-01 00:00:00',
    item: 'Check',
    previousItem: 'False',
    newItem: 'True',
  },
  {
    id: 3,
    pc: 'PC3',
    tool: 'C',
    version: '3.0',
    collectTime: '2021-09-01 00:00:00',
    item: 'Platform',
    previousItem: '표준형 5세대',
    newItem: 'ccIC27',
  },
  {
    id: 4,
    pc: 'PC4',
    tool: 'D',
    version: '4.0',
    collectTime: '2021-09-01 01:00:00',
    item: 'Security Level',
    previousItem: 'Medium',
    newItem: 'High',
  },
  {
    id: 5,
    pc: 'PC5',
    tool: 'E',
    version: '1.5',
    collectTime: '2021-09-01 02:00:00',
    item: 'Update Version',
    previousItem: 'v1.4.3',
    newItem: 'v1.5.1',
  },
  {
    id: 6,
    pc: 'PC6',
    tool: 'F',
    version: '2.5',
    collectTime: '2021-09-01 03:00:00',
    item: 'Network',
    previousItem: 'Public',
    newItem: 'Private',
  },
  {
    id: 7,
    pc: 'PC7',
    tool: 'G',
    version: '3.2',
    collectTime: '2021-09-01 04:00:00',
    item: 'Log Level',
    previousItem: 'Info',
    newItem: 'Debug',
  },
  {
    id: 8,
    pc: 'PC8',
    tool: 'H',
    version: '2.3',
    collectTime: '2021-09-01 05:00:00',
    item: 'Path',
    previousItem: '/usr/local/bin',
    newItem: '/usr/bin',
  },
  {
    id: 9,
    pc: 'PC9',
    tool: 'I',
    version: '3.4',
    collectTime: '2021-09-01 06:00:00',
    item: 'Permission',
    previousItem: 'Read-Only',
    newItem: 'Read-Write',
  },
  {
    id: 10,
    pc: 'PC10',
    tool: 'J',
    version: '4.5',
    collectTime: '2021-09-01 07:00:00',
    item: 'Service Status',
    previousItem: 'Stopped',
    newItem: 'Running',
  },
];

// Component Definition
export default function ConfigurationTable() {
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
              {[
                'pc',
                'tool',
                'version',
                'collectTime',
                'item',
                'previousItem',
                'newItem',
              ].map((field) => (
                <td
                  key={`${data.id}-${field}`}
                  className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 tracking-wide whitespace-nowrap"
                >
                  {data[field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
