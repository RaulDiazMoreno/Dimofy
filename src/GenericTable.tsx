import React from 'react';
import { Table, Pagination } from 'react-bootstrap';
interface Column<T> {
  key: keyof T;
  label: string;
}

interface GenericTableProps<T> {
  title: string;
  tableId: string;
  data: T[];
  columns: Column<T>[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (tableId: string, newPage: number) => void;
}

const GenericTable = <T extends object>({
  title,
  tableId,
  data,
  columns,
  page,
  rowsPerPage,
  handleChangePage,
}: GenericTableProps<T>) => {
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <section className="mb-5">
      <h4 className="mb-3">{title}</h4>
      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead className="table-primary">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={String(col.key)}>{String(row[col.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <Pagination className="justify-content-center">
        <Pagination.First onClick={() => handleChangePage(tableId, 0)} disabled={page === 0} />
        <Pagination.Prev onClick={() => handleChangePage(tableId, page - 1)} disabled={page === 0} />
        <Pagination.Item active>{page + 1}</Pagination.Item>
        <Pagination.Next
          onClick={() => handleChangePage(tableId, page + 1)}
          disabled={page >= totalPages - 1}
        />
        <Pagination.Last
          onClick={() => handleChangePage(tableId, totalPages - 1)}
          disabled={page >= totalPages - 1}
        />
      </Pagination>
    </section>
  );
};

export default GenericTable;





