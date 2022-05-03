import React, { useMemo, useState } from "react";
import ModalCallbacks from "./modal";
import { parsePhoneNumber } from "libphonenumber-js";
import { useTable, useGlobalFilter, usePagination } from "react-table";
import format from "date-fns/format";
import { GoPencil } from "react-icons/go";
import { MdCancel } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

const HomeTable = ({callBacks, setCallBacks}) => {  
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
 
  const data =  useMemo(() => callBacks.filter((e) =>{ if(!e.assignedTo) return e } ) || [],[callBacks]);
  const updateData = async( id ) => {
    var data = JSON.stringify({
      "assignedTo": "INVALID",
      "tag": "INVALID",
      "assignationTime": new Date(),
    });
    const config = {
      method: 'put',
      url: `/api/twilio/callback/${id}`,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      setCallBacks((preState) => preState.filter((e) => e._id !== id ) )
    })
    .catch(function (error) {
      console.log(error);
    });
  }
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
      width: "10%",
      Header: "REQUEST TIME",
      accessor: `requestTime`,
      Cell: ({ value }) => (
        <>       
        <span>
          {format(new Date(value), "dd/MM/yyyy hh:mm:ss aaaa")}
        </span>
        </>
      ),
    },
    {
      width: "10%",
      Header: "ACTIONS",
      accessor: "actions",
      Cell: (value) => {
        return(
          <>     
          <button type="button" className="btn btn-info" 
          onClick={() => {
            setIsOpen(true);
            setModalData(value.row.original)
          
          }}><GoPencil size={20} /></button>

          <button type="button" className="btn btn-danger ml-2" 
          onClick={(id) => {
            Swal.fire({
              title: 'Are you sure?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes,invalid!'
            }).then((result) => {
              if (result.isConfirmed) {
                updateData( id = value.row.original._id )
                Swal.fire(
                  'Deleted!',
                  'Your file has been deleted.',
                  'success'
                )
              }
            })
          }}><MdCancel size={20} /></button>
          </>
          )
        }
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
      <div className="mb-2" style={{ width: "280px" }}>
      </div>
      {data.length === 0 ? <center><h1 style={{color:"navy"}}>No content to display...</h1></center>:
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
      </table>}
      {data.length !== 0 && <div className="d-flex justify-content-end mt-2">
        <span className="mr-3 mt-1">
          Page{" "}
          <strong>
          {pageIndex + 1} of {pageOptions.length}
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

      {modalIsOpen === true && (<ModalCallbacks  
                    setIsOpen={setIsOpen}
                    modalIsOpen={modalIsOpen}
                    setCallBacks={setCallBacks}
                    name={modalData.name} 
                    text={modalData.text}
                    phone={modalData.phone}
                    id={modalData._id}/>)}
    </>
  );
};

export default HomeTable;
