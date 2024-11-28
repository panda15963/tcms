import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Table headers
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: t('Logs.ToolName') },
  { id: 3, name: t('Logs.VersionName') },
  { id: 4, name: t('Logs.LogReceivedTime') },
  { id: 5, name: t('Logs.LogLevel') },
  { id: 6, name: t('Logs.LogDetail') },
];

// Component Definition
export default function LogTable({ data }) {
  const { t } = useTranslation();
  const columns = useMemo(() => TableHeader(t), [t]);
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
          {sanitizedData.map((data) => (
            <tr key={data.id}>
              {[
                'pcname',
                'toolname',
                'toolver',
                'exectime',
                'loglevel',
                'logdetail',
              ].map((field) => (
                <td
                  key={`${data.id}-${field}`}
                  className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap"
                  style={{ width: '200px', height: '30px' }}
                >
                  {data[field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
