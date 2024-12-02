import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// 테이블 헤더 정의
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: t('Configuration.ToolName') }, // 도구 이름
  { id: 3, name: t('Configuration.VersionName') }, // 버전 이름
  { id: 4, name: t('Configuration.ReceivedTime') }, // 수신 시간
  { id: 5, name: t('Configuration.Item') }, // 항목
  { id: 6, name: t('Configuration.PrevValue') }, // 이전 값
  { id: 7, name: t('Configuration.NewValue') }, // 새로운 값
];

// 컴포넌트 정의
export default function ConfigurationTable({ data }) {
  const { t } = useTranslation();
  const columns = useMemo(() => TableHeader(t), [t]);
  const sanitizedData = Array.isArray(data) ? data : []; // 데이터가 항상 배열인지 확인

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
          {sanitizedData.map((data) => (
            <tr key={data.id}>
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
                  key={`${data.id}-${field}`}
                  className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap"
                  style={{ width: '200px', height: '30px' }}
                >
                  {data[field] || '-'} {/* 데이터가 없을 경우 '-' 표시 */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
