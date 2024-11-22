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

// Component Definition
export default function RealTimeUsageTable({ data = [] }) {
  const { t } = useTranslation();
  const columns = useMemo(() => TableHeader(t), [t]);

  // Ensure data is always an array
  const sanitizedData = Array.isArray(data) ? data : [];

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
          {sanitizedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {['PC', 'toolname', 'toolver', 'starttime', 'runtime'].map(
                (field) => (
                  <td
                    key={`${row.id || rowIndex}-${field}`}
                    className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 tracking-wide whitespace-nowrap"
                  >
                    {row[field] || '-'}
                  </td>
                )
              )}
              <td
                className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap"
                style={{ width: '200px', height: '30px' }}
              >
                <ProgressBar data={row.processpercentage || 0} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

