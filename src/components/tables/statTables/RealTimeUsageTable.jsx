import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../../D3Charts/ProgressBar';

// Table headers
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: '도구명' },
  { id: 3, name: '버전명' },
  { id: 4, name: 'TC 평가 시작 시간' },
  { id: 5, name: '실행 시간' },
  { id: 6, name: '동작 상태' },
];

// Table data
const TableData = [
  {
    id: 1,
    pc: '100',
    tool: 'A',
    version: '1.0',
    startTime: '2021-09-01 00:00:00',
    duration: '00:30:00',
    progress: 50,
  },
  {
    id: 2,
    pc: '200',
    tool: 'A',
    version: '2.0',
    startTime: '2021-09-01 01:00:00',
    duration: '01:00:00',
    progress: 70,
  },
  {
    id: 3,
    pc: '300',
    tool: 'A',
    version: '3.0',
    startTime: '2021-09-01 02:00:00',
    duration: '00:45:00',
    progress: 90,
  },
  {
    id: 4,
    pc: '400',
    tool: 'B',
    version: '4.0',
    startTime: '2021-09-01 03:00:00',
    duration: '02:00:00',
    progress: 60,
  },
  {
    id: 5,
    pc: '500',
    tool: 'B',
    version: '5.0',
    startTime: '2021-09-01 04:00:00',
    duration: '01:30:00',
    progress: 40,
  },
  {
    id: 6,
    pc: '600',
    tool: 'B',
    version: '1.1',
    startTime: '2021-09-01 05:00:00',
    duration: '00:20:00',
    progress: 75,
  },
  {
    id: 7,
    pc: '700',
    tool: 'C',
    version: '2.1',
    startTime: '2021-09-01 06:00:00',
    duration: '00:50:00',
    progress: 85,
  },
  {
    id: 8,
    pc: '800',
    tool: 'C',
    version: '3.1',
    startTime: '2021-09-01 07:00:00',
    duration: '01:10:00',
    progress: 55,
  },
  {
    id: 9,
    pc: '900',
    tool: 'C',
    version: '4.1',
    startTime: '2021-09-01 08:00:00',
    duration: '00:40:00',
    progress: 95,
  },
  {
    id: 10,
    pc: '1000',
    tool: 'C',
    version: '5.1',
    startTime: '2021-09-01 09:00:00',
    duration: '01:20:00',
    progress: 65,
  },
];

// Component Definition
export default function RealTimeUsageTable() {
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
              {['pc', 'tool', 'version', 'startTime', 'duration'].map(
                (field) => (
                  <td
                    key={`${data.id}-${field}`}
                    className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 tracking-wide whitespace-nowrap"
                  >
                    {data[field]}
                  </td>
                )
              )}
              <td
                className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap"
                style={{ width: '200px', height: '30px' }} // Adjust to your desired fixed size
              >
                <ProgressBar data={data.progress} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
