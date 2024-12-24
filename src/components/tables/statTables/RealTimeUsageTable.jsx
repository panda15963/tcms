import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../../D3Charts/ProgressBar';

/**
 * TableHeader
 * @description 테이블 헤더 정의 함수
 * @param {Function} t - 다국어 번역 함수
 * @returns {Array} 테이블 헤더 배열
 */
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: t('RealTime.ToolName') }, // 도구 이름
  { id: 3, name: t('RealTime.VersionName') }, // 버전 이름
  { id: 4, name: t('RealTime.StartTestingTime') }, // 테스트 시작 시간
  { id: 5, name: t('RealTime.ExecutedTime') }, // 실행 시간
  { id: 6, name: t('RealTime.OperationStatus') }, // 진행 상태
];

/**
 * RealTimeUsageTable
 * @description 실시간 사용 상태를 표시하는 테이블 컴포넌트
 * @param {Array} data - 테이블에 표시할 데이터
 * @returns {JSX.Element} RealTimeUsageTable 컴포넌트
 */
export default function RealTimeUsageTable({ data = [] }) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const columns = useMemo(() => TableHeader(t), [t]); // 테이블 헤더 정의

  const sanitizedData = Array.isArray(data) ? data : []; // 데이터 유효성 확인

  return (
    <div className="h-full w-full overflow-auto">
      <table className="w-full h-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100 sticky top-0 z-10">
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
          {sanitizedData.length > 0 ? (
            sanitizedData.map((row, rowIndex) => (
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
                  {/* 진행률 표시 */}
                  <ProgressBar data={row.processpercentage || 0} />
                </td>
              </tr>
            ))
          ) : (
            // 데이터가 없을 경우 메시지 표시
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-500 px-4 py-3"
              >
                {/* 원하는 메시지로 변경 가능 */}
                {t('RealTimeUsageTable.NoDataFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
