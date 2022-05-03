import React from 'react';
import { useTable, usePagination } from 'react-table';
import Pagination from './Pagination';
const Table = ({ data }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'friendlyName',
      },
      {
        Header: 'Workers',
        columns: [
          {
            Header: 'Elegible',
            accessor: 'totalEligibleWorkers',
          },
          {
            Header: 'Available',
            accessor: 'totalAvailableWorkers',
          },
        ],
      },
      {
        Header: 'Tasks',
        columns: [
          {
            Header: 'Assigned',
            accessor: 'tasksByStatus.assigned',
          },
          {
            Header: 'Canceled',
            accessor: 'tasksByStatus.canceled',
          },
          {
            Header: 'Completed',
            accessor: 'tasksByStatus.completed',
          },
          {
            Header: 'Pending',
            accessor: 'tasksByStatus.pending',
          },
          {
            Header: 'Reserved',
            accessor: 'tasksByStatus.reserved',
          },
          {
            Header: 'Wrapping',
            accessor: 'tasksByStatus.wrapping',
          },
        ],
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable({ columns, data }, usePagination);

  return pageCount > 0 ? (
    <>
      <table {...getTableProps()} className='table table-hover'>
        <thead className='bg-dark text-white'>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pageCount > 1 && (
        <div className='d-flex justify-content-center'>
          <Pagination
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            pageIndex={pageIndex}
            pageOptions={pageOptions}
            gotoPage={gotoPage}
            pageSize={pageSize}
            previousPage={previousPage}
            nextPage={nextPage}
            pageCount={pageCount}
            setPageSize={setPageSize}
          />
        </div>
      )}
      <br />
    </>
  ) : (
    <div className='text-center p-3'>
      <h3 className='text-secondary'>No content to display...</h3>
    </div>
  );
};

export default Table;
