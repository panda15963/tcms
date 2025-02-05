import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * TableHeader
 * @description 테이블 헤더 정의 함수
 * @param {Function} t - 다국어 번역 함수
 * @returns {Array} 테이블 헤더 배열
 */
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: t('Configuration.ToolName') }, // 도구 이름
  { id: 3, name: t('Configuration.VersionName') }, // 버전 이름
  { id: 4, name: t('Configuration.ReceivedTime') }, // 수신 시간
  { id: 5, name: t('Configuration.Item') }, // 항목
  { id: 6, name: t('Configuration.PrevValue') }, // 이전 값
  { id: 7, name: t('Configuration.NewValue') }, // 새로운 값
];

/**
 * ConfigurationTable
 * @description 구성 데이터를 표시하는 테이블 컴포넌트
 * @param {Array} data - 테이블에 표시할 데이터
 * @returns {JSX.Element} ConfigurationTable 컴포넌트
 */
export default function ConfigurationTable({ data }) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const columns = useMemo(() => TableHeader(t), [t]); // 테이블 헤더 정의

  const sanitizedData = Array.isArray(data) ? data : []; // 데이터 유효성 확인

  return (
    <div className="h-full w-full overflow-auto">
      <table className="w-full h-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100 sticky -top-1">
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
            sanitizedData.map((row) => (
              <tr key={row.id}>
                {[
                  'PC',
                  'toolname',
                  'toolver',
                  'logtime',
                  'field',
                  'prevalue',
                  'newvalue',
                ].map((field) => (
                  <td
                    key={`${row.id}-${field}`}
                    className="px-4 py-3 w-[200px] h-[30px] border-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap"
                  >
                    {['prevalue', 'newvalue'].includes(field) &&
                    typeof row[field] === 'string' ? (
                      <div className="text-left">
                        {row[field]?.split('\r\n').map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    ) : (
                      row[field] ?? 'N/A'
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-3 text-center text-gray-500"
              >
                {t('Configuration.NoDataFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
