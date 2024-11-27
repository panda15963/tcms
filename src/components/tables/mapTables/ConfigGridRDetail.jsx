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
    // CFG 이름
    accessorKey: 'tccfg_name',
    header: t('ConfigGridR.CFG_name'),
  },
  {
    accessorKey: 'category',
    header: t('ConfigGridR.Category'),
  },
  {
    accessorKey: 'file_name',
    header: t('ConfigGridR.Contents'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 34; // 표시할 최대 문자 수
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

// ConfigGridRDetail 컴포넌트 정의
const ConfigGridRDetail = ({ list, onSelectionChange, onCellDoubleClick }) => {
  const { t } = useTranslation(); // Get the translation function
  const columns = useMemo(() => defaultColumns(t), [t]); // Use t in the memoized columns

  const [data, setData] = useState(list ?? defaultData);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    console.log('RD useEffect LIST ==>', list);
    if (list && !isEmpty(list)) {
      setData(list);
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

  return (
    // <div className="my-2 h-96 block overflow-x-auto">
    <div
      className="my-2 h-[400px] w-[450px] block overflow-x-auto"
      style={{ marginLeft: '0px' }}
    >
      <table className="min-w-full  divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0 ">
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
            <tr key={row.id}>
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

export default ConfigGridRDetail;
