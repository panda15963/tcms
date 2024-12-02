import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../../D3Charts/ProgressBar';

// 테이블 헤더 정의
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: t('RealTime.ToolName') }, // 도구 이름
  { id: 3, name: t('RealTime.VersionName') }, // 버전 이름
  { id: 4, name: t('RealTime.StartTestingTime') }, // 테스트 시작 시간
  { id: 5, name: t('RealTime.ExecutedTime') }, // 실행 시간
  { id: 6, name: t('RealTime.OperationStatus') }, // 진행 상태
];

// 컴포넌트 정의
export default function RealTimeUsageTable({ data = [] }) {
  const { t } = useTranslation();
  const columns = useMemo(() => TableHeader(t), [t]);

  // 데이터가 항상 배열인지 확인
  const sanitizedData = Array.isArray(data) ? data : [];

  return (
    <div className="h-full w-full overflow-auto">
      <table className="w-full h-full table-auto border-collapse border border-gray-300">
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
                    {row[field] || '-'} {/* 데이터가 없을 경우 '-' 표시 */}
                  </td>
                )
              )}
              <td
                className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap"
                style={{ width: '200px', height: '30px' }}
              >
                <ProgressBar data={row.processpercentage || 0} /> {/* 진행률 표시 */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
