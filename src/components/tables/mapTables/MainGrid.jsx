import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 기본 컬럼 정의
 */
const defaultColumns = (t) => [
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
    accessorKey: 'upload_date',
    header: ({ column }) => {
      const isSorted = column.getIsSorted(); // 정렬 상태 확인 (false, 'asc', 'desc')
      return (
        <div className="flex items-center justify-center text-xs whitespace-nowrap">
          <span>{t('MainGrid.UploadedDate')}</span>
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
      const fullDate = getValue();
      const shortDate = fullDate.slice(0, 10); // YYYY-MM-DD 부분만 추출
      return (
        <span title={fullDate} className="cursor-pointer text-xs">
          {shortDate}
        </span>
      );
    },
  },
  {
    accessorKey: 'log_name',
    header: t('MainGrid.Name'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 30; // 표시할 최대 문자 수
      const shortText =
        fullText.length > maxLength
          ? fullText.slice(0, maxLength) + '...'
          : fullText;
      return (
        <span title={fullText} className="cursor-pointer text-xs">
          {shortText}
        </span>
      );
    },
  },
  {
    accessorKey: 'version_id',
    header: t('MainGrid.Version'),
    cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
  },
  {
    accessorKey: 'country_str',
    header: t('MainGrid.Country'),
    cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
  },
  {
    accessorKey: 'b_virtual',
    header: t('MainGrid.LogType'),
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className="text-xs">
          {value === 0 ? 'Virtual Log' : 'Real Log'}
        </span>
      );
    },
  },
  {
    accessorKey: 'summary_str',
    header: t('MainGrid.Summary'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 40; // 표시할 최대 문자 수
      const shortText =
        fullText.length > maxLength
          ? fullText.slice(0, maxLength) + '...'
          : fullText;
      return (
        <span title={fullText} className="cursor-pointer text-xs">
          {shortText}
        </span>
      );
    },
  },
  {
    accessorKey: 'map',
    header: t('Common.Map'),
    cell: ({ row }) => {
      // 모디엠개발 : /testcourse/image/DESKTOP-6A267SH/20231214/HIP/20231124_083827_S_KOR_서울특별시_E_KOR_서울특별시.hip.png
      // 오토검증계 : /home/wasadmin/testcourse/image/DESKTOP-6A267SH/20231214/HIP/20231124_083827_S_KOR_서울특별시_E_KOR_서울특별시.hip.png
      const imagePath = row.original.imagePath;
      const [showModal, setShowModal] = useState(false);
      // 현재 baseURL의 패턴을 보고 서버에 맞는 경로로 바꾸는 함수

      // 이미지 경로 조정 함수
      const adjustImagePath = (serverKey, imagePath) => {
        console.log('serverKey ==>', serverKey);
        console.log('imagePath ==>', imagePath);

        if (serverKey === 'localserver' || serverKey === 'developserver') {
          // server1에 해당하는 경로 처리
          return `/images${imagePath.replace('/image', '')}`;
        } else if (
          serverKey === 'stageserver' ||
          serverKey === 'productionserver'
        ) {
          // server2에 해당하는 경로 처리
          return `/images${imagePath.replace('/image', '')}`;
        }
        return imagePath; // 기본값 반환
      };

      const serverKey = process.env.REACT_APP_SERVER_KEY; // 서버 키 가져오기
      // 포트 번호(:8080)와 '/api' 제거
      const baseURL = process.env.REACT_APP_MAPBASEURL.replace(
        /:(8080|8090)\/api/, // 포트와 API 경로 제거
        ''
      );

      const adjustedImagePath = adjustImagePath(serverKey, imagePath);

      console.log('[MainGrid]baseURL ==>', baseURL);
      console.log('[MainGrid]adjustedImagePath ==>', adjustedImagePath);

      return imagePath ? (
        <>
          <img
            src={`${baseURL}${adjustedImagePath}`}
            className="w-[100px] h-auto cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-4 max-w-full max-h-full overflow-auto">
                <img
                  src={`${baseURL}${adjustedImagePath}`}
                  className="max-w-[55vw] max-h-[55vh] w-auto h-auto"
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

const ITEMS_PER_PAGE = 20; // 한 번에 로드할 아이템 개수

/**
 * 로그 검색 모달
 * 경로탭 메인 그리드
 */
const MainGrid = ({ list, onSelectionChange, onCellDoubleClick }) => {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = useMemo(() => defaultColumns(t), [t]);

  const validList = useMemo(
    () => (Array.isArray(list?.list) ? list.list : []),
    [list]
  );

  /**
   * 현재 페이지에 표시할 데이터
   */
  const displayedData = useMemo(() => {
    return validList.slice(0, page * ITEMS_PER_PAGE);
  }, [page, validList]);

  const table = useReactTable({
    data: displayedData, // 페이징된 데이터
    columns,
    state: {
      sorting, // 정렬 상태를 추가
    },
    onSortingChange: setSorting, // 정렬 상태 변경 핸들러
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // 정렬된 데이터 모델
  });

  /**
   * 선택된 행 상태 관리
   */
  useEffect(() => {
    const currentSelectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    // 이전 선택 상태와 비교
    if (JSON.stringify(currentSelectedRows) !== JSON.stringify(selectedRows)) {
      setSelectedRows(currentSelectedRows);
      onSelectionChange(currentSelectedRows); // 부모 컴포넌트로 선택된 행 전달
    }
  }, [table.getSelectedRowModel().rows, onSelectionChange, selectedRows]);

  /**
   * 셀 클릭 이벤트 핸들러
   * 더블클릭 시 모달창 오픈
   */
  const handleCellDoubleClick = (rowData) => {
    console.log('Row double clicked:', rowData);
    if (onCellDoubleClick) {
      onCellDoubleClick(rowData); // 더블클릭 시 부모 컴포넌트로 데이터를 전달해 모달 열기
    }
  };

  /**
   * 더 많은 항목 보기 버튼 핸들러
   */
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    // 데이터가 변경되면 체크된 상태 초기화
    setSelectedRows([]);
    table.resetRowSelection(); // 선택된 행 상태 초기화
  }, [list]); // list가 변경될 때 실행

  return (
    // <div className="my-2 h-96 block overflow-x-auto">
    <div className="my-2 h-[400px] block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {/* 헤더 렌더링 */}
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider text-nowrap"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header, // 컬럼 헤더 렌더링

                        header.getContext() // 헤더의 컨텍스트
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
              onDoubleClick={() => handleCellDoubleClick(row.original)} // 셀 더블클릭 이벤트 추가
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 whitespace-nowrap text-center border-2 text-xs text-black"
                >
                  {/* 셀 렌더링 */}
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
            // className="px-4 py-1 bg-blue-500 text-white rounded shadow-lg"
            className="mt-1 px-2 py-1 bg-blue-900 text-white rounded"
          >
            {/* 더 많은 항목 보기 */}
            {t('MainGrid.LoadMore')}
          </button>
        </div>
      )}
    </div>
  );
};

export default MainGrid;
