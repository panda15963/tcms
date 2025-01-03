import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// 상태에 따른 아이콘 매핑
const statusIcons = {
  Idle: '🟡', // 대기 상태
  Running: '🟢', // 실행 중
  'Not Responded': '🔴', // 응답 없음
  Completed: '🟢', // 완료
};

// 테이블 헤더 정의 함수
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: t('UsageInformation.ToolName') }, // 도구 이름
  { id: 3, name: t('UsageInformation.VersionName') }, // 버전 이름
  { id: 4, name: t('UsageInformation.StartTestingTime') }, // 테스트 시작 시간
  { id: 5, name: t('UsageInformation.ExecutedTime') }, // 실행 시간
  { id: 6, name: t('UsageInformation.OperationStatus') }, // 운영 상태
  { id: 7, name: t('UsageInformation.Details') }, // 상세 정보
];

// 실행 상태 포맷 함수
const formatRunStatus = (status) => {
  if (status.toLowerCase() === 'not responded') {
    return status
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export default function UsageStatusTable({ data }) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const columns = useMemo(() => TableHeader(t), [t]); // 테이블 헤더 정의

  const sanitizedData = Array.isArray(data) ? data : []; // 데이터가 배열인지 확인 후 초기화

  return (
    <div className="h-full w-full overflow-auto">
      <div className="w-full h-[500px] overflow-y-auto">
        <table
          className="w-full table-auto border-separate border-spacing-0"
          style={{ borderCollapse: 'separate' }}
        >
          {/* Table Header */}
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {columns.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 border-l border-r border-t  border-gray-300 text-center text-sm font-semibold text-black uppercase tracking-wider whitespace-nowrap bg-gray-100 shadow-sm"
                  style={{ boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.1)' }}
                >
                  {header.name}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white -z-50">
            {sanitizedData.length > 0 ? (
              sanitizedData.map((data) => {
                const normalizedStatus = formatRunStatus(data.runstatus.trim());
                return (
                  <tr key={data.id}>
                    {[
                      'PC',
                      'toolname',
                      'toolver',
                      'starttime',
                      'runtime',
                      'runstatus',
                      'runmessage',
                    ].map((field) => (
                      <td
                        key={`${data.id}-${field}`}
                        className="border border-gray-300 px-6 py-4 text-lg text-gray-700 text-center"
                      >
                        {field === 'runstatus' ? (
                          <>
                            {statusIcons[normalizedStatus] || '❓'}{' '}
                            {normalizedStatus}
                          </>
                        ) : (
                          data[field] || '-'
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-gray-500 px-6 py-4"
                >
                  {/* 원하는 메시지로 변경 가능 */}
                  {t('UsageStatusTable.NoDataFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
