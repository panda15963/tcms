import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isEmpty } from 'lodash';

const SpaceTableHeaderList = (t) => [
  {
    accessorKey: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  {
    // 업로드 된 날짜
    accessorKey: 'upload_date',
    header: t('SpaceTable.UploadDate'),
    cell: ({ getValue }) => {
      const fullDate = getValue(); // 2024-10-20 23:12:11 형식의 데이터
      const shortDate = fullDate.slice(0, 10); // YYYY-MM-DD 부분만 추출

      return (
        <span title={fullDate} className="cursor-pointer">
          {shortDate}
        </span>
      );
    },
  },
  {
    // 이름
    accessorKey: 'file_name',
    header: t('SpaceTable.Name'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 70; // 표시할 최대 문자 수
      const shortText =
        fullText.length > maxLength
          ? fullText.slice(0, maxLength) + '...'
          : fullText;

      return (
        <span title={fullText} className="cursor-pointer">
          {shortText}
        </span>
      );
    },
  },
  {
    // 버전
    accessorKey: 'version_id',
    header: t('SpaceTable.Version'),
  },
  {
    // 국가
    accessorKey: 'country_str',
    header: t('SpaceTable.Country'),
  },
  {
    // 로그 종류
    accessorKey: 'b_virtual',
    header: t('SpaceTable.LogType'),
    cell: ({ getValue }) => {
      const value = getValue();
      return value === 0 ? 'Virtual Log' : 'Real Log';
    },
  },
  {
    // 요약
    accessorKey: 'summary_str',
    header: t('SpaceTable.Summary'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 40; // 표시할 최대 문자 수
      const shortText =
        fullText.length > maxLength
          ? fullText.slice(0, maxLength) + '...'
          : fullText;

      return (
        <span title={fullText} className="cursor-pointer">
          {shortText}
        </span>
      );
    },
  },
  {
    accessorKey: 'map',
    header: t('Common.Map'),
    cell: ({ row }) => {
      const imagePath = row.original.imagePath;
      const [showModal, setShowModal] = useState(false);

      const adjustImagePath = (baseURL, imagePath) => {
        if (baseURL.includes('192.168.0.88')) {
          return `/images${imagePath.replace('/testcourse/image', '')}`;
        } else if (baseURL.includes('10.5.35.121')) {
          return `/images${imagePath.replace('/home/wasadmin/testcourse/image', '')}`;
        }
        return imagePath;
      };

      const baseURL = process.env.REACT_APP_BASEURL.replace(
        /:(8080|8090)\/api/,
        '',
      );

      const adjustedImagePath = adjustImagePath(baseURL, imagePath);

      return imagePath ? (
        <>
          <img
            src={`${baseURL}${adjustedImagePath}`}
            style={{ width: '100px', height: 'auto', cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          />
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4">
                <img
                  src={`${baseURL}${adjustedImagePath}`}
                  style={{ width: '900px', height: 'auto' }}
                />
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        'No Map Available'
      );
    },
  },
];

const defaultData = [
  {
    upload_date: '2023-12-25',
    file_name: 'HippoLog',
    version_id: '1',
    country_str: 'KOR',
    b_virtual: 0,
    summary_str: 'Real Log',
    map: '',
  },
  {
    upload_date: '2023-12-30',
    file_name: 'HippoLog1',
    version_id: '2',
    country_str: 'KOR',
    b_virtual: 1,
    summary_str: 'Real Log',
    map: '',
  },
];

const SpaceTable = ({ list, onSelectionChange }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(list ?? defaultData);
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = useMemo(() => SpaceTableHeaderList(t), [t]);

  useEffect(() => {
    console.log('useEffect LIST ==>', list);
    if (list && !isEmpty(list.list)) {
      setData(list.list);
    }
  }, [list]);

  const table = useReactTable({
    data: data ?? [], // Ensure data is always an array
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
  });

  useEffect(() => {
    const rows = table.getSelectedRowModel().rows;
    if (!rows || !Array.isArray(rows)) return;

    const currentSelectedRows = rows.map((row) => row.original);
    if (JSON.stringify(currentSelectedRows) !== JSON.stringify(selectedRows)) {
      setSelectedRows(currentSelectedRows);
      onSelectionChange(currentSelectedRows);
    }
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  return (
    <div
      className="overflow-auto text-center"
      style={{ maxHeight: '500px' }} // Set a maximum height to make the table scrollable
    >
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-100">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-sm font-bold text-black uppercase tracking-wider"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {table.getRowModel().rows.length === 0 ? (
            // If there are no rows, display the "No Results" message
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-gray-900"
              >
                {t('SpaceTable.NoResults')}
              </td>
            </tr>
          ) : (
            // If there are rows, render them as usual
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={row.getIsSelected() ? 'bg-gray-100' : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 whitespace-nowrap text-center border-2 text-sm text-black"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SpaceTable;
