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
    <div className="h-full w-full overflow-auto">
      <table className="w-full h-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((header) => (
              <th
                key={header.id}
                className="border border-gray-300 px-6 py-4 text-lg font-semibold text-black text-center uppercase tracking-wide"
                style={{ fontSize: '18px' }}
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
