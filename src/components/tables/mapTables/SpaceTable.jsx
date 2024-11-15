import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

// 테이블의 기본 컬럼 정의
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
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-4 max-w-full max-h-full overflow-auto">
                <img
                  src={`${baseURL}${adjustedImagePath}`}
                  style={{
                    maxWidth: '55vw', // 화면 너비의 90%로 제한
                    maxHeight: '55vh', // 화면 높이의 90%로 제한
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

const ITEMS_PER_PAGE = 5; // 한 번에 로드할 아이템 개수

const SpaceTable = ({ list, onSelectionChange }) => {
  const { t } = useTranslation();
  const [displayedData, setDisplayedData] = useState([]); // 화면에 표시할 데이터
  const [page, setPage] = useState(1); // 현재 페이지 번호
  const columns = useMemo(() => SpaceTableHeaderList(t), [t]);

  // list.list가 배열인지 확인하고, 아니면 빈 배열로 초기화
  const validList = Array.isArray(list.list) ? list.list : [];

  // 초기 및 리스트 변경 시 데이터를 설정하는 useEffect
  useEffect(() => {
    if (validList.length > 0) {
      setDisplayedData(validList.slice(0, ITEMS_PER_PAGE)); // 초기 데이터만 설정
      setPage(1); // 페이지를 초기화
    } else if (displayedData.length > 0) {
      setDisplayedData([]); // 리스트가 없으면 빈 배열 설정
    }
  }, [validList]);

  // 페이지 변경 시 더 많은 데이터를 로드하여 기존 데이터에 추가
  useEffect(() => {
    if (page > 1) {
      const newItems = validList.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
      );
      setDisplayedData((prevDisplayedData) => [
        ...prevDisplayedData,
        ...newItems,
      ]);
    }
  }, [page, validList]);

  // 더 많은 항목 보기 버튼 핸들러
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const table = useReactTable({
    data: displayedData, // 보여줄 데이터만 전달
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    const rows = table.getSelectedRowModel().rows;
    const currentSelectedRows = rows.map((row) => row.original);
    onSelectionChange(currentSelectedRows);
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  return (
    <div className="overflow-auto text-center" style={{ maxHeight: '500px' }}>
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
                        header.getContext(),
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
        <button
          onClick={handleLoadMore}
          className="mt-1 px-2 py-1 bg-blue-500 text-white rounded "
        >
          {t('SpaceTable.LoadMore')}
        </button>
      )}
    </div>
  );
};

export default SpaceTable;
