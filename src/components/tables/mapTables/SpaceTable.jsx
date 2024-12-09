import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

/**
 * SpaceTableHeaderList
 * @description 테이블의 기본 컬럼 정의
 * @param {Function} t - 다국어 번역 함수
 * @returns {Array} 테이블 컬럼 배열
 */
const SpaceTableHeaderList = (t) => [
  {
    accessorKey: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()} // 전체 행 선택 여부
        onChange={table.getToggleAllRowsSelectedHandler()} // 전체 선택 토글 핸들러
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()} // 특정 행 선택 여부
        onChange={row.getToggleSelectedHandler()} // 특정 행 선택 토글 핸들러
      />
    ),
  },
  {
    accessorKey: 'upload_date',
    header: ({ column }) => {
      const isSorted = column.getIsSorted(); // 정렬 상태 확인
      return (
        <div className="flex items-center justify-center text-xs">
          <span>{t('SpaceTable.UploadDate')}</span>
          <button
            className="ml-1 text-gray-500"
            onClick={column.getToggleSortingHandler()} // 정렬 토글 핸들러
          >
            {isSorted === 'asc' ? '▲' : isSorted === 'desc' ? '▼' : '⇅'}
          </button>
        </div>
      );
    },
    cell: ({ getValue }) => {
      const fullDate = getValue(); // 전체 날짜
      const shortDate = fullDate.slice(0, 10); // YYYY-MM-DD 형식
      return (
        <span title={fullDate} className="cursor-pointer text-xs">
          {shortDate}
        </span>
      );
    },
  },
  // 파일 이름 컬럼
  {
    accessorKey: 'file_name',
    header: t('SpaceTable.Name'),
    cell: ({ getValue }) => {
      const fullText = getValue(); // 전체 텍스트
      const maxLength = 70; // 최대 표시 길이
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
    accessorKey: 'version_id',
    header: t('SpaceTable.Version'),
  },
  {
    accessorKey: 'country_str',
    header: t('SpaceTable.Country'),
  },
  // 로그 종류
  {
    accessorKey: 'b_virtual',
    header: t('SpaceTable.LogType'),
    cell: ({ getValue }) => (getValue() === 0 ? 'Virtual Log' : 'Real Log'),
  },
  {
    accessorKey: 'summary_str',
    header: t('SpaceTable.Summary'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 40;
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
          return `/images${imagePath.replace(
            '/home/wasadmin/testcourse/image',
            ''
          )}`;
        }
        return imagePath;
      };

      const baseURL = process.env.REACT_APP_MAPBASEURL.replace(
        /:(8080|8090)\/api/,
        ''
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
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-4 max-w-full max-h-full overflow-auto">
                <img
                  src={`${baseURL}${adjustedImagePath}`}
                  style={{
                    maxWidth: '55vw',
                    maxHeight: '55vh',
                    width: 'auto',
                    height: 'auto',
                  }}
                />
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
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

const ITEMS_PER_PAGE = 20;

/**
 * SpaceTable 컴포넌트
 * @description 페이지 네이션과 정렬을 지원하는 테이블 컴포넌트
 * @param {Object} list - 데이터 리스트
 * @param {Function} onSelectionChange - 선택된 데이터 변경 핸들러
 * @returns {JSX.Element} SpaceTable 컴포넌트
 */
const SpaceTable = ({ list, onSelectionChange }) => {
  const { t } = useTranslation();
  const [displayedData, setDisplayedData] = useState([]);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState([]);
  const columns = useMemo(() => SpaceTableHeaderList(t), [t]);

  const validList = Array.isArray(list.list) ? list.list : [];

  useEffect(() => {
    if (validList.length > 0) {
      setDisplayedData(validList.slice(0, ITEMS_PER_PAGE));
      setPage(1);
    } else if (displayedData.length > 0) {
      setDisplayedData([]);
    }
  }, [validList]);

  useEffect(() => {
    if (page > 1) {
      const newItems = validList.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      setDisplayedData((prev) => [...prev, ...newItems]);
    }
  }, [page, validList]);

  const handleLoadMore = () => setPage((prev) => prev + 1);

  const table = useReactTable({
    data: displayedData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    const rows = table.getSelectedRowModel().rows;
    const currentSelectedRows = rows.map((row) => row.original);
    onSelectionChange(currentSelectedRows);
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  return (
    <div className="overflow-auto h-[400px]" style={{ maxHeight: '500px' }}>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-100">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={row.getIsSelected() ? 'bg-gray-100' : ''}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 whitespace-nowrap text-center border-2 text-xs text-black"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 더 많은 항목 보기 버튼 */}
      {displayedData.length < validList.length && (
        <div className="flex justify-center mt-1">
          <button
            onClick={handleLoadMore}
            className="mt-1 px-2 py-1 bg-blue-900 text-white rounded"
          >
            {t('SpaceTable.LoadMore')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SpaceTable;
