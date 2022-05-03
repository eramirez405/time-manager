import React, { useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import BTable from 'react-bootstrap/Table';
import { useTable, usePagination } from 'react-table';
import CircleLoader from 'react-spinners/CircleLoader';
import { css } from '@emotion/core';
import { HiDownload } from 'react-icons/hi';
import XLSX from 'xlsx';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 15;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;

function Table({ columns, data, skip, setSkip }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
      initialState: { pageSize: 20 },
    },
    usePagination
  );
  //funcion para next
  const next = async () => {
    let nex = skip + 1;
    setSkip(nex);
  };
  const prevent = async () => {
    let pre = skip - 1;
    setSkip(pre);
  };

  // Render the UI for your table
  return (
    <>
      <BTable {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
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
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </BTable>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className='pagination'>
        {' '}
        <button
          type='button'
          className='btn btn-outline-primary btn-sm'
          onClick={prevent}
          disabled={skip == 0}
        >
          {'<'}
        </button>{' '}
        <button
          type='button'
          className='btn btn-outline-primary btn-sm'
          onClick={next}
        >
          {'>'}
        </button>{' '}
        <br />
        <span>|</span>
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>|</span>
        <span>
          Go to page:{' '}
          <input
            type='number'
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[20, 10].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const Table2 = ({ query, skip, setSkip }) => {
  console.log(query);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Customers',
        columns: [
          {
            Header: 'Id',
            accessor: '_id',
          },
          {
            Header: 'Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
          {
            Header: 'Phone',
            accessor: 'phone.number',
          },
          {
            Header: 'State',
            accessor: 'address.state',
          },
        ],
      },
    ],
    []
  );
  const GET_CUSTOMERS = gql`
    ${query}
  `;

  const { loading, error, data } = useQuery(GET_CUSTOMERS);
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;
  // console.log(data.customers)
  //     const excel = [{
  //       data:data.map((e)=>{
  // return {
  //   Id:e._id,
  //   Name:e.firstName,
  //   LastName:e.lastName,
  //   Phone:e.phone.number,
  //   State:e.address.state
  // }
  // })
  //     }];
  const expor = async () => {
    const prueba = data.customers.map((key) => ({
      Id: key._id,
      Name: key.firstName,
      LastName: key.lastName,
      Phone: key.phone.number,
      State: key.address.state,
    }));
    const ws = XLSX.utils.json_to_sheet(prueba);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, 'Data Exportada.xlsx');
  };

  if (loading)
    return (
      <div className='sweet-loading'>
        <CircleLoader css={override} size={150} color={'#DAD7CF'} />
      </div>
    );
  if (error) return `Error! ${error.message}`;
  return !!data ? (
    <div>
      <Button
        variant='contained'
        color='primary'
        style={{
          width: '120px',
          height: '25px',
          marginLeft: '20px',
        }}
        onClick={expor}
      >
        Exportar <br />
        <HiDownload />{' '}
      </Button>
      <Styles>
        <Table
          columns={columns}
          data={data.customers}
          skip={skip}
          setSkip={setSkip}
        />
      </Styles>
    </div>
  ) : (
    <div />
  );
};

export default React.memo(Table2);
