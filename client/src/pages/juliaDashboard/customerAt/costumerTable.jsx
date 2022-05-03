import axios from "axios";
import { startOfDay } from "date-fns";
import format from "date-fns/format";
import { parsePhoneNumber } from "libphonenumber-js";
import React, { useMemo } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useTable, useGlobalFilter, usePagination } from "react-table";
import SearchForm from "./searchForm";
import { GoPencil } from "react-icons/go";

const CostumerTable = () => {
    const [startDate, setStartDate] = useState (startOfDay(new Date()));
    const [endDate, setEndDate] = useState(new Date());
    const api_callBacks = `/api/twilio/callback/${startDate}/${endDate}`;
  
    const [loadingCallBacks, setLoadingCallBacks] = useState(true);
    const [callBacks, setCallBacks] = useState([]);
  
  useEffect(() => {
    async function getCallBacks() {
     await axios
        .get(api_callBacks) 
        .then((response) => {
          setCallBacks(response.data.callback);
          setLoadingCallBacks(false);
        });
    }
    if (loadingCallBacks) {
      getCallBacks();
    }
  }, []);

  const data =  useMemo(() => callBacks.filter((e) =>{ if(e.assignedTo) return e } ) || [],[callBacks]);
  
  const COLUMNS = [
    {
      width: "10%",
      Header: "NAME",
      accessor: "name",
    },
    {
      width: "10%",
      Header: "PHONE",
      accessor: "phone",
      Cell:({value}) => {
          return value;

      }
    },
    {
      width: "30%",
      Header: "REASON",
      accessor: "text",
    },
    {
      width: "10%",
      Header: "CALLER ID",
      accessor: "callerID",
      Cell:({value}) => {

          return value;
      }
    },
    {
      width: "11%",
      Header: "REQUEST TIME",
      accessor: "requestTime",
      Cell: ({ value }) => (
        <span>
          {format(new Date(value), "dd/MM/yyyy hh:mm:ss aaaa")}
        </span>
      ),
    },
    {
      width: "10%",
      Header: "ASSIGNATION TIME",
      accessor: "assignationTime",
      Cell: ({ value }) => (
           <span>
            {format(new Date(value), "dd/MM/yyyy hh:mm:ss aaaa")}
          </span>
        ),
      },
      {
        width: "10%",
      Header: "TAG",
      accessor: "tag",
    },
    {
      width: "10%",
      Header: "ASSIGNED TO",
      accessor: "assignedTo" 
    },
  ];

  const columns = useMemo(() => COLUMNS, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    state,
    prepareRow,
    pageOptions,
    gotoPage,
    canPreviousPage,
    previousPage,
    nextPage,
    canNextPage,
    pageCount

  } = useTable(
    {
      columns,
      data
    },
    useGlobalFilter,
    usePagination
  );

  const { pageIndex } = state;

      return (
        <>
        <SearchForm callBacks={callBacks} setCallBacks={setCallBacks}/>
        <div className="mb-2" style={{ width: "280px" }}>
        </div>
        <table {...getTableProps()} className="table table-hover">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} style={{ color: "white"}} className="bg-dark">
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return ( 
                      <td style= {{
                        width: cell.column.width,
                      }} {...cell.getCellProps()} >{cell.render("Cell")}</td>
                      
                    );
                  })}
                </tr>
                
              );
            })}
          </tbody>
        </table>
        {data.length === 0 ? <center><h1 style={{color:"navy"}}>No content to display...</h1></center>:
        <div className="d-flex justify-content-end mt-2">
          <span className="mr-3 mt-1">
            Page{" "}
            <strong>
            {pageIndex + 1} Of {pageOptions.length}
            </strong>
            {"  "}
          </span>
        
          <button
            className="mr-2"
            style={{
              border: "0",
              overflow: "visible",
              background: "none",
              height: "30px",
              width: "30px",
            }}
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            {"<<"}
          </button>
          <button
            className="mr-2"
            style={{
              border: "0",
              overflow: "visible",
              background: "none",
              height: "30px",
              width: "30px",
            }}
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
  
          >
            {"<"}
          </button>
          <button
            className="mr-2"
            style={{
              border: "0",
              overflow: "visible",
              background: "none",
              height: "30px",
              width: "30px",
            }}
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {">"}
          </button>
          <button
            className="mr-2"
            style={{
              border: "0",
              overflow: "visible",
              background: "none",
              height: "30px",
              width: "30px",
            }}
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {">>"}
          </button>
        </div>}
        </>
      ) 
};

export default CostumerTable;
