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
        checked={row.getIsSelected()} // 체크박스 상태 유지
        onChange={row.getToggleSelectedHandler()} // 체크박스 클릭 시 선택 상태 변경
      />
    ),
  },
  {
    accessorKey: 'modif_date', // 데이터를 가져올 키 (데이터의 속성 이름)
    header: t('ConfigGridL.UploadedDate'), // 컬럼 헤더에 표시될 텍스트?
  },
  {
    accessorKey: 'tccfg_name',
    header: t('ConfigGridL.CFG_name'),
  },
  {
    accessorKey: 'description',
    header: t('ConfigGridL.Description'),
  },
  {
    accessorKey: 'taglist',
    header: t('ConfigGridL.Tag'),
  },
  {
    accessorKey: 'ver_id',
    header: t('ConfigGridL.Version'),
  },
  {
    accessorKey: 'modif_type',
    header: t('ConfigGridL.ModificationType'),
  },
  {
    accessorKey: 'modif_comment',
    header: t('ConfigGridL.ModificationComment'),
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

// ConfigGridL2 컴포넌트 정의
const ConfigGridL2 = ({ list, onSelectionChange, onCellDoubleClick }) => {
  const { t } = useTranslation(); // Get the translation function
  const columns = useMemo(() => defaultColumns(t), [t]); // Use t in the memoized columns

  const [data, setData] = useState(list ?? defaultData);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    // console.log('useEffect LIST ==>', list);
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

  // 셀 클릭 이벤트 핸들러 (셀 클릭 시 선택 상태는 변경하지 않음)
  const handleCellClick = (rowData) => {
    console.log('Row clicked:', rowData); // 클릭된 행의 데이터
    onSelectionChange([rowData]); // 셀 클릭 시 해당 데이터를 우측에 조회하도록 부모 컴포넌트로 전달
  };

  // 셀 클릭 이벤트 핸들러 (더블클릭 시 모달 열기)
  const handleCellDoubleClick = (rowData) => {
    console.log('Row double clicked:', rowData);
    if (onCellDoubleClick) {
      onCellDoubleClick(rowData); // 더블클릭 시 부모 컴포넌트로 데이터를 전달해 모달 열기
    }
  };

  return (
    // <div className="my-2 h-96 block overflow-x-auto">
    <div className="my-2 h-[400px] w-[590px] block overflow-x-auto">
      <table className="min-w-full  divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0 ">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-sm font-bold text-black uppercase tracking-wider"
                >
                  {/* 헤더 렌더링 */}
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header, // 컬럼 헤더 렌더링
                        header.getContext(), // 헤더의 컨텍스트
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
              onClick={() => handleCellClick(row.original)} // 셀 클릭 시 데이터를 처리하고 선택 상태는 변경하지 않음
              onDoubleClick={() => handleCellDoubleClick(row.original)} // 셀 더블클릭 이벤트 추가
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 whitespace-nowrap text-center border-2 text-sm text-black"
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

export default ConfigGridL2;
