import React from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';



const Pagination = ({
  canPreviousPage,
  canNextPage,
  pageIndex,
  pageOptions,
  gotoPage,
  pageSize,
  previousPage,
  nextPage,
  pageCount,
  setPageSize,
}) => {
  
  return (
    <div className='pagination'>
      <button
        className='btn btn-info mx-1 p-1'
        onClick={() => gotoPage(0)}
        disabled={!canPreviousPage}
      >
        <FiChevronsLeft size={25} />
      </button>
      <button
        className='btn btn-info mx-1 p-1'
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      >
        <FiChevronLeft size={25} />
      </button>
      <button
        className='btn btn-info mx-1 p-1'
        onClick={() => nextPage()}
        disabled={!canNextPage}
      >
        <FiChevronRight size={25} />
      </button>
      <button
        className='btn btn-info mx-1 p-1'
        onClick={() => gotoPage(pageCount - 1)}
        disabled={!canNextPage}
      >
        <FiChevronsRight size={25} />
      </button>{' '}
      <span className='mx-2' style={{ alignSelf: 'center' }}>
        Page{' '}
        <strong>
          {pageIndex + 1} of {pageOptions.length}
        </strong>{' '}
      </span>
      <span className='mx-2' style={{ alignSelf: 'center' }}>
        |
      </span>
      <span className='mx-2' style={{ alignSelf: 'center' }}>
        Go to page:{' '}
        <input
          type='number'
          className='form-control'
          defaultValue={pageIndex + 1}
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
          style={{ width: '70px', display: 'inline' }}
        />
      </span>{' '}
      <select
        value={pageSize}
        className='form-control'
        style={{ width: '120px', display: 'inline' }}
        onChange={e => {
          setPageSize(Number(e.target.value));
        }}
      >
        {[10, 20, 30, 40].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>

    </div>
  );
};

export default Pagination;