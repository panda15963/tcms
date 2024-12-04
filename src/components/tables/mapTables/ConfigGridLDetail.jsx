import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 테이블의 기본 컬럼 정의
 * @param {Function} t - 다국어 번역 함수
 * @returns {Array} - 테이블 컬럼 배열
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
    accessorKey: 'modif_date', // 데이터를 가져올 키 (데이터의 속성 이름)
    header: t('ConfigGridL.UploadedDate'), // 컬럼 헤더에 표시될 텍스트?
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
    // CFG 이름
    accessorKey: 'tccfg_name',
    header: t('ConfigGridL.CFG_name'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 7; // 표시할 최대 문자 수
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
    // 설명
    accessorKey: 'description',
    header: t('ConfigGridL.Description'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 15; // 표시할 최대 문자 수
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
    // 태그
    accessorKey: 'taglist',
    header: t('ConfigGridL.Tag'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 3; // 표시할 최대 문자 수
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

/**
 * ConfigGridLDetail 컴포넌트
 * @param {Object} props
 * @param {Array} props.list - 테이블에 표시할 데이터 리스트
 * @param {Function} props.onSelectionChange - 선택된 행 변경 시 호출되는 콜백 함수
 * @param {Function} props.onCellDoubleClick - 셀 더블 클릭 시 호출되는 콜백 함수
 * @param {Function} props.onCellClick - 셀 클릭 시 호출되는 콜백 함수
 * @returns {JSX.Element} - 구성된 ConfigGridLDetail 컴포넌트
 */
const ConfigGridLDetail = ({
  list,
  onSelectionChange,
  onCellDoubleClick,
  onCellClick,
}) => {
  const { t } = useTranslation(); // 다국어 번역 함수
  const columns = useMemo(() => defaultColumns(t), [t]); // 컬럼 정의
  const [data, setData] = useState(list ?? []); // 테이블 데이터 상태
  const [selectedRows, setSelectedRows] = useState([]); // 선택된 행 상태
  let clickTimer = null;

  useEffect(() => {
    if (list && list.length > 0) {
      setData(list);
    }
  }, [list]);

  const table = useReactTable({
    data, // 테이블에 사용할 데이터
    columns, // 테이블에 사용할 컬럼
    getCoreRowModel: getCoreRowModel(), // 기본 행 모델을 가져오는 함수 사용
    state: {}, // 테이블의 상태
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

  // 셀 클릭 및 더블클릭 처리
  const handleRowClick = (rowData) => {
    if (clickTimer) {
      clearTimeout(clickTimer); // 더블클릭 타이머 초기화
      clickTimer = null;
      if (onCellDoubleClick) onCellDoubleClick(rowData);
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        onCellClick(rowData); // onClick 이벤트 실행
      }, 200); // 더블클릭 지연 시간 설정
    }
  };

  return (
    <div className="my-2 h-[400px] w-[700px] block overflow-x-auto">
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
              onClick={() => handleRowClick(row.original)}
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
    </div>
  );
};

export default ConfigGridLDetail;
