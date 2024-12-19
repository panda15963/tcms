import { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

/**
 * SpaceTableHeaderList
 * @description 테이블의 기본 컬럼 정의 (헤더 및 셀 렌더링 로직)
 * @param {Function} t - 다국어 번역 함수
 * @returns {Array} 테이블 컬럼 배열
 */
const SpaceTableHeaderList = (t) => [
  {
    accessorKey: 'select', // 체크박스 선택 열
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
    accessorKey: 'upload_date', // 업로드 날짜 열
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
  {
    accessorKey: 'file_name', // 파일 이름 열
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
    accessorKey: 'version_id', // 버전 ID 열
    header: t('SpaceTable.Version'),
  },
  {
    accessorKey: 'country_str', // 국가 열
    header: t('SpaceTable.Country'),
  },
  {
    accessorKey: 'b_virtual', // 로그 종류 열
    header: t('SpaceTable.LogType'),
    cell: ({ getValue }) => (getValue() === 0 ? 'Virtual Log' : 'Real Log'),
  },
  {
    accessorKey: 'summary_str', // 요약 열
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
    accessorKey: 'map', // 지도 열
    header: t('Common.Map'),
    cell: ({ row }) => {
      const imagePath = row.original.imagePath; // 이미지 경로
      const [showModal, setShowModal] = useState(false); // 이미지 확대 모달 상태

      // 이미지 경로 조정 함수
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
        /:(8080|8090)\/api/, // 포트와 API 경로 제거
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

const ITEMS_PER_PAGE = 20; // 페이지당 아이템 수

/**
 * SpaceTable 컴포넌트
 * @description 페이지네이션과 정렬을 지원하는 테이블
 * @param {Object} list - 데이터 리스트
 * @param {Function} onSelectionChange - 선택된 데이터 변경 핸들러
 * @returns {JSX.Element} SpaceTable 컴포넌트
 */
const SpaceTable = ({ list, onSelectionChange }) => {
  const { t } = useTranslation();
  const [displayedData, setDisplayedData] = useState([]); // 표시할 데이터
  const [page, setPage] = useState(1); // 현재 페이지
  const [sorting, setSorting] = useState([]); // 정렬 상태
  const [rowSelection, setRowSelection] = useState({}); // 선택된 행 상태
  const columns = useMemo(() => SpaceTableHeaderList(t), [t]); // 컬럼 정의

  const validList = Array.isArray(list.list) ? list.list : [];

  // 리스트 변경 시 상태 초기화
  useEffect(() => {
    // 초기 데이터를 validList에서 가져와 ITEMS_PER_PAGE 만큼 슬라이스합니다.
    const initialData = validList.slice(0, ITEMS_PER_PAGE);

    // `validList`가 의미 있는 변경이 발생했는지 확인합니다.
    // 이를 위해 ref를 사용하여 이전 상태와 비교합니다.
    if (
      validListRef.current !== JSON.stringify(validList) || // validList가 이전과 달라졌는지 확인
      displayedData.length !== initialData.length || // 현재 표시 데이터의 길이가 초기 데이터와 다른지 확인
      JSON.stringify(displayedData) !== JSON.stringify(initialData) // 현재 표시 데이터가 초기 데이터와 다른지 확인
    ) {
      validListRef.current = JSON.stringify(validList); // ref를 최신 validList로 업데이트
      setDisplayedData(initialData); // 표시 데이터를 초기 데이터로 업데이트
      setRowSelection({}); // 행 선택을 초기화
      setPage(1); // 페이지를 첫 페이지로 초기화
    }
  }, [validList]); // validList가 변경될 때마다 이 useEffect가 실행됩니다.

  const validListRef = useRef(JSON.stringify(validList));

  // 페이지네이션 핸들링
  useEffect(() => {
    if (page > 1) {
      const newItems = validList.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      setDisplayedData((prev) => [...prev, ...newItems]);
    }
  }, [page, validList]);

  const handleLoadMore = () => setPage((prev) => prev + 1); // 더보기 버튼 핸들러

  const table = useReactTable({
    data: displayedData,
    columns,
    state: {
      sorting,
      rowSelection, // 선택된 행 상태 전달
    },
    onSortingChange: setSorting, // 정렬 상태 업데이트
    onRowSelectionChange: setRowSelection, // 선택된 행 상태 업데이트
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // 선택된 행이 변경될 때 콜백 실행
  useEffect(() => {
    const rows = table.getSelectedRowModel().rows;
    const currentSelectedRows = rows.map((row) => row.original);
    onSelectionChange(currentSelectedRows);
  }, [rowSelection, onSelectionChange]);

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

      {/* 더보기 버튼 */}
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
