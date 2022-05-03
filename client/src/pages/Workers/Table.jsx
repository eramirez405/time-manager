import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useTable, usePagination, useSortBy, useRowSelect } from "react-table";
import Pagination from "./Pagination";
import TableToggler from "./TableToggler";
import { FiToggleRight, FiToggleLeft, FiX } from "react-icons/fi";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import differenceInMinutes from "date-fns/differenceInMinutes";
import { deleteWorker } from "../../actions/workers";
import Swal from "sweetalert2";

const Table = ({
  workersData,
  showAllWorkers,
  addToLocal,
  setAddToLocal,
  setHideAddButton,
  openWorkerMonitorModal,
  setWorkerActivityID,
  deleteWorker,
  user,
}) => {
  let result = {};
  //console.log(workersData);
  //console.log(JSON.parse(localStorage.getItem("RowID")));
  const StorageID = JSON.parse(localStorage.getItem("RowID"));
  StorageID?.forEach(function (prop, index) {
    result[prop] = true;
  });

  const getTrProps = (state) => {
    return {
      style: {
        backgroundColor:
          state?.original?.statusChangeInfo?.WorkerActivityName === "Offline" &&
          differenceInMinutes(
            new Date(),
            new Date(state?.original?.statusChangeInfo?.Timestamp)
          ) >= 5
            ? "pink"
            : "white",
      },
    };
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "friendlyName",
        Cell: ({ value }) => {
          //console.log(value);
          return (
            <span
              className="text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => {
                openWorkerMonitorModal();
                setWorkerActivityID(value);
              }}
            >
              {value}
            </span>
          );
        },
      },
      {
        Header: "Available",
        accessor: "available",
        disableSortBy: true,
        Cell: ({ value }) =>
          !!value ? (
            <FiToggleRight size={30} stroke="#81f562" />
          ) : (
            <FiToggleLeft size={30} stroke="#fb3e3e" />
          ),
      },
      {
        Header: "Timeouts",
        accessor: "timeouts",
        disableSortBy: true,
        Cell: ({ value }) => {
          if (!!value && value.length > 0) {
            return <div>{value.length}</div>;
          } else {
            return <div />;
          }
        },
      },
      {
        Header: "Rejections",
        accessor: "rejections",
        disableSortBy: true,
        Cell: ({ value }) => {
          if (!!value && value.length > 0) {
            return <div>{value.length}</div>;
          } else {
            return <div />;
          }
        },
      },
      {
        Header: "Activity",
        accessor: "activityName",

        Cell: ({ row: { original } }) => {
          if (original?.statusChangeInfo) {
            return (
              <div>
                <div>
                  Current: {original.statusChangeInfo.WorkerActivityName}
                </div>
                <div>
                  Previous:{" "}
                  {original.statusChangeInfo.WorkerPreviousActivityName}
                </div>
              </div>
            );
          } else {
            return <div>{original.activityName}</div>;
          }
        },
      },
      {
        Header: "Time in Current Activity",
        //There is no accessor for this column hence the sorting won't work
        //defaultCanSort: true,
        Cell: ({ row: { original } }) => {
          if (original?.statusChangeInfo) {
            return (
              <div>
                {formatDistanceToNow(
                  new Date(original.statusChangeInfo.Timestamp)
                )}
              </div>
            );
          } else {
            return <div />;
          }
        },
      },
      {
        Header: "Call Status",
        accessor: "lastCall",
        disableSortBy: true,
        Cell: ({ row: { original } }) => {
          if (original?.lastCall) {
            return (
              <div
                className="alert alert-dismissible alert-danger"
                style={{ width: "fit-content" }}
              >
                <div>Last Call:</div>
                <div>
                  {formatDistanceToNow(new Date(original.lastCall.Timestamp))}
                </div>
              </div>
            );
          } else if (original?.currentCall) {
            return (
              <div
                className="alert alert-dismissible alert-success"
                style={{ width: "fit-content" }}
              >
                <div>Current Call:</div>
                <div>
                  {formatDistanceToNow(
                    new Date(original.currentCall.Timestamp)
                  )}
                </div>
              </div>
            );
          } else {
            return <div />;
          }
        },
      },
      {
        Header: "",
        accessor: "sid",
        disableSortBy: true,
        Cell: ({ value }) => {
          if (user.role === "admin") {
            return (
              <div>
                <FiX
                  size={25}
                  color="red"
                  style={{
                    alignSelf: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    Swal.fire({
                      title: "Are you sure?",
                      text: "You will not be able to recover this DATA!",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Yes, delete WORKER DATA",
                      cancelButtonText: "No, sorry..my bad",
                    }).then((result) => {
                      if (result.value) {
                        deleteWorker(value);
                        Swal.fire(
                          "Deleted!",
                          "Worker data deleted from Twillio and Mongo!",
                          "success"
                        );
                      } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.fire(
                          "Cancelled",
                          "All good now! But You almost deleted a Worker! :)",
                          "error"
                        );
                      }
                    });
                  }}
                />
              </div>
            );
          } else return <div></div>;
        },
      },
    ],
    [user]
  );

  // if (user.role === "admin") {
  //   columns.push({
  //     Header: "",
  //     accessor: "sid",
  //     disableSortBy: true,
  //     Cell: ({ value }) => {
  //       return (
  //         <div>
  //           <FiX
  //             size={25}
  //             color="red"
  //             style={{
  //               alignSelf: "center",
  //               cursor: "pointer",
  //             }}
  //             onClick={() => {
  //               Swal.fire({
  //                 title: "Are you sure Knee-ga?",
  //                 text: "You will not be able to recover this WORKER'S DATA",
  //                 icon: "warning",
  //                 showCancelButton: true,
  //                 confirmButtonText: "Yes, delete WORKER DATA",
  //                 cancelButtonText: "No, sorry I am dumb",
  //               }).then((result) => {
  //                 if (result.value) {
  //                   Swal.fire(
  //                     "Deleted!",
  //                     "Worker data deleted from Twillio and Mongo!",
  //                     "success"
  //                   );
  //                 } else if (result.dismiss === Swal.DismissReason.cancel) {
  //                   Swal.fire(
  //                     "Cancelled",
  //                     "All good now! But You almost deleted a worker's DATA @sshole! :)",
  //                     "error"
  //                   );
  //                 }
  //               });
  //               //deleteWorker(value);
  //             }}
  //           />
  //         </div>
  //       );
  //     },
  //   });
  // }

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
    selectedFlatRows,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: workersData, //'data' is a reserved name for react table
      autoResetSelectedRows: false,
      getTrProps,
      initialState: {
        //Defines the initial state of the table
        selectedRowIds: result,

        sortBy: [
          //Initial sorting of the table
          {
            id: "activityName",
            desc: false,
          },
        ],
        // selectedRowIds: {
        //   0: true,
        // },
        pageSize: 8,
      },
      disableSortRemove: true,
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => {
        return [
          {
            id: "selection",
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div>
                {/* <TableToggler {...getToggleAllRowsSelectedProps()} /> */}
              </div>
            ),

            Cell: ({ row }) => {
              return (
                <div>
                  <TableToggler {...row.getToggleRowSelectedProps()} />
                </div>
              );
            },
          },
          ...columns,
        ];
      });
    }
  );

  //To Fix the "add 0 workers" bug
  if (selectedFlatRows.length > 0) {
    setHideAddButton(true);
  } else {
    setHideAddButton(false);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Func to ADD Workers to the Local Storage
  if (addToLocal === true && selectedFlatRows.length > 0) {
    let localWorkerID = [];
    let localWorkerRowID = [];

    selectedFlatRows.forEach((e) => {
      localWorkerID.push(e.original._id);
      let ID = e.id;

      localWorkerRowID.push(ID);
      //console.log("Push de:" + e.original._id);
    });
    if (localWorkerID?.length >= 0) {
      //console.log("Se escribio");

      localStorage.setItem("workerID", JSON.stringify(localWorkerID));
      localStorage.setItem("RowID", JSON.stringify(localWorkerRowID));
    }
    setAddToLocal(false);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //console.log(user);

  return pageCount > 0 ? (
    <>
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
              <tr {...row.getRowProps(getTrProps(row))}>
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

      {/* <pre>
        <code>
          {JSON.stringify(
            {
              selectedFlatRows: selectedFlatRows.map((row) => row.original._id),
            },
            null,
            2
          )}
        </code>
      </pre> */}

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
      <br />
    </>
  ) : (
    <div className="text-center p-3">
      <h3 className="text-secondary">No content with this filters...</h3>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, { deleteWorker })(Table);
