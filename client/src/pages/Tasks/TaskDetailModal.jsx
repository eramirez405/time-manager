import React, { useEffect, useState } from "react";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import Modal from "react-modal";
import { useTable, usePagination } from "react-table";
import Pagination from "./Pagination";
import { getChatMessages } from "../../actions/tasks";
import { onlyUnique } from "../../utils";
import styled from "styled-components";
import Loader from "react-loader-spinner";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
const TaskDetailModal = (props) => {
  const { isOpen, task } = props;
  task.reservations = task.reservations.filter((e) => e !== null);

  console.log(task);

  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState(null);
  const [recordingId, setRecordingId] = useState(null);
  const [chatChannel, setChatChannel] = useState(null);
  const [data, setData] = useState([]);

  const getMessages = async (workFlow, service) => {
    const result = await getChatMessages(workFlow, service);
    if (result.length) {
      const talkersInvolved = result
        .map((item) => item.from)
        .filter(onlyUnique);
      const agentsInvolved = talkersInvolved.filter(
        (item) => item.indexOf("ualett") !== -1
      );
      const messagesTransformed = result.map((item) => {
        const from = agentsInvolved.includes(item.from) ? "agent" : "client";
        const fromName = agentsInvolved.includes(item.from)
          ? item?.from.slice(0, item?.from.indexOf("_40")).replace("_2E", " ")
          : task?.attributes?.name;
        return {
          from,
          fromName,
          body: item.body,
          dateCreated: item.dateCreated,
        };
      });

      setMessages(messagesTransformed);
    } else {
      setMessages(null);
    }
  };

  useEffect(() => {
    if (task?.attributes?.channelSid && task?.workflowSid) {
      getMessages(task?.workflowSid, task?.attributes?.channelSid);
    }

    if (
      task?.taskChannelUniqueName === "voice" &&
      !!task?.attributes?.conversations?.segment_link
    ) {
      setRecordingId(
        task?.attributes?.conversations?.segment_link.substring(
          task?.attributes?.conversations?.segment_link.indexOf("Recordings/") +
            "Recordings/".length,
          task?.attributes?.conversations?.segment_link.length
        )
      );
    }
    setChannel(!!task?.taskChannelUniqueName);
    if (task?.attributes?.channelSid) {
      setChatChannel(task?.attributes?.channelSid);
    }

    if (!!task?.reservations && task.reservations.length > 0) {
      setData(task.reservations);
    }
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "Date",
        accessor: "dateCreated",
        Cell: ({ value }) => (
          <span className="text-primary" style={{ cursor: "pointer" }}>
            {format(new Date(value), "dd/MM/yyyy hh:mm:ss aaaa")}
          </span>
        ),
      },
      {
        Header: "Reservation Status",
        accessor: "reservationStatus",
        Cell: ({ value }) => {
          const res = !!value ? value : "completed";
          return res;
        },
      },
      {
        Header: "Worker Name",
        accessor: "workerName",
      },
      {
        Header: "Age",
        accessor: "age",
        Cell: ({ value }) => {
          //console.log(value);
          if (value) {
            return new Date(value * 1000).toISOString().substr(11, 8);
          } else {
            return "00:00:00";
          }
        },
      },
    ],
    []
  );

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
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 4 },
    },
    usePagination
  );

  if (task) {
    return (
      <Modal
        isOpen={isOpen}
        {...props}
        style={{
          content: { overflow: "visible" },
          overlay: { background: "rgb(105 105 105 / 75%)" },
        }}
        ariaHideApp={false}
        contentLabel="Task Detail"
      >
        <div
          style={{
            padding: "20px 30px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            className="text-info"
            style={{ borderBottom: "1px solid #dad9d9" }}
          >
            Task Details
          </h2>
          <br />
          <div className="row">
            <div className="col-md-6">
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Date Created</strong>
                  <span
                    className="badge badge-primary badge-pill"
                    style={{ fontSize: "95%" }}
                  >
                    {format(
                      new Date(task?.dateCreated),
                      "dd/MM/yyyy hh:mm:ss aaaa"
                    )}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Assignment Status</strong>
                  <span
                    className="badge badge-primary badge-pill"
                    style={{ fontSize: "95%" }}
                  >
                    {task?.assignmentStatus}
                  </span>
                </li>
                {channel !== "chat" ? (
                  <>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Direction</strong>
                      <span
                        className="badge badge-primary badge-pill"
                        style={{ fontSize: "95%" }}
                      >
                        {task?.attributes?.direction}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <strong>From</strong>
                      <span
                        className="badge badge-primary badge-pill"
                        style={{ fontSize: "95%" }}
                      >
                        {task?.attributes?.from}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <strong>To</strong>
                      <span
                        className="badge badge-primary badge-pill"
                        style={{ fontSize: "95%" }}
                      >
                        {task?.attributes?.outbound_to}
                      </span>
                    </li>
                    {task?.attributes?.request && (
                      <>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <strong>New Client</strong>
                          <span
                            className="badge badge-primary badge-pill"
                            style={{ fontSize: "95%" }}
                          >
                            {task?.attributes?.isNewClient === "true" && "yes"}
                            {task?.attributes?.isNewClient === "false" && "no"}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Request</strong>
                          <span
                            className="badge badge-primary badge-pill"
                            style={{ fontSize: "95%" }}
                          >
                            {task?.attributes?.request}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Language</strong>
                          <span
                            className="badge badge-primary badge-pill"
                            style={{ fontSize: "95%" }}
                          >
                            {task?.attributes?.language}
                          </span>
                        </li>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {task?.attributes?.Link && (
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <strong>Link</strong>
                        <a
                          href={task?.attributes?.Link}
                          target="_blank"
                          className="badge badge-primary badge-pill"
                          style={{ fontSize: "95%", cursor: "pointer" }}
                        >
                          {task?.attributes?.Link}
                        </a>
                      </li>
                    )}

                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Name</strong>
                      <span
                        className="badge badge-primary badge-pill"
                        style={{ fontSize: "95%", cursor: "pointer" }}
                      >
                        {task?.attributes?.name}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Origen</strong>
                      <span
                        className="badge badge-primary badge-pill"
                        style={{ fontSize: "95%", cursor: "pointer" }}
                      >
                        {task?.attributes?.origen}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Task Channel</strong>
                  <span
                    className="badge badge-primary badge-pill"
                    style={{ fontSize: "95%" }}
                  >
                    {task?.taskChannelUniqueName}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Task Queue</strong>
                  <span
                    className="badge badge-primary badge-pill"
                    style={{ fontSize: "95%" }}
                  >
                    {task?.taskQueueFriendlyName}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Workflow</strong>
                  <span
                    className="badge badge-primary badge-pill"
                    style={{ fontSize: "95%" }}
                  >
                    {task?.workflowFriendlyName}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Worker</strong>
                  <span
                    className="badge badge-primary badge-pill"
                    style={{ fontSize: "95%" }}
                  >
                    {task?.workerName}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Age</strong>
                  <span
                    className="badge badge-primary badge-pill"
                    style={{ fontSize: "95%" }}
                  >
                    {task?.age
                      ? `${new Date(task.age * 1000)
                          .toISOString()
                          .substr(11, 8)}`
                      : "NA"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <br />
          <h4 className="text-info">Reservations</h4>
          {pageCount > 0 && (
            <>
              <table {...getTableProps()} className="table table-hover">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th {...column.getHeaderProps()}>
                          {column.render("Header")}
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
                            <td {...cell.getCellProps()}>
                              {cell.render("Cell")}
                            </td>
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
          )}

          {!!recordingId && (
            <>
              <h4 className="text-info">Recording</h4>
              <hr />
              <div>
                <audio
                  controls
                  src={`https://api.twilio.com/2010-04-01/Accounts/ACf4d73df364dfb3649b2fedc5b95f8ee8/Recordings/${recordingId}`}
                >
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>
              </div>
            </>
          )}

          {chatChannel && (
            <>
              <br />
              <h4 className="text-info">Messages</h4>
              <hr />
              {messages?.status ? (
                <div>
                  <h5>Data not found</h5>
                </div>
              ) : messages.length ? (
                <MessagesWrapper>
                  <div className="px-3">
                    {messages.map((item) => (
                      <div
                        className={`row mb-1 ${
                          item.from === "agent" ? " justify-content-end" : ""
                        }`}
                      >
                        <div
                          className={`col-md-6 ${
                            item.from === "agent"
                              ? "agentDialog"
                              : "customerDialog"
                          }`}
                        >
                          <div className="d-flex justify-content-between">
                            <div className="chatFrom">{item.fromName}</div>
                            <div className="time">
                              {isValid(new Date(item?.dateCreated)) &&
                                format(
                                  new Date(item?.dateCreated),
                                  "hh:mm aaa"
                                )}
                            </div>
                          </div>

                          <div>{item.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </MessagesWrapper>
              ) : (
                <Loader
                  style={{
                    margin: "auto",
                    width: "0%",
                    padding: "10px",
                  }}
                  type="BallTriangle"
                  color="#00BFFF"
                  height={100}
                  width={100}
                />
              )}
            </>
          )}
        </div>
      </Modal>
    );
  } else {
    return <div />;
  }
};

export default TaskDetailModal;

const MessagesWrapper = styled.div`
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  .customerDialog {
    padding: 10px;
    background: #3778f5;
    color: white;
    border-radius: 5px;
  }

  .agentDialog {
    padding: 10px;
    background: #57bfff;
    color: white;
    border-radius: 5px;
  }

  .chatFrom {
    font-weight: bold;
    border-bottom: 1px solid white;
    width: fit-content;
  }
`;
