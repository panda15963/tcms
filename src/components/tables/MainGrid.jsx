import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

// 테이블의 기본 컬럼 정의
const defaultColumns = [
  {
    accessorKey: 'upload_date', // 데이터를 가져올 키 (데이터의 속성 이름)
    header: 'Uploaded date', // 컬럼 헤더에 표시될 텍스트
  },
  {
    accessorKey: 'log_name',
    header: 'Name',
  },
  {
    accessorKey: 'version_id',
    header: 'Version',
  },
  {
    accessorKey: 'country_str',
    header: 'Country',
  },
  {
    accessorKey: 'b_virtual',
    header: 'Log Type',
    cell: ({ getValue }) => {
      const value = getValue();
      return value === 0 ? 'Virtual Log' : 'Real Log';
    },
  },
  {
    accessorKey: 'summary_str',
    header: 'Summary',
  },
  {
    accessorKey: 'map',
    header: 'Map',
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
const MainGrid = ({ list }) => {
  const columns = useMemo(() => defaultColumns, []);
  const [data, setData] = useState(list ?? initialData);

  useEffect(() => {
    console.log('useEffect LIST ==>', list);
    if (list && !isEmpty(list.list)) {
      // console.log('SETTING LIST ==>', list);
      setData(list.list);
    }
  }, [list]);

  const table = useReactTable({
    data, // 테이블에 사용할 데이터
    columns, // 테이블에 사용할 컬럼
    getCoreRowModel: getCoreRowModel(), // 기본 행 모델을 가져오는 함수 사용
    state: {}, // 테이블의 상태
  });

  return (
    <div className="my-2 h-96 block overflow-x-auto">
      <table className="min-w-full  divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0 ">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 border-2 text-center text-sm font-bold text-black uppercase tracking-wider"
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-center border-2 text-sm text-black"
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
