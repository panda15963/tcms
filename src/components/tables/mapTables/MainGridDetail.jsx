import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * defaultColumns
 * @description 테이블 컬럼 정의 함수
 * @param {Function} t - 다국어 번역 함수
 * @returns {Array} 테이블 컬럼 배열
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
      const isSorted = column.getIsSorted();
      return (
        <div
          className="flex items-center justify-center text-xs"
          style={{ whiteSpace: 'nowrap' }} // 텍스트 줄바꿈 방지
        >
          <span>{t('MainGrid.UploadedDate')}</span>
          <button
            className="ml-1 text-gray-500"
            onClick={column.getToggleSortingHandler()}
          >
            {isSorted === 'asc' ? '▲' : isSorted === 'desc' ? '▼' : '⇅'}
          </button>
        </div>
      );
    },
    cell: ({ getValue }) => {
      const fullDate = getValue();
      const shortDate = fullDate.slice(0, 10);
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
    cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
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
    cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
  },
  {
    accessorKey: 'map',
    header: t('Common.Map'),
    cell: ({ row }) => {
      // 모디엠개발 : /testcourse/image/DESKTOP-6A267SH/20231214/HIP/20231124_083827_S_KOR_서울특별시_E_KOR_서울특별시.hip.png
      // 오토검증계 : /home/wasadmin/testcourse/image/DESKTOP-6A267SH/20231214/HIP/20231124_083827_S_KOR_서울특별시_E_KOR_서울특별시.hip.png

      const imagePath = row.original.imagePath;
      const [showModal, setShowModal] = useState(false);
      // 이미지 경로 조정 함수
      const adjustImagePath = (serverKey, imagePath) => {
        console.log('serverKey ==>', serverKey);
        console.log('imagePath ==>', imagePath);

        if (serverKey === 'localserver' || serverKey === 'developserver') {
          // server1에 해당하는 경로 처리
          return `/images${imagePath.replace('/testcourse/image', '')}`;
        } else if (
          serverKey === 'stageserver' ||
          serverKey === 'productionserver'
        ) {
          // server2에 해당하는 경로 처리
          return `/images${imagePath.replace(
            '/home/wasadmin/testcourse/image',
            ''
          )}`;
        }
        return imagePath; // 기본값 반환
      };

      const serverKey = process.env.REACT_APP_SERVER_KEY; // 서버 키 가져오기
      const baseURL = process.env.REACT_APP_MAPBASEURL.replace(
        /:(8080|8090)\/api/, // 포트와 API 경로 제거
        ''
      );

      const adjustedImagePath = adjustImagePath(serverKey, imagePath);

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

// 기본 데이터 (테이블에 표시될 데이터)
const defaultData = [
  {
    upload_date: '2023-12-25',
    name: 'HippoLog',
    version: '1',
    country: 'KOR',
    logType: 'None',
    summary: 'Real Log',
    map: '',
  },
  {
    upload_date: '2023-12-30',
    name: 'HippoLog1',
    version: '2',
    country: 'KOR',
    logType: 'None',
    summary: 'Real Log',
    map: '',
  },
];

/**
 * MainGridDetail
 * @description 테이블 데이터를 렌더링하는 컴포넌트
 * @param {Array} list - 테이블 데이터
 * @param {Function} onSelectionChange - 선택된 행 전달 콜백
 * @param {Function} onCellDoubleClick - 셀 더블클릭 핸들러
 * @returns {JSX.Element} MainGridDetail 컴포넌트
 */
const MainGridDetail = ({ list, onSelectionChange, onCellDoubleClick }) => {
  const { t } = useTranslation();
  const columns = useMemo(() => defaultColumns(t), [t]);
  const [data, setData] = useState(list?.list ?? []);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    if (list?.list && !isEmpty(list.list)) {
      setData(list.list);
    }
  }, [list]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    const currentSelectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (JSON.stringify(currentSelectedRows) !== JSON.stringify(selectedRows)) {
      setSelectedRows(currentSelectedRows);
      onSelectionChange(currentSelectedRows);
    }
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  const handleCellDoubleClick = (rowData) => {
    if (onCellDoubleClick) {
      onCellDoubleClick(rowData);
    }
  };

  return (
    <div className="my-2 h-[400px] block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider"
                >
                  {/* 헤더 렌더링 */}
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
              onDoubleClick={() => handleCellDoubleClick(row.original)}
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
    </div>
  );
};

export default MainGridDetail;
