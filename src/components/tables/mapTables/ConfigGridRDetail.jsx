import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 테이블의 기본 컬럼 정의
 * @param {function} t - 번역 함수
 * @returns {Array} - 테이블 컬럼 배열
 */
const defaultColumns = (t) => [
  {
    // CFG 이름 열
    accessorKey: 'tccfg_name',
    header: t('ConfigGridR.CFG_name'),
  },
  {
    // 카테고리 열
    accessorKey: 'category',
    header: t('ConfigGridR.Category'),
  },
  {
    // 내용 (파일 이름) 열
    accessorKey: 'file_name',
    header: t('ConfigGridR.Contents'),
    cell: ({ getValue }) => {
      const fullText = getValue(); // 전체 텍스트
      const maxLength = 34; // 표시할 최대 문자 수
      const shortText =
        fullText.length > maxLength
          ? `${fullText.slice(0, maxLength)}...` // 길이 초과 시 말줄임표 추가
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

/**
 * ConfigGridRDetail 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.list - 테이블에 표시할 데이터 리스트
 * @param {function} props.onSelectionChange - 선택된 행 변경 시 호출되는 콜백 함수
 * @param {function} [props.onCellDoubleClick] - 셀 더블클릭 시 호출되는 콜백 함수
 * @returns {JSX.Element} - 구성된 테이블 컴포넌트
 */
const ConfigGridRDetail = ({ list, onSelectionChange, onCellDoubleClick }) => {
  const { t } = useTranslation(); // 번역 함수
  const columns = useMemo(() => defaultColumns(t), [t]); // 번역된 컬럼 정의
  const [data, setData] = useState([]); // 테이블 데이터 상태
  const [selectedRows, setSelectedRows] = useState([]); // 선택된 행 상태

  // 리스트 변경 시 테이블 데이터 갱신
  useEffect(() => {
    if (list && !isEmpty(list)) {
      setData(list);
    }
  }, [list]);

  // React Table 초기화
  const table = useReactTable({
    data, // 테이블 데이터
    columns, // 테이블 컬럼
    getCoreRowModel: getCoreRowModel(), // 기본 행 모델
  });

  // 선택된 행 상태 업데이트
  useEffect(() => {
    const currentSelectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    // 상태 변경 시 업데이트
    if (JSON.stringify(currentSelectedRows) !== JSON.stringify(selectedRows)) {
      setSelectedRows(currentSelectedRows);
      onSelectionChange(currentSelectedRows); // 부모 컴포넌트로 전달
    }
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  return (
    <div className="my-2 h-[400px] w-[450px] block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider"
                >
                  {/* 컬럼 헤더 렌더링 */}
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
              onDoubleClick={() =>
                onCellDoubleClick && onCellDoubleClick(row.original)
              }
              className="cursor-pointer hover:bg-gray-100"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 whitespace-nowrap text-center border-2 text-xs text-black"
                >
                  {/* 셀 데이터 렌더링 */}
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
