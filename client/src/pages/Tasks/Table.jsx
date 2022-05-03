import React from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import format from "date-fns/format";
import Pagination from "./Pagination";
import { FiVoicemail } from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";
import { HiArrowNarrowRight } from "react-icons/hi";
import { AiFillPhone }  from "react-icons/ai";
import { TiMinus } from "react-icons/ti";
import { ImPhoneHangUp } from "react-icons/im";

const Table = ({
  data,
  setTask,
  openModal,
  user,
  channel,
  direction,
  filter,
  tasks,
}) => {
  const data1 = data?.map((e) => {
    let HT = 0;
    e.reservations.forEach((i) => {
      if (i?.reservationStatus === "completed" && i.age !== undefined) {
        HT = HT + i.age;
      }
    });
    e.ht = new Date(HT * 1000).toISOString().substr(11, 8);

    return e;
  });

  const columns = React.useMemo(() => {
    switch (channel?.value) {
      case "chat":
        return [
          {
            Header: "Date",
            accessor: "dateCreated",
            Cell: (row) => (
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  openModal();
                  setTask(row?.row?.original);
                }}
              >
                {format(new Date(row.value), "dd/MM/yyyy hh:mm:ss aaaa")}
              </span>
            ),
          },
          {
            Header: "Name",
            accessor: (row) => {
              if (row?.attributes?.Link === "") {
                return row?.attributes?.name;
              } else {
                return row?.attributes?.Link;
              }
            },
            Cell: (value) => {
              if (value?.row?.original?.attributes?.origen === "App") {
                return (
                  <a
                    href={`${value?.row?.original?.attributes?.Link}`}
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                  >
                    {value?.row?.original?.attributes?.Link}
                  </a>
                );
              } else {
                return value?.row?.original?.attributes?.name;
              }
            },
          },
          {
            Header: "Status",
            accessor: "assignmentStatus",
          },
          {
            Header: "Task Channel",
            accessor: "taskChannelUniqueName",
          },
          {
            Header: "Origin",
            accessor: "attributes.origen",
            Cell: ({ value }) => {
              if (value !== "App") {
                return "Website";
              } else {
                return value;
              }
            },
          },
          {
            Header: "Worker",
            accessor: (row) => {
              if (row?.workerName === null || row?.workerName === undefined) {
                return row?.reservations[row?.reservations?.length - 1]
                  ?.workerName;
              } else {
                return row?.workerName;
              }
            },
          },
          {
            Header: "Age (HH:MM:SS)",
            accessor: "age",
            Cell: ({ value }) => {
              if (value) {
                return new Date(value * 1000).toISOString().substr(11, 8);
              } else {
                return "";
              }
            },
          },
          {
            Header: "HT",
            accessor: "ht",
            //Data coming from HT snippet
          },
        ];
      case "callback":
        return [
          {
            Header: "Date",
            accessor: "dateCreated",
            Cell: (row) => (
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  openModal();
                  setTask(row?.row?.original);
                }}
              >
                {format(new Date(row.value), "dd/MM/yyyy hh:mm:ss aaaa")}
              </span>
            ),
          },
          {
            Header: "Status",
            accessor: "assignmentStatus",
          },
          {
            Header: "Direction",
            accessor: "attributes.direction",
          },
          {
            Header: "To",
            accessor: "attributes.from",
          },
          {
            Header: "Task Channel",
            accessor: "taskChannelUniqueName",
          },
          {
            Header: "Worker",
            accessor: (row) => {
              if (row?.workerName === null || row?.workerName === undefined) {
                return row?.reservations[row?.reservations?.length - 1]
                  ?.workerName;
              } else {
                return row?.workerName;
              }
            },
          },
          {
            Header: "Age (HH:MM:SS)",
            accessor: "age",
            Cell: ({ value }) => {
              // let Hours = Math.floor((value / 3600));
              // let Minutes = Math.floor(((value / 3600) % 1) * 60);
              // let Seconds = Math.floor((((value / 3600) % 1) * 60) % 1) * 60;

              if (value) {
                //Returns a Date Object (YYYY-MM-DDTHH:mm:ss.sssZ) using 'value' in seconds
                //Then converts it to string and gets the substring HH:mm:ss
                return new Date(value * 1000).toISOString().substr(11, 8);
              } else {
                return "";
              }
            },
          },
          {
            Header: "HT",
            accessor: "ht",
            //Data coming from HT snippet
          },
          {
            Header: "Contacted",
            accessor: "attributes.contacted",
            Cell: ({ value }) => {
              if (value) {
                return <AiFillPhone className="ml-4" size={20} />;
              } else {
                return <div />;
              }
            },
          }
        ];
      default:
        const _table = [
          {
            Header: "Date",
            accessor: "dateCreated",
            Cell: (row) => (
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  openModal();
                  setTask(row?.row?.original);
                }}
              >
                {format(new Date(row.value), "dd/MM/yyyy hh:mm:ss aaaa")}
              </span>
            ),
          },
          {
            Header: "Status",
            accessor: "assignmentStatus",
          },
          {
            Header: "Direction",
            accessor: "attributes.direction",
          },
          {
            Header: "From",
            accessor: "attributes.from",
          },
          {
            Header: "To",
            accessor: "attributes.outbound_to",
          },
          {
            Header: "Task Channel",
            accessor: "taskChannelUniqueName",
          },
          {
            Header: "Worker",
            accessor: (row) => {
              if (row?.workerName === null || row?.workerName === undefined) {
                return row?.reservations[row?.reservations?.length - 1]
                  ?.workerName;
              } else {
                return row?.workerName;
              }
            },
            // Cell: ({ value }) => {
            //   return value;
            // },
          },
          {
            Header: "Age (HH:MM:SS)",
            accessor: "age",
            Cell: ({ value }) => {
              // let Hours = Math.floor((value / 3600));
              // let Minutes = Math.floor(((value / 3600) % 1) * 60);
              // let Seconds = Math.floor((((value / 3600) % 1) * 60) % 1) * 60;

              if (value) {
                //Returns a Date Object (YYYY-MM-DDTHH:mm:ss.sssZ) using 'value' in seconds
                //Then converts it to string and gets the substring HH:mm:ss
                return new Date(value * 1000).toISOString().substr(11, 8);
              } else {
                return "";
              }
            },
          },
          {
            Header: "HT",
            accessor: "ht",
            //Data coming from HT snippet
          },
          {
            Header: "Recording",
            accessor: "attributes.conversations",
            Cell: ({ value }) => {
              if (!!value) {
                return <FiVoicemail className="ml-4" size={20} />;
              } else {
                return <div />;
              }
            },
          },
          {
            Header: "Queue",
            accessor: "taskQueueFriendlyName",
          },
          {
            Header: "Call Type",
            accessor: "callReason",
            Cell: ({ value }) => {
              if (!!value) {
                return value;
              } else {
                return <TiMinus className="ml-5" size={20}/>;
              }
            },
          },
          {
            Header: "Hang Up",
            accessor: "hangUp",
            Cell: ({ value }) => {
              if (!!value) {
                return <ImPhoneHangUp className="ml-5" size={20}/>;
              } else {
                return <TiMinus className="ml-5" size={20}/>;
              }
            },
          },
        ];
        if (!!direction || direction === null) {
          _table.push({
            Header: "Contact",
            Cell: (value) => {
              if (value.row.original.reservations.length > 1) {
                return <BiTransfer className="ml-4" size={20} />;
              } else {
                return <HiArrowNarrowRight className="ml-4" size={20} />;
              }
            },
            //Data coming from HT snippet
          });
          return _table;
        } else {
          return _table;
        }
    }
  }, [tasks]);

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
  } = useTable({ columns, data }, useSortBy, usePagination);

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
            data={data.length}
            //data={data}  //Passing the array data to the Pagination component
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

export default Table;
