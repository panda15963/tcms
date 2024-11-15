import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const statusIcons = {
  Idle: '🟡',
  Running: '🟢',
  'Not Responded': '🔴',
  Completed: '🟢',
};

// Table headers
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: '도구명' },
  { id: 3, name: '버전명' },
  { id: 4, name: 'TC 평가 시작 시간' },
  { id: 5, name: '실행 시간' },
  { id: 6, name: '동작 상태' },
  { id: 7, name: '비고' },
];

// Table data
const TableData = [
  {
    id: 1,
    pc: '100',
    tool: 'A',
    version: '1.0',
    startTime: '2021-09-01 00:00:00',
    duration: '00:00:00',
    progress: 50,
    status: 'Idle',
    note: '',
  },
  {
    id: 2,
    pc: '200',
    tool: 'A',
    version: '2.0',
    startTime: '2021-09-01 00:00:00',
    duration: '00:00:00',
    progress: 70,
    status: 'Running',
    note: '',
  },
  {
    id: 3,
    pc: '300',
    tool: 'A',
    version: '3.0',
    startTime: '2021-09-01 00:00:00',
    duration: '00:00:00',
    progress: 90,
    status: 'Not Responded',
    note: '',
  },
  {
    id: 4,
    pc: '400',
    tool: 'B',
    version: '1.1',
    startTime: '2021-09-01 01:00:00',
    duration: '00:10:00',
    progress: 20,
    status: 'Running',
    note: '',
  },
  {
    id: 5,
    pc: '500',
    tool: 'B',
    version: '2.1',
    startTime: '2021-09-01 02:00:00',
    duration: '00:15:00',
    progress: 40,
    status: 'Idle',
    note: '',
  },
  {
    id: 6,
    pc: '600',
    tool: 'B',
    version: '3.1',
    startTime: '2021-09-01 03:00:00',
    duration: '00:20:00',
    progress: 60,
    status: 'Running',
    note: '',
  },
  {
    id: 7,
    pc: '700',
    tool: 'C',
    version: '1.2',
    startTime: '2021-09-01 04:00:00',
    duration: '00:25:00',
    progress: 80,
    status: 'Not Responded',
    note: '',
  },
  {
    id: 8,
    pc: '800',
    tool: 'C',
    version: '2.2',
    startTime: '2021-09-01 05:00:00',
    duration: '00:30:00',
    progress: 100,
    status: 'Completed',
    note: '',
  },
  {
    id: 9,
    pc: '900',
    tool: 'C',
    version: '3.2',
    startTime: '2021-09-01 06:00:00',
    duration: '00:35:00',
    progress: 45,
    status: 'Running',
    note: '',
  },
  {
    id: 10,
    pc: '1000',
    tool: 'C',
    version: '1.3',
    startTime: '2021-09-01 07:00:00',
    duration: '00:40:00',
    progress: 75,
    status: 'Idle',
    note: '',
  },
];


// Component Definition
export default function UsageStatusTable() {
  const { t } = useTranslation();
  const columns = useMemo(() => TableHeader(t), [t]);

  return (
    <div className="flow-root h-full">
      <table className="min-w-full w-full divide-y divide-gray-200 border-gray-300">
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
                'startTime',
                'duration',
                'status',
                'note',
              ].map((field) => (
                <td
                  key={`${data.id}-${field}`}
                  className="px-6 py-4 border-2 text-center text-base font-medium text-gray-700 tracking-wide whitespace-nowrap"
                >
                  {field === 'status' ? (
                    <>
                      {statusIcons[data.status]} {data.status}
                    </>
                  ) : (
                    data[field]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
