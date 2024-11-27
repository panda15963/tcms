import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Table headers
const TableHeader = (t) => [
  { id: 1, name: 'PC' },
  { id: 2, name: t('Configuration.ToolName') },
  { id: 3, name: t('Configuration.VersionName') },
  { id: 4, name: t('Configuration.ReceivedTime') },
  { id: 5, name: t('Configuration.Item') },
  { id: 6, name: t('Configuration.PrevValue') },
  { id: 7, name: t('Configuration.NewValue') },
];

// Component Definition
export default function ConfigurationTable({ data }) {
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
                  className="px-4 py-3 border-2 text-center text-sm font-medium text-gray-700 tracking-wide whitespace-nowrap"
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
