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
  { id: 2, name: t('UsageInformation.ToolName') },
  { id: 3, name: t('UsageInformation.VersionName') },
  { id: 4, name: t('UsageInformation.StartTestingTime') },
  { id: 5, name: t('UsageInformation.ExecutedTime') },
  { id: 6, name: t('UsageInformation.OperationStatus') },
  { id: 7, name: t('UsageInformation.Details') },
];

// Helper function to format runstatus values
const formatRunStatus = (status) => {
  if (status.toLowerCase() === 'not responded') {
    return status
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Component Definition
export default function UsageStatusTable({ data }) {
  const { t } = useTranslation();
  const columns = useMemo(() => TableHeader(t), [t]);

  const sanitizedData = Array.isArray(data) ? data : [];

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
                    className={`px-6 py-4 border-2 ${
                      field === 'runstatus' ? 'text-left' : 'text-center'
                    } text-base font-medium text-gray-700 tracking-wide whitespace-nowrap`}
                  >
                    {field === 'runstatus' ? (
                      <>
                        {statusIcons[normalizedStatus] || '❓'}{' '}
                        {normalizedStatus}
                      </>
                    ) : (
                      data[field]
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
