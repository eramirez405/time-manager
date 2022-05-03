import React, { useState, useEffect } from "react";
import SearchForm from "./SearchForm";
import { useTable, usePagination, useSortBy, useRowSelect } from "react-table";
import Pagination from "../Pagination";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import format from "date-fns/format";
import ReactTooltip from "react-tooltip";

const TimeReport = ({ logs, error }) => {
  const [data, setData] = useState([]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Department",
        accessor: "department",
      },
      {
        Header: "Schedule Start",
        accessor: "scheduleStart",
      },
      {
        Header: "Break time",
        accessor: "breakTime",
      },
      {
        Header: "Schedule End",
        accessor: "scheduleEnd",
      },
      {
        Header: "Attendance",
        accessor: "attendance",
        Cell: ({
          value,
          row: {
            original: { rangeOfDays },
          },
        }) => {
          if (value && rangeOfDays) {
            return `${value} / ${rangeOfDays}`;
          } else {
            return "";
          }
        },
      },
      {
        Header: "Worked Hours",
        accessor: "workedHours",
        Cell: ({
          value,
          row: {
            original: { idealScheduleWorkedHours },
          },
        }) => {
          if (value && idealScheduleWorkedHours) {
            let hours = Math.floor(value / 3600);

            return `${hours}:${new Date(value * 1000)
              .toISOString()
              .substr(14, 5)} --> ${Math.round(
              (value / idealScheduleWorkedHours) * 100
            )}%`;
          } else {
            return "";
          }
        },
      },
      {
        Header: "Worked Schedule",
        accessor: "scheduleWorkedHours",
        Cell: ({
          value,
          row: {
            original: { idealScheduleWorkedHours },
          },
        }) => {
          if (value && idealScheduleWorkedHours) {
            let hours = Math.floor(value / 3600);
            let hours1 = Math.floor(idealScheduleWorkedHours / 3600);

            return `${hours}:${new Date(value * 1000)
              .toISOString()
              .substr(14, 5)} / ${hours1}:${new Date(
              idealScheduleWorkedHours * 1000
            )
              .toISOString()
              .substr(14, 5)} --> ${Math.round(
              (value / idealScheduleWorkedHours) * 100
            )}%`;
          } else {
            return "";
          }
        },
      },
      {
        Header: "Break Avg",
        accessor: "avgBreakMin",
        Cell: ({ value }) => `${Math.round(value / 60)} min`,
      },
      {
        Header: "Away Avg",
        accessor: "avgAwayMin",
        Cell: ({ value }) => `${Math.round(value / 60)} min`,
      },
      {
        Header: "Lateness",
        accessor: "lateness",
      },
      {
        Header: "Events",
        accessor: "eventsCount",
        Cell: ({
          value,
          row: {
            original: { events, id, error },
          },
        }) => {
          if (value) {
            return (
              <span
                className="badge bg-info rounded-pill text-white"
                style={{ fontSize: "14px" }}
                data-for={id}
                data-tip={id}
              >
                {value}
                <ReactTooltip
                  id={id}
                  place="left"
                  type={!!error ? "error" : "info"}
                >
                  {events.map((e, i) => (
                    <div style={{ textAlign: "left" }} key={i}>
                      {e}
                    </div>
                  ))}
                </ReactTooltip>
              </span>
            );
          } else {
            return (
              <span
                className="badge bg-info rounded-pill text-white"
                style={{ fontSize: "14px" }}
              >
                0
              </span>
            );
          }
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (logs && logs.length) {
      const _data = logs.map((e) => {
        if (e?.status === "success") {
          let workedHours = 0;
          let breakHours = 0;
          let awayHours = 0;
          let scheduleWorkedHours = 0;
          let idealScheduleWorkedHours = 0;
          let lateness = 0;
          let events = [];
          e.daysArray.forEach((item) => {
            if (item?.clockInCounter)
              workedHours = workedHours + item.clockInCounter;
            if (item?.inScheduleClockInCounter)
              scheduleWorkedHours =
                scheduleWorkedHours + item.inScheduleClockInCounter;
            if (item?.idealScheduleTime)
              idealScheduleWorkedHours =
                idealScheduleWorkedHours + item.idealScheduleTime - 3600;
            if (item?.clockedInLate) lateness = lateness + 1;
            if (item?.breakCounter) breakHours = breakHours + item.breakCounter;
            if (item?.awayCounter) awayHours = awayHours + item.awayCounter;

            //events check
            if (!item.clockedIn) {
              events.push(
                `${format(
                  new Date(item.startDate),
                  "d/MM"
                )} - Did not clockin this day`
              );
            }
            if (!item.clockedOut) {
              events.push(
                `${format(
                  new Date(item.startDate),
                  "d/MM"
                )} - Did not clockout this day`
              );
            }
            if (item.clockIncompleteAlert) {
              events.push(
                `${format(new Date(item.startDate), "d/MM")} - ${
                  item.clockIncompleteAlert
                }`
              );
            }
          });

          return {
            id: e._id,
            name: e.name,
            department: e.department,
            scheduleStart: e.scheduleStart,
            scheduleEnd: e.scheduleEnd,
            breakTime: e.breakTime,
            workedHours: workedHours - breakHours,
            scheduleWorkedHours: scheduleWorkedHours - breakHours,
            idealScheduleWorkedHours: idealScheduleWorkedHours,
            attendance: e.daysWithActivities,
            lateness,
            breakHours,
            avgBreakMin: breakHours / e.daysWithActivities,
            awayHours,
            avgAwayMin: awayHours / e.daysWithActivities,
            rangeOfDays: e.rangeOfDays,
            events,
            eventsCount: events.length,
          };
        } else {
          return {
            id: e._id,
            name: e.name,
            department: e.department,
            scheduleStart: e.scheduleStart,
            scheduleEnd: e.scheduleEnd,
            breakTime: e.breakTime,
            error: e.message,
            events: [e.message],
            eventsCount: 1,
          };
        }
      });

      setData(_data);
    }
  }, [logs]);

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
  } = useTable({ columns, data }, useSortBy, usePagination, useRowSelect);

  return (
    <div>
      <SearchForm />
      <br />
      {pageCount > 0 && !error ? (
        <>
          <table {...getTableProps()} className="table table-hover">
            <thead className="bg-dark text-white">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
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
              {page.map((row) => {
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
        </>
      ) : (
        <div className="text-center p-3">
          <h3 className="text-secondary">{error ? error : "No content..."} </h3>
        </div>
      )}
    </div>
  );
};

TimeReport.propTypes = {
  logs: PropTypes.array.isRequired,
  error: PropTypes.string,
};

const mapStateToProps = (state) => ({
  logs: state.timeSummary.timeReport,
  error: state.timeSummary.timeReportError,
});

export default connect(mapStateToProps, {})(TimeReport);
