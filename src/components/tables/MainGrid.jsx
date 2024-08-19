import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

const defaultColumns = [
  {
    accessorKey: 'upload_date', // accessor is the "key" in the data
    header: 'Uploaded date',
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

const initialData = [];

const MainGrid = ({ list }) => {
  const columns = useMemo(() => defaultColumns, []);
  const [data, setData] = useState(list ?? initialData);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getCoreRowModel(),
    state: {},
  });

  useEffect(() => {
    console.log('useEffect LIST ==>', list);
    if (list && !isEmpty(list.list)) {
      // console.log('SETTING LIST ==>', list);
      setData(list.list);
    }
  }, [list]);

  return (
    <div className="my-2 h-96 block overflow-x-auto">
      <table className="min-w-full  divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-50 border-2 sticky top-0 ">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 border-2 text-center text-xs font-bold text-black uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext,
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
