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

/**
 * UsageStatusTable 컴포넌트
 * @description 실행 상태 및 관련 정보를 테이블 형태로 표시
 * @param {Array} data - 테이블에 표시할 데이터
 * @returns {JSX.Element} UsageStatusTable 컴포넌트
 */
export default function UsageStatusTable({ data }) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const columns = useMemo(() => TableHeader(t), [t]); // 테이블 헤더 정의

  const sanitizedData = Array.isArray(data) ? data : []; // 데이터가 배열인지 확인 후 초기화

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
        <tbody className="bg-white">
          {sanitizedData.map((data) => {
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
                    style={{ fontSize: '16px' }}
                  >
                    {field === 'runstatus' ? (
                      <>
                        {statusIcons[normalizedStatus] || '❓'}{' '}
                        {normalizedStatus} {/* 상태 아이콘 및 텍스트 */}
                      </>
                    ) : (
                      data[field] || '-' // 데이터가 없을 경우 '-' 표시
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
