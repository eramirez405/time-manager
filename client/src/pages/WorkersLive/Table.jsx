import React, { Fragment, useState, useEffect, useMemo } from "react";
import { useTable, usePagination, useSortBy, useRowSelect } from "react-table";
import Pagination from "./Pagination";
import format from "date-fns/format";
import AllNoteModal from "./AllNoteModal";
import SistemNote from "./SistemNote";
import { IconName } from "react-icons/fi";
import DailyNotesModal from "./DailyNotesModal";
import { FiEdit, FiFileText, FiAlertTriangle } from "react-icons/fi";
import Select from "react-select";
import isToday from 'date-fns/isToday'
const Table = ({ workersLive }) => {
  const [dailyNotesModalOpen, setDailyNotesModalOpen] = useState(false);
  const [allNotesModalOpen, setallNotesModalOpen] = useState(false);
  const [userToEdit2, setUserToEdit2] = useState(null);
  const [SistemNoteOpen, setSistemNoteOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [direction, setDirection] = useState({
    value: "All",
    label: "All",
  });
  const [options, setOptions] = useState([]);
 

  let data = React.useMemo(
    () =>
      workersLive.filter((e) => {
        if (direction.value == "clockin") {
         
          if( isToday( new Date(e.workerLive.timestamp))!=false){

            return (
              e.workerLive.activity === "clockin" ||
              e.workerLive.activity === "awayOut" ||
              e.workerLive.activity === "breakOut"
            );
          }
         
        } else if (direction.value == "clockout") {
          if(isToday( new Date(e.workerLive.timestamp))==false){
            return(
              e.workerLive.activity === "clockout"||
              e.workerLive.activity === "clockin"
            );
          }
          return e.workerLive.activity === "clockout";
        } else if (direction.value == "awayIn") {
          return e.workerLive.activity === "awayIn";
        } else if (direction.value == "breakIn") {
          return e.workerLive.activity === "breakIn";
        } else {
          return e;
        }
      }),
    [direction, workersLive]
  );

  useEffect(() => {
    
    const _options = [
      {
        value: "clockin",
        label: ` Working : ${
          workersLive.filter(
            (e) =>
              e.workerLive.activity === "clockin" ||
              e.workerLive.activity === "awayOut" ||
              e.workerLive.activity === "breakOut" 
             
          ).filter((u)=>
          isToday( new Date(u.workerLive.timestamp))!=false
          
          ).length
        }`,
      },
      {
        value: "clockout",
        label: `Out : ${
          workersLive.filter((e) => e.workerLive.activity == "clockout"||  isToday( new Date(e.workerLive.timestamp))==false).length
        }`,
      },
      {
        value: "awayIn",
        label: `Away : ${
          workersLive.filter((e) => e.workerLive.activity === "awayIn").length
        }`,
      },
      {
        value: "breakIn",
        label: `Break : ${
          workersLive.filter((e) => e.workerLive.activity === "breakIn").length
        }`,
      },
      {
        value: "All",
        label: `All : ${workersLive.length}`,
      },
    ];
    setOptions(_options);
    setDirection(_options.find((item) => item.value === direction.value));
  }, [workersLive]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "workerLive.name", // accessor is the "key" in the data
      },
      {
        Header: "Schedule Start",
        accessor: "workerLive.schedule",
        Cell: ({ value }) => {
          if (!!value && !!value[format(new Date(), "EEEE").toLowerCase()]) {
            return value[format(new Date(), "EEEE").toLowerCase()]
              ?.scheduleStart;
          } else {
            return "N/A";
          }
        },
      },
      {
        Header: "Schedule End",
        id: 2,
        accessor: "workerLive.schedule",
        Cell: ({ value }) => {
          if (!!value && !!value[format(new Date(), "EEEE").toLowerCase()]) {
            return value[format(new Date(), "EEEE").toLowerCase()]?.scheduleEnd;
          } else {
            return "N/A";
          }
        },
      },
      {
        Header: "Status",
        accessor: "workerLive.activity",
        Cell: ({
          row: {
            original: { workerLive },
          },
        }) => {
         let today=isToday( new Date(workerLive.timestamp));

          if(today== false){
            return (
              <div
                className="badge badge-danger"
                style={{ fontSize: "15px", backgroundColor: "Red" }}
              >
                Out
              </div>
            );
          }

          else if (
            workerLive.activity === "clockin" ||
            workerLive.activity === "awayOut" ||
            workerLive.activity === "breakOut"
          ) {
            return (
              <div
                className="badge badge-success"
                style={{ fontSize: "15px", backgroundColor: "green" }}
              >
                Working
              </div>
            );
          } else if (workerLive.activity === "breakIn")
            return (
              <div
                className="badge badge-warning"
                style={{ fontSize: "15px", backgroundColor: "orange" }}
              >
                Break
              </div>
            );
          else if (workerLive.activity === "awayIn")
            return (
              <div
                className="badge badge-warning"
                style={{ fontSize: "15px", backgroundColor: "goldenrod" }}
              >
                Away
              </div>
            );
          else if (workerLive.activity === "clockout")
            return (
              <div
                className="badge badge-danger"
                style={{ fontSize: "15px", backgroundColor: "Red" }}
              >
                Out
              </div>
            );
          else return workerLive?.activity;
        },
      },
      {
        Header: "Last Updated",
        accessor: "workerLive.timestamp",
        Cell: ({
          row: {
            original: { workerLive },
          },
        }) => {
          return `${format(
            new Date(workerLive.timestamp),
            "MMM do y - HH:mm a"
          )}`;
        },
      },
      {
        Header: "Notas",
        accessor: "workerLive.dailyNotes",
        Cell: ({
          row: {
            original: { workerLive },
          },
        }) => {
   

          if (workerLive?.dailyNotes && workerLive.dailyNotes.length > 0 
            && workerLive.dailyNotes[workerLive.dailyNotes.length-1].note != undefined
            &&isToday(new Date(workerLive.dailyNotes[workerLive.dailyNotes.length-1].timestamp))== true
            ) {

            return workerLive.dailyNotes[workerLive.dailyNotes.length - 1].note;
          } else {
            return false;
          }


        },
      },
       {
        Header: "Notas System isue",
        accessor: "workerLive.sisNotes",
        Cell: ({
          row: {
            original: { workerLive },
          },
        }) => {
          // console.log(workerLive)
       
          if (workerLive?.sisNotes && workerLive.sisNotes.length > 0 
            && workerLive.sisNotes[workerLive.sisNotes.length-1].note != undefined
            &&isToday(new Date(workerLive.sisNotes[workerLive.sisNotes.length-1].timestamp))== true
            ) {

            return workerLive.sisNotes[workerLive.sisNotes.length - 1].note;
          } else {
            return false;
          }
          // if (workerLive?.sisNotes && workerLive.sisNotes.length > 0) {
          //   return workerLive.sisNotes[workerLive.sisNotes.length - 1];
          // } else {
          //   return false;
          // }
        },
      },
      {
        id: "edit",
        width: 20,
        Cell: ({ row: { original } }) => {
         
          return (
            <FiEdit
              onClick={() => {
                setUserToEdit(original);
                setDailyNotesModalOpen(true);
              }}
              style={{ cursor: "pointer" }}
              size={20}
            />
          );
        },
      },
      {
        id: "edit2",
        width: 20,
        Cell: ({ row: { original } }) => {
         
          return (
            <FiAlertTriangle
              onClick={() => {
                setUserToEdit2(original);
                setSistemNoteOpen(true);
              }}
              style={{ cursor: "pointer" }}
              size={20}
            />
          );
        },
      },
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
  } = useTable(
    { columns, data, initialState: { pageSize: 20 } },

    useSortBy,
    usePagination
  );

  return (
    <div>
      <button
        className="btn btn-info mx-1 p-1"
        onClick={() => setallNotesModalOpen(true)}
      >
        All Notes <FiFileText />
      </button>

      <div style={{ width: "184px", marginLeft: "117px", marginTop: "-36px" }}>
        <Select
          // isClearable
          className={"select"}
          placeholder="Show..."
          value={direction}
          onChange={(value) => setDirection(value)}
          options={options}
          style={{}}
        />
      </div>
      <br />
      <table {...getTableProps()} className="table table-hover">
        <thead className="bg-dark text-white">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔻"
                        : " 🔺"
                      : ""}
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
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pageCount > 1 && (
        <div className="d-flex justify-content-center">
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

      {dailyNotesModalOpen && (
        <DailyNotesModal
          isOpen={dailyNotesModalOpen}
          onRequestClose={() => setDailyNotesModalOpen(false)}
          user={userToEdit}
          //setOnLicense={setOnLicense}
        />
      )}
      {SistemNoteOpen && (
        <SistemNote
          isOpen={SistemNoteOpen}
          onRequestClose={() => setSistemNoteOpen(false)}
          user={userToEdit2}
          //setOnLicense={setOnLicense}
        />
      )}
      {allNotesModalOpen && (
        <AllNoteModal
          isOpen={allNotesModalOpen}
          onRequestClose={() => setallNotesModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Table;
