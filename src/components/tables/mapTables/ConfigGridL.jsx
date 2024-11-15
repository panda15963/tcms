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
    // 업로드 된 날짜
    accessorKey: 'modif_date', // 데이터를 가져올 키 (데이터의 속성 이름)
    header: () => (
      <div
        className="text-xs"
        style={{
          whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
        }}
      >
        {t('ConfigGridL.UploadedDate')}
      </div>
    ),
    cell: ({ getValue }) => {
      const fullDate = getValue(); // "2024-10-20 23:12:11" 형식의 데이터
      const shortDate = fullDate.slice(0, 10); // YYYY-MM-DD 부분만 추출

      return (
        <span title={fullDate} className="cursor-pointer text-xs">
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
        <span title={fullText} className="cursor-pointer text-xs">
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
        <span title={fullText} className="cursor-pointer text-xs">
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
        <span title={fullText} className="cursor-pointer text-xs">
          {shortText}
        </span>
      );
    },
  },
  {
    // 버전
    accessorKey: 'ver_id',
    header: t('ConfigGridL.Version'),
    cell: ({ getValue }) => getValue(),
    // 스타일을 추가해 헤더가 한 줄로 나오게 설정
    header: ({ column }) => (
      <div
        className="text-xs"
        style={{
          whiteSpace: 'nowrap', // 텍스트가 줄바꿈 없이 한 줄로 유지되도록 설정
          width: '25px', // 헤더 셀의 너비를 넓혀서 한 줄에 맞도록 설정
        }}
      >
        {t('ConfigGridL.Version')}
      </div>
    ),
  },
  {
    // 수정 요형
    accessorKey: 'modif_type',
    header: t('ConfigGridL.ModificationType'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 10; // 표시할 최대 문자 수
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
    // 수정 내용
    accessorKey: 'modif_comment',
    header: t('ConfigGridL.ModificationComment'),
    cell: ({ getValue }) => {
      const fullText = getValue();
      const maxLength = 15; // 표시할 최대 문자 수
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

const ITEMS_PER_PAGE = 8; // 한 번에 로드할 아이템 개수

// ConfigGridL 컴포넌트 정의
const ConfigGridL = ({ list, onSelectionChange, onCellDoubleClick }) => {
  const { t } = useTranslation();
  const columns = useMemo(() => defaultColumns(t), [t]);

  const [displayedData, setDisplayedData] = useState([]); // 표시할 데이터
  const [page, setPage] = useState(1); // 현재 페이지 번호
  const [selectedRows, setSelectedRows] = useState([]);

  // list.list가 배열인지 확인하고, 아니면 빈 배열로 초기화
  const validList = Array.isArray(list?.list) ? list.list : [];

  // list 변경 시 초기 데이터를 설정
  useEffect(() => {
    if (validList.length > 0) {
      setDisplayedData(validList.slice(0, ITEMS_PER_PAGE));
      setPage(1);
    } else {
      setDisplayedData([]);
    }
  }, [validList]);

  // 페이지 변경 시 더 많은 데이터를 로드하여 기존 데이터에 추가
  useEffect(() => {
    if (page > 1) {
      const newItems = validList.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
      );
      setDisplayedData((prevDisplayedData) => [
        ...prevDisplayedData,
        ...newItems,
      ]);
    }
  }, [page, validList]);

  // 더 많은 항목 보기 버튼 핸들러
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const table = useReactTable({
    data: displayedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  const handleCellClick = (rowData) => {
    console.log('Row clicked:', rowData);
    onSelectionChange([rowData]);
  };

  const handleCellDoubleClick = (rowData) => {
    console.log('Row double clicked:', rowData);
    if (onCellDoubleClick) {
      onCellDoubleClick(rowData);
    }
  };

  return (
    <div
      className="my-2 h-[400px] w-[720px] block overflow-x-auto"
      style={{ marginLeft: '0px' }}
    >
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
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
              onClick={() => handleCellClick(row.original)}
              onDoubleClick={() => handleCellDoubleClick(row.original)}
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

      {/* 더 많은 항목 보기 버튼 */}
      {displayedData.length < validList.length && (
        <button
          onClick={handleLoadMore}
          className="mt-1 ml-80 px-2 py-1 bg-blue-500 text-white rounded shadow-lg"
        >
          {t('ConfigGridL.LoadMore', '더 많은 항목 보기')}
        </button>
      )}
    </div>
  );
};

export default ConfigGridL;
