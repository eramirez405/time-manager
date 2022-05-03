// import React from 'react';
// import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
// import format from 'date-fns/format';
// import Pagination from './Pagination';
// import { FiVoicemail } from 'react-icons/fi';
// import GlobalFilter from './GlobalFilter';


// const FilteringTable = ({ data, setTask, openModal }) => {
//   const columns = React.useMemo(
//     () => [
//       {
//         Header: 'Date',
//         accessor: 'dateCreated',
//         Cell: (row) => (
//           <span
//             className='text-primary'
//             style={{ cursor: 'pointer' }}
//             onClick={() => {
//               openModal();
//               setTask(row?.row?.original);
//             }}
//           >
//             {format(new Date(row.value), 'dd/MM/yyyy hh:mm:ss aaaa')}
//           </span>
//         ),
//       },
//       {
//         Header: 'Status',
//         accessor: 'assignmentStatus',
//       },
//       {
//         Header: 'Direction',
//         accessor: 'attributes.direction',
//       },
//       {
//         Header: 'From',
//         accessor: 'attributes.from',
//       },
//       {
//         Header: 'To',
//         accessor: 'attributes.outbound_to',
//       },
//       {
//         Header: 'Task Channel',
//         accessor: 'taskChannelUniqueName',
//       },
//       {
//         Header: "Name",
//         accessor: (row) => {
//         if (row?.attributes?.Link === "") {
            
//           return row?.attributes?.name
//         } else {
//           return row?.attributes?.Link;
//         }
//        } 
//       },
//       {
//         Header: 'Worker',
//         accessor: 'workerName',
//       },
//       {
//         Header: 'Age (HH:MM:SS)',
//         accessor: 'age',
//         Cell: ({ value }) => {

//           // let Hours = Math.floor((value / 3600));
//           // let Minutes = Math.floor(((value / 3600) % 1) * 60);
//           // let Seconds = Math.floor((((value / 3600) % 1) * 60) % 1) * 60;

//           if (value) {
//             //Returns a Date Object (YYYY-MM-DDTHH:mm:ss.sssZ) using 'value' in seconds 
//             //Then converts it to string and gets the substring HH:mm:ss
//             return new Date(value * 1000).toISOString().substr(11, 8);
          
//           } 
//           else {
//             return '';
//           }
//         },
//       },
//       {
//         Header: 'HT',
//         accessor: 'ht'
//       },
//       {
//         Header: 'Recording',
//         accessor: 'attributes.conversations',
//         Cell: ({ value }) => {
//           if (!!value) {
//             return <FiVoicemail size={20} />;
//           } else {
//             return <div />;
//           }
//         },
//       },
//     ]
//     ,[] 
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     prepareRow,
//     page,
//     canPreviousPage,
//     canNextPage,
//     pageOptions,
//     pageCount,
//     gotoPage,
//     nextPage,
//     previousPage,
//     setPageSize,
//     state,
//     state: { pageIndex, pageSize },
//     setGlobalFilter,
//   } = useTable({ columns, data }, useGlobalFilter, useSortBy, usePagination);

//   const { globalFilter } = state

//   return pageCount > 0 ? (
//     <>

// <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />

//       <table {...getTableProps()} className='table table-hover'>
//         <thead className='bg-dark text-white'>
//           {headerGroups.map((headerGroup) => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column) => (
//                 <th {...column.getHeaderProps(column.getSortByToggleProps())}>
//                     {column.render('Header')}
//                 <span>
//                     {column.isSorted ? (column.isSortedDesc ? ' 🔻' : ' 🔺') : ''}
//                     </span>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           {page.map((row, i) => {
//             prepareRow(row);
//             return (
//               <tr {...row.getRowProps()}>
//                 {row.cells.map((cell) => {
//                   return (
//                     <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
//                   );
//                 })}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//       {pageCount > 1 && (
//         <div className='d-flex justify-content-center'>
//           <Pagination
//             canPreviousPage={canPreviousPage}
//             canNextPage={canNextPage}
//             pageIndex={pageIndex}
//             pageOptions={pageOptions}
//             gotoPage={gotoPage}
//             pageSize={pageSize}
//             previousPage={previousPage}
//             nextPage={nextPage}
//             pageCount={pageCount}
//             setPageSize={setPageSize}
//             //data={data}  //Passing the array data to the Pagination component
//           />
//         </div>
//       )}

//       <br />
//     </>
//   ) : 
  
//   (
//     <div className='text-center p-3'>
//       <h3 className='text-secondary'>No content with this filters...</h3>
//     </div>
//   );
// };

// export default FilteringTable;