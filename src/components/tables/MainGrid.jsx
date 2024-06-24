import { useReactTable } from '@tanstack/react-table';

const MyGrid = ({ columns, data }) => {
  const { getTableProps } = useReactTable({ columns, data });
  return <table {...getTableProps}></table>;
};

export default MyGrid;
