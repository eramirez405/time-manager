import React from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import Pagination from './Pagination';
//import { FiToggleRight, FiToggleLeft } from 'react-icons/fi'; -never used
//import format from 'date-fns/format'; -never used
//import formatDistanceToNow from 'date-fns/formatDistanceToNow'; -never used

const Table = ({ data }) => {
  const getActivityDurationColums = () => {
    if (!!data && data.workSummary && data.workSummary.length > 0) {
      const testData = data?.workSummary[0]?.activity_durations;
      const result = !!testData
        ? testData.map((e, index) => {
            return {
              Header: e.friendly_name,
              accessor: `activity_durations[${index}].total`,
              Cell: ({ value }) =>
                `${Math.floor(value / 3600)}:${Math.floor(
                  ((value / 3600) % 1) * 60
                )}`,
            };
          })
        : [];
      return result;
    }
  };
  

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'friendlyName',
      },
      {
        Header: 'Reservations',
        columns: [
          {
            Header: 'Created',
            accessor: 'reservations_created',
          },
          {
            Header: 'Accepted',
            accessor: 'reservations_accepted',
          },
          {
            Header: 'Rejected',
            accessor: 'reservations_rejected',
          },
          {
            Header: 'TimedOut',
            accessor: 'reservations_timed_out',
          },
          {
            Header: 'Canceled',
            accessor: 'reservations_canceled',
          },
          {
            Header: 'Completed',
            accessor: 'reservations_completed',
          },
        ],
      },
      {
        Header: 'Activity Durations (hh:mm)',
        columns: getActivityDurationColums(),
      },
      // {
      //   Header: 'Available',
      //   accessor: 'available',
      //   Cell: ({ value }) =>
      //     !!value ? (
      //       <FiToggleRight size={30} stroke='#81f562' />
      //     ) : (
      //       <FiToggleLeft size={30} stroke='#fb3e3e' />
      //     ),
      // },
      // {
      //   Header: 'Timeouts',
      //   accessor: 'timeouts',
      //   Cell: ({ value }) => {
      //     if (!!value && value.length > 0) {
      //       return <div>{value.length}</div>;
      //     } else {
      //       return <div />;
      //     }
      //   },
      // },
      // {
      //   Header: 'Rejections',
      //   accessor: 'rejections',
      //   Cell: ({ value }) => {
      //     if (!!value && value.length > 0) {
      //       return <div>{value.length}</div>;
      //     } else {
      //       return <div />;
      //     }
      //   },
      // },
      // {
      //   Header: 'Activity',
      //   accessor: 'activityName',
      //   Cell: ({ row: { original } }) => {
      //     if (original?.statusChangeInfo) {
      //       return (
      //         <div>
      //           <div>
      //             Current: {original.statusChangeInfo.WorkerActivityName}
      //           </div>
      //           <div>
      //             Previous:{' '}
      //             {original.statusChangeInfo.WorkerPreviousActivityName}
      //           </div>
      //         </div>
      //       );
      //     } else {
      //       return <div>{original.activityName}</div>;
      //     }
      //   },
      // },
      // {
      //   Header: 'Time in Current Activity',
      //   Cell: ({ row: { original } }) => {
      //     if (original?.statusChangeInfo) {
      //       return (
      //         <div>
      //           {formatDistanceToNow(
      //             new Date(original.statusChangeInfo.Timestamp)
      //           )}
      //         </div>
      //       );
      //     } else {
      //       return <div />;
      //     }
      //   },
      // },
      // {
      //   Header: 'Call Status',
      //   accessor: 'lastCall',
      //   Cell: ({ row: { original } }) => {
      //     if (original?.lastCall) {
      //       return (
      //         <div
      //           className='alert alert-dismissible alert-danger'
      //           style={{ width: 'fit-content' }}
      //         >
      //           <div>Last Call:</div>
      //           <div>
      //             {formatDistanceToNow(new Date(original.lastCall.Timestamp))}
      //           </div>
      //         </div>
      //       );
      //     } else if (original?.currentCall) {
      //       return (
      //         <div
      //           className='alert alert-dismissible alert-success'
      //           style={{ width: 'fit-content' }}
      //         >
      //           <div>Current Call:</div>
      //           <div>
      //             {formatDistanceToNow(
      //               new Date(original.currentCall.Timestamp)
      //             )}
      //           </div>
      //         </div>
      //       );
      //     } else {
      //       return <div />;
      //     }
      //   },
      // },
    ],
   []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
 // footerGroups, never used
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
  } = useTable({ columns, data: data.workSummary }, useSortBy, usePagination);


  return pageCount > 0 ? (
    <>
      <table {...getTableProps()} className='table table-hover'>
        <thead className='bg-dark text-white'>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔻' : ' 🔺') : ''}
                    </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
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
            //data={data} //Passing the array data to the Pagination component
          />
        </div>
      )}
      <br />
    </>
  ) : (
    <div className='text-center p-3'>
      <h3 className='text-secondary'>No content with this filters...</h3>
    </div>
  );
};


export default Table;
