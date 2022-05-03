import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { subDays } from "date-fns";
import axios from "axios";
import { isAfter, isBefore } from "date-fns";
import DatePicker from "react-datepicker";
import XLSX from "xlsx";
import moment from "moment";

const ActivityExportModal = (props) => {
  const { isOpen } = props;
  const { onRequestClose } = props;
  const [validation, setValidation] = useState("");
  const [disabledButton, setDisabledButton] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    subDays(new Date().setHours(0, 0, 0, 0), 30)
  );

  const downloadActivities = async (e) => {
    e.preventDefault();
    if (isAfter(startDate, endDate) || isBefore(endDate, startDate)) {
      setValidation("Please fix dates!");
    } else {
      setDisabledButton(true);
      setValidation("Wait a moment please..Preparing files...");

      var rangoFecha = JSON.stringify({
        startDate: startDate,
        endDate: endDate,
      });

      var config = {
        method: "post",
        url: "/api/workerActivityEvent",
        headers: {
          //'': '',
          "Content-Type": "application/json",
        },
        data: rangoFecha,
      };

      axios(config)
        .then(function (response) {
          //console.log(JSON.stringify(response.data));

          //Func to download Excel File for Workers activities
          const newItem = response.data.map((key) => ({
            //Creating the structure for the excel file from the data
            Worker: key.WorkerName,
            WorkerActivity: key.WorkerActivityName,
            PreviousActivity: key.WorkerPreviousActivityName,
            createdDate: moment(key.createdAt).format("L"),
            createdTime: moment(key.createdAt).format("LTS"),
            Description: key.EventDescription,
          }));

          const ws = XLSX.utils.json_to_sheet(newItem); //Convert Json(data) to Excel work sheet
          const wb = XLSX.utils.book_new(); //Create a new Excel Workbook(like a folder)
          XLSX.utils.book_append_sheet(wb, ws, "WorkersActivities"); //Assign a name to the Excel sheet and putting it inside the Workbook
          XLSX.writeFile(wb, "WorkersMonthlyData.xlsx"); //Exporting the workbook with the data as an Excel file.
          //End of Func
          //setValidation("");
          onRequestClose();
        })
        .catch(function (error) {
          setValidation(error.reason);
          setInterval(() => {
            setValidation("");
          }, 5000);

          console.log(error);
        });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      {...props}
      style={{
        content: {
          backgroundColor: "#02325f",
          overflow: "auto",
          height: "40%",
          width: "40%",
          borderRadius: "1rem",
          margin: "auto",
          padding: "auto",
        },
        overlay: { background: "rgb(105 105 105 / 75%)" },
      }}
      ariaHideApp={false}
      contentLabel="All activities Detail"
    >
      <div>
        <h1 style={{ textAlign: "center", color: "white" }}>
          Download Workers Data
        </h1>
      </div>
      {/* //////////////////////////////////////// */}
      <div
        style={{
          backgroundColor: "white",
          overflow: "auto",
          margin: "1rem",
          borderRadius: "1rem",
          borderColor: "red",
          height: "22rem",
        }}
      >
        <form
          onSubmit={downloadActivities}
          className="RootContainer"
          style={{
            display: "flex",
            //padding: 'auto',
            marginTop: "1rem",
            justifyContent: "center",
            flexDirection: "column",
            backgroundColor: "transparent",
          }}
        >
          <h3
            style={{
              color: "#033c73",
              alignSelf: "center",
              paddingTop: "0.5rem",
            }}
          >
            Select the Date Range:
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              backgroundColor: "transparent",
            }}
          >
            <br></br>

            <div style={{ padding: "auto" }}>
              <label style={{ paddingRight: "10px" }} htmlFor="startDate">
                From:
              </label>

              <DatePicker
                id="startDate"
                style={{
                  marginTop: "2rem",
                  padding: "auto",
                  alignSelf: "center",
                }}
                minDate={subDays(new Date(), 30)}
                maxDate={new Date()}
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setValidation("");
                }}
                dateFormat="MMMM d, yyyy h:mm aa "
                showTimeSelect
                timeFormat="hh:mm a"
                timeIntervals={30}
                timeCaption="time"
                className="form-control"
              />
            </div>
            <div>
              <label
                style={{ marginLeft: "3rem", paddingRight: "10px" }}
                htmlFor="endDate"
              >
                To:
              </label>

              <DatePicker
                id="endDate"
                style={{ marginTop: "2rem", alignSelf: "center" }}
                minDate={subDays(new Date(), 30)}
                maxDate={new Date()}
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setValidation("");
                }}
                dateFormat="MMMM d, yyyy h:mm aa "
                showTimeSelect
                timeFormat="hh:mm a"
                timeIntervals={30}
                timeCaption="time"
                className="form-control"
              />
            </div>
          </div>
          <button
            disabled={disabledButton}
            type="submit"
            style={{
              fontSize: "1.5rem",
              alignSelf: "center",
              margin: "4rem auto auto auto",
              padding: "0.3rem",
              width: "30%",
              backgroundColor: disabledButton ? "gray" : "#02325f",
              borderRadius: "10px",
              color: "white",
            }}
          >
            Download
          </button>
          <p
            style={{
              margin: "1rem auto auto auto",
            }}
          >
            <p className="text-danger">{validation}</p>
            {/* <small className="text-success">{success}</small> */}
          </p>
        </form>
      </div>
    </Modal>
  );
};

export default ActivityExportModal;
