import Modal from "react-modal";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FiChevronRight, FiCalendar } from "react-icons/fi";
import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";
import format from "date-fns/format";
import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";
const AllNoteModal = (props) => {
  const { isOpen } = props;
  const { onRequestClose } = props;
  const { user } = props;
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [ImpData, setImpData] = useState([]);

  const onSubmit = async (e) => {
    // console.log("Execute");
    var axios = require("axios");
    var data = JSON.stringify({
      StartDate: startDate,
      EndDate: endDate,
    });

    var config = {
      method: "post",
      url: "http://localhost:5000/api/users/GetAllNotes",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        //console.log(JSON.stringify(response.data));
        setImpData(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  useEffect(() => {
    onSubmit();
  }, []);
  return (
    <Modal
      isOpen={isOpen}
      {...props}
      //{...props}
      style={{
        display: "block",
        content: {
          overflow: "visible",
          height: "87%",
          width: "76%",
          margin: "auto",
          backgroundColor: "white",
          borderRadius: "20px",
          borderColor: "transparent",
        },
        overlay: { background: "rgb(105 105 105 / 75%)" },
      }}
      ariaHideApp={false}
      contentLabel="Task Detail"
    >
      <>
        <fieldset
          style={{
            borderColor: "red",
            borderWidth: "4px",
            borderRadius: "10px",
          }}
        >
          <div style={{ margin: "0 auto", marginLeft: "39px" }}>
            <div style={{ marginTop: "20px", marginRight: "40px" }}>
              <FiCalendar size={25} />
            </div>
            <div style={{ marginLeft: "35px", marginTop: "-22px" }}>
              <span>From:</span>
              <div style={{ marginLeft: "48px", marginTop: "-24px" }}>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <div style={{ marginLeft: "235px", marginTop: "-29px" }}>
                <span>To:</span>
                <div style={{ marginLeft: "30px", marginTop: "-25px" }}>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
                <div style={{ marginLeft: "208px", marginTop: "-32px" }}>
                  <button
                    className="btn btn-info mx-1 p-1"
                    onClick={() => onSubmit()}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
        <br />
        <body style={{ width: "1000px", overflow: "scroll", height: "801px" }}>
          <div className="container">
            <div>
              <div className="d-flex flex-lg-wrap ">
                {ImpData?.map((element) => {
                  return (
                    <>
                      {element.DateNote.map((e) => {
                        return e.formatDateSis;
                      }) != null ? (
                        <>
                          <div
                            class="card border-secondary mb-3 col-4 mr-4"
                            key={element._id._id}
                            style={{ maxWidth: "18rem" }}
                          >
                            <div
                              class="card-header"
                              style={{ width: "286px", marginLeft: "-15px" }}
                            >
                              Today Notes
                            </div>
                            <div class="card-body">
                              <div style={{ fontWeight: "bold" }}>
                                {" "}
                                {element._id._id}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  fontWeight: "bold",
                                  justifyContent: "space-between",
                                  borderBottom:
                                    "1px solid rgb(128 128 128 / 48%)",
                                }}
                              >
                                <div>Note</div>
                                <div>Time</div>
                              </div>
                              {element?.DateNote.filter(
                                (item) => !item.formatDateSis
                              ).map((e) => {
                                return (
                                  <>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #8080802e",
                                      }}
                                    >
                                      <div>{e.note}</div>
                                      <br />
                                      <div>
                                        {e?.timestamp &&
                                          format(
                                            new Date(e?.timestamp),
                                            "hh:mm aaaa"
                                          )}
                                      </div>
                                    </div>
                                  </>
                                );
                              })}
                              {element.DateNote.map((e) => {
                                return e.formatDateSis;
                              }) != null ? (
                                <>
                                  <p class="card-text">
                                    <span style={{ fontWeight: "bold" }}>
                                      Date:{element._id.timestamp}
                                    </span>
                                  </p>
                                </>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {element.DateNote.map((e) => {
                        return e.FormatDate;
                      }) != null ? (
                        <>
                          <div
                            class="card border-secondary mb-3 col-4 mr-4"
                            key={element._id._id}
                            style={{ maxWidth: "18rem" }}
                          >
                            <div
                              class="card-header"
                              style={{ width: "286px", marginLeft: "-15px" }}
                            >
                              Today Issue Notes
                            </div>
                            <div class="card-body">
                              <div style={{ fontWeight: "bold" }}>
                                {" "}
                                {element._id._id}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  fontWeight: "bold",
                                  justifyContent: "space-between",
                                  borderBottom:
                                    "1px solid rgb(128 128 128 / 48%)",
                                }}
                              >
                                <div>Note</div>
                                <br />
                                <div>IssueStart</div>
                                <br />
                                <div> IssueEnd</div>
                                <br />
                              </div>
                              {element?.DateNote.filter(
                                (item) => !item.FormatDate
                              ).map((e) => {
                                return (
                                  <>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #8080802e",
                                      }}
                                    >
                                      <div>{e.SisNotes}</div>
                                      <div>{e.SisStar}</div>
                                      <br />
                                      <div>{e.SisEnd}</div>
                                    </div>
                                  </>
                                );
                              })}
                              <p class="card-text">
                                <span style={{ fontWeight: "bold" }}>
                                  Date:
                                  {element._id.timestamp}
                                </span>
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>
        </body>
      </>
    </Modal>
  );
};

export default AllNoteModal;
{
  /* <div
                      class="card text-dark bg-secondary mb-3 col-4 mr-4"
                      style={{ maxWidth: "18rem" }}
                    >
                      <div class="card-header">{element._id._id}</div>
                      <div class="card-body">
                        {element?.DateNote.map((e) => {
                          return (
                            <p class="card-title">
                              <span style={{ fontWeight: "bold" }}>Note:</span>
                              {e.note}
                              <br />{" "}
                              <span style={{ fontWeight: "bold" }}>
                                Time:
                              </span>{" "}
                              {getHours(new Date(e.timestamp))}:
                              {getMinutes(new Date(e.timestamp))}
                            </p>
                          );
                        })}

                        <p class="card-text">
                          <span style={{ fontWeight: "bold" }}>Date:</span>
                          {element._id.timestamp}
                        </p>
                      </div>
                    </div> */
}
