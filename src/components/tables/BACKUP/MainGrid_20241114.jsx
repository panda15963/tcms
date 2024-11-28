import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { isEmpty } from 'lodash';

import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

// 테이블의 기본 컬럼 정의

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
    accessorKey: 'upload_date', // 데이터를 가져올 키 (데이터의 속성 이름)

    header: () => (
      <div
        className="text-xs"
        style={{
          whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
        }}
      >
        {t('MainGrid.UploadedDate')}
      </div>
    ),

    cell: ({ getValue }) => {
      const fullDate = getValue(); // 2024-10-20 23:12:11 형식의 데이터

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
      const imagePath = row.original.imagePath;

      // 모디엠개발 : /testcourse/image/DESKTOP-6A267SH/20231214/HIP/20231124_083827_S_KOR_서울특별시_E_KOR_서울특별시.hip.png

      // 오토검증계 : /home/wasadmin/testcourse/image/DESKTOP-6A267SH/20231214/HIP/20231124_083827_S_KOR_서울특별시_E_KOR_서울특별시.hip.png

      const [showModal, setShowModal] = useState(false);

      // 현재 baseURL의 패턴을 보고 서버에 맞는 경로로 바꾸는 함수

      const adjustImagePath = (baseURL, imagePath) => {
        if (baseURL.includes('192.168.0.88')) {
          // 서버가 192.168.0.88인 경우

          return `/images${imagePath.replace('/testcourse/image', '')}`;
        } else if (baseURL.includes('10.5.35.121')) {
          // 서버가 10.5.35.121인 경우

          // return imagePath.replace('/home/wasadmin', '');

          return `/images${imagePath.replace(
            '/home/wasadmin/testcourse/image',
            ''
          )}`;
        }

        // 기본값 반환 (필요시 추가 설정 가능)

        return imagePath;
      };

      // 포트 번호(:8080)와 '/api' 제거

      const baseURL = process.env.REACT_APP_BASEURL.replace(
        /:(8080|8090)\/api/,

        ''
      );

      const adjustedImagePath = adjustImagePath(baseURL, imagePath);

      // console.log('adjustedImagePath', adjustedImagePath);

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

// MainGrid 컴포넌트 정의

const MainGrid = ({ list, onSelectionChange, onCellDoubleClick }) => {
  const { t } = useTranslation(); // Get the translation function

  const columns = useMemo(() => defaultColumns(t), [t]); // Use t in the memoized columns

  const [data, setData] = useState(list ?? defaultData);

  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    console.log('useEffect LIST ==>', list);

    if (list && !isEmpty(list.list)) {
      setData(list.list);
    }
  }, [list]);

  const table = useReactTable({
    data, // 테이블에 사용할 데이터

    columns, // 테이블에 사용할 컬럼

    getCoreRowModel: getCoreRowModel(), // 기본 행 모델을 가져오는 함수 사용

    state: {}, // 테이블의 상태
  });

  // 선택된 행의 데이터 추출

  // useEffect(() => {

  //   const selectedRows = table

  //     .getSelectedRowModel()

  //     .rows.map((row) => row.original);

  //   onSelectionChange(selectedRows);

  // }, [table.getSelectedRowModel().rows, onSelectionChange]);

  useEffect(() => {
    const currentSelectedRows = table

      .getSelectedRowModel()

      .rows.map((row) => row.original);

    // 선택된 행이 변경될 때만 상태 업데이트

    if (JSON.stringify(currentSelectedRows) !== JSON.stringify(selectedRows)) {
      setSelectedRows(currentSelectedRows);

      onSelectionChange(currentSelectedRows); // 부모 컴포넌트로 업데이트된 선택된 행 전달
    }
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  // 셀 클릭 이벤트 핸들러 (더블클릭 시 모달 열기)

  const handleCellDoubleClick = (rowData) => {
    console.log('Row double clicked:', rowData);

    if (onCellDoubleClick) {
      onCellDoubleClick(rowData); // 더블클릭 시 부모 컴포넌트로 데이터를 전달해 모달 열기
    }
  };

  return (
    // <div className="my-2 h-96 block overflow-x-auto">

    <div className="my-2 h-[400px] block overflow-x-auto">
      <table className="min-w-full  divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0 ">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider text-nowrap"
                >
                  {/* 헤더 렌더링 */}

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
    </div>
  );
};

export default MainGrid;
