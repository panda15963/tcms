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
    // CFG 이름 컬럼
    accessorKey: 'tccfg_name', // 데이터의 키를 지정
    // header: t('ConfigGridR.CFG_name'), // 다국어 처리된 헤더 이름
    cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>, // 셀 데이터를 표시
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-center text-xs whitespace-nowrap">
          <span>{t('ConfigGridR.CFG_name')}</span>
        </div>
      );
    },
  },
  {
    // 범주 컬럼
    accessorKey: 'category', // 데이터의 키를 지정
    header: t('ConfigGridR.Category'), // 다국어 처리된 헤더 이름
    cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>, // 셀 데이터를 표시
  },
  {
    // 내용 컬럼
    accessorKey: 'file_name', // 데이터의 키를 지정
    header: t('ConfigGridR.Contents'), // 다국어 처리된 헤더 이름
  },
];

// 기본 데이터 (테이블에 표시할 샘플 데이터)
const defaultData = [
  {
    upload_date: '2023-12-25', // 업로드 날짜
    name: 'HippoLog', // 이름
    version: '1', // 버전
    country: 'KOR', // 국가
    logType: 'None', // 로그 유형
    summary: 'Real Log', // 요약
    map: '', // 지도 데이터
  },
  {
    upload_date: '2023-12-30', // 업로드 날짜
    name: 'HippoLog1', // 이름
    version: '2', // 버전
    country: 'KOR', // 국가
    logType: 'None', // 로그 유형
    summary: 'Real Log', // 요약
    map: '', // 지도 데이터
  },
];

/**
 * ConfigGridR 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.list - 테이블에 표시할 데이터 리스트
 * @param {function} props.onSelectionChange - 선택된 행 변경 시 호출되는 콜백 함수
 */
const ConfigGridR = ({ list, onSelectionChange }) => {
  const { t } = useTranslation(); // 다국어 처리를 위한 함수 가져오기
  const columns = useMemo(() => defaultColumns(t), [t]); // 다국어 처리를 적용한 컬럼 정의

  const [data, setData] = useState(list ?? defaultData); // 테이블 데이터 상태
  const [selectedRows, setSelectedRows] = useState([]); // 선택된 행 데이터 상태

  useEffect(() => {
    // props로 전달받은 list가 비어있지 않으면 데이터 업데이트
    if (list && !isEmpty(list)) {
      setData(list);
    }
  }, [list]);

  // React Table 생성
  const table = useReactTable({
    data, // 사용할 데이터
    columns, // 사용할 컬럼
    getCoreRowModel: getCoreRowModel(), // 기본 행 모델 가져오기
    state: {}, // 테이블 상태 관리
  });

  // 선택된 행 데이터가 변경되었을 때 처리
  useEffect(() => {
    const currentSelectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original); // 선택된 행의 원래 데이터를 가져옴

    // 선택된 행 상태가 변경되었을 경우에만 업데이트
    if (JSON.stringify(currentSelectedRows) !== JSON.stringify(selectedRows)) {
      setSelectedRows(currentSelectedRows); // 선택된 행 상태 업데이트
      onSelectionChange(currentSelectedRows); // 부모 컴포넌트로 선택된 행 데이터 전달
    }
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  return (
    <div className="my-2 h-[400px] w-[510px] block overflow-x-auto ml-[0px]">
      {/* 테이블 렌더링 */}
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0">
          {/* 테이블 헤더 */}
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider"
                >
                  {/* 헤더 내용 렌더링 */}
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header, // 컬럼의 헤더 정의
                        header.getContext() // 헤더의 컨텍스트
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {/* 테이블 본문 */}
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 whitespace-nowrap text-center border-2 text-xs text-black"
                >
                  {/* 셀 내용 렌더링 */}
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

export default ConfigGridR;
