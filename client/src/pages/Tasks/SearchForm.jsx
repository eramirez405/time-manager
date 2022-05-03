import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTasks } from "../../actions/tasks";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { FiChevronRight, FiDownload } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";
import startOfDay from "date-fns/startOfDay";
import "react-datepicker/dist/react-datepicker.css";
import XLSX from "xlsx";
import moment from "moment";

const options = [
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
];

const optionsTwo = [
  { value: "viewAll", label: "View All" },
  { value: "direct", label: "Direct" },
  { value: "transferred", label: "Transferred" },
];

const channelOptions = [
  { value: "voice", label: "Voice" },
  { value: "voicemail", label: "Voicemail" },
  { value: "callback", label: "Callback" },
  { value: "chat", label: "Chat" },
];

const SearchForm = ({
  loading,
  getTasks,
  data,
  channel,
  setChannel,
  direction,
  setDirection,
  filter,
  setFilter,
  department,
}) => {
  const getDataToInvestigation = () => {
    const _data = data.filter((e) =>
      e?.workflowFriendlyName?.toString().includes("Assign to I&D")
    );
    return _data;
  };

  //Func to download Excel File
  const ExportExcel = async () => {
    const convertToXMLX = (elements) => {
      const ws = XLSX.utils.json_to_sheet(elements); //Convert Json(data) to Excel work sheet
      const wb = XLSX.utils.book_new(); //Create a new Excel Workbook(like a folder)
      XLSX.utils.book_append_sheet(wb, ws, "Lista"); //Assign a name to the Excel sheet and putting it inside the Workbook
      XLSX.writeFile(wb, "Data importada.xlsx"); //Exporting the workbook with the data as an Excel file.
    };

    const newItem = data.map((key) => {
      switch (channel.value) {
        case "chat":
          return {
            Date: moment(key.dateCreated).format("L"),
            Time: moment(key.dateCreated).format("LTS"),
            Name:
              key?.attributes?.Link === ""
                ? key?.attributes?.name
                : key?.attributes?.Link,

            Status: key.assignmentStatus,
            TaskChannel: key.taskChannelUniqueName,
            Origin:
              key?.attributes?.origen !== "App"
                ? "Website"
                : key?.attributes?.origen,
            Worker:
              key?.workerName === null || key?.workerName === undefined
                ? key?.reservations[key.reservations.length - 1]?.workerName
                : key?.workerName,
            Age: new Date(key.age * 1000).toISOString().substr(11, 8),
            HT: key?.ht,
          };
        case "voice":
          return {
            Date: moment(key.dateCreated).format("L"),
            Time: moment(key.dateCreated).format("LTS"),
            Status: key.assignmentStatus,
            Direction: key.attributes.direction,
            From: key.attributes.from,
            To: key.attributes.outbound_to,
            TaskChannel: key?.taskChannelUniqueName,
            Worker:
              key?.workerName === null || key?.workerName === undefined
                ? key?.reservations[key.reservations.length - 1]?.workerName
                : key?.workerName,
            Age: new Date(key.age * 1000).toISOString().substr(11, 8),
            HT: key?.ht,
            Queue: key.taskQueueFriendlyName,
            New_Client:
              key.attributes.isNewClient === "true"
                ? "yes"
                : key.attributes.isNewClient === "false"
                ? "no"
                : "",
            Request: key.attributes.request,
            language: key.attributes.language,
            Queue: key.taskQueueFriendlyName,
            Worker: key.workerName,
            callReason: key?.callReason
          };
        case "voicemail":
          return {
            Date: moment(key.dateCreated).format("L"),
            Time: moment(key.dateCreated).format("LTS"),
            Status: key.assignmentStatus,
            Direction: key.attributes.direction,
            From: key.attributes.from,
            To: key.attributes.outbound_to,
            TaskChannel: key?.taskChannelUniqueName,
            Worker:
              key?.workerName === null || key?.workerName === undefined
                ? key?.reservations[key.reservations.length - 1]?.workerName
                : key?.workerName,
            Age: new Date(key.age * 1000).toISOString().substr(11, 8),
            HT: key?.ht,
            Queue: key.taskQueueFriendlyName,
          };
        case "callback":
          return {
            Date: moment(key.dateCreated).format("L"),
            Time: moment(key.dateCreated).format("LTS"),
            Status: key.assignmentStatus,
            Direction: key.attributes.direction,
            From: key.attributes.from,
            TaskChannel: key?.taskChannelUniqueName,

            Worker:
              key?.workerName === null || key?.workerName === undefined
                ? key?.reservations[key.reservations.length - 1]?.workerName
                : key?.workerName,
            Age: new Date(key.age * 1000).toISOString().substr(11, 8),
            HT: key?.ht,
          };
      }
    });

    convertToXMLX(newItem);
  };
  //End of Func

  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(new Date());

  const [name, setName] = useState("");
  const [transferredType, setTransferredType] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [worker, setWorker] = useState("");

  useEffect(() => {
    if (direction?.value === "outbound") {
      setTransferredType("");
    }
  }, [direction]);

  useEffect(() => {
    getTasks({
      startDate,
      endDate,
      direction: channel?.value === "voice" ? direction?.value : null,
      fromNumber: fromNumber.replace("+", ""),
      toNumber: toNumber.replace("+", ""),
      worker,
      channel: channel?.value,
      name,
    });
  }, [getTasks]);

  return (
    <div
      className="row"
      style={{
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      <div
        className="DateFilterContainer"
        style={{
          display: "flex",
          flexwrap: "nowrap",
          minWidth: "auto",
          justifyContent: "space-between",
          marginLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        <span style={{ margin: "10px 1rem 0rem 10px" }}>From :</span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          showTimeSelect
          timeFormat="hh:mm a"
          timeIntervals={30}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
          className="form-control"
        />

        <span style={{ margin: "10px 1rem 0rem 2rem" }}>To :</span>
        <DatePicker
          selected={endDate}
          style={{}}
          onChange={(date) => setEndDate(date)}
          showTimeSelect
          timeFormat="hh:mm a"
          timeIntervals={30}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
          className="form-control"
        />
      </div>

      <div
        className="ChannelContainer"
        style={{
          margin: "0 1rem 0 1rem",
          //backgroundColor:"purple",
          minWidth: "20rem",
          fontweight: "700",
          color: "#444",
          lineheight: "1.3",
          padding: "0em 1.4em .5em .8em",
          //width: "100%",
          maxwidth: "100%",
        }}
      >
        <Select
          className={"select"}
          placeholder="Channel..."
          value={channel}
          onChange={(value) => {
            setChannel(value);
            setFromNumber("");
            setToNumber("");
            setName("");
          }}
          options={channelOptions}
        />
      </div>

      {/* <div className='col-md-12 col-lg-5 col-xl-2' style={{
        marginLeft: "-30rem",
        marginRight: "5rem",
      }}>
      </div> */}

      {/* If channel.value is = to voice */}
      {channel?.value === "voice" && (
        <div
          className="SelectContainer"
          style={{
            margin: "0 1rem 0 1rem",
            //backgroundColor:"purple",
            minWidth: "20rem",
            fontweight: "700",
            color: "#444",
            lineheight: "1.3",
            padding: "0em 1.4em .5em .8em",
            //width: "100%",
            maxwidth: "100%",
          }}
        >
          <Select
            isClearable
            className={"select"}
            placeholder="Show..."
            value={direction}
            onChange={(value) => setDirection(value)}
            options={options}
          />
        </div>
      )}
      {direction?.value === "inbound" && channel?.value === "voice" && (
        <div
          className="SelectContainer"
          style={{
            margin: "0 1rem 0 1rem",
            //backgroundColor:"purple",
            minWidth: "20rem",
            fontweight: "700",
            color: "#444",
            lineheight: "1.3",
            padding: "0em 1.4em .5em .8em",
            //width: "100%",
            maxwidth: "100%",
          }}
        >
          <Select
            className={"select"}
            placeholder="Select type..."
            value={transferredType}
            onChange={(value) => {
              setTransferredType(value);
            }}
            options={optionsTwo}
          />
        </div>
      )}

      {channel?.value !== "chat" && channel?.value !== "callback" && (
        <div
          className="NumberFilterContainer"
          style={{
            display: "flex",
            //backgroundColor:"pink",
            marginLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <span style={{ margin: "10px 1rem 0rem 10px" }}>From#:</span>
          <input
            type="text"
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
            className="form-control"
            style={{}}
          />

          <span style={{ margin: "10px 1rem 0rem 10px" }}>To#:</span>
          <input
            type="text"
            value={toNumber}
            onChange={(e) => setToNumber(e.target.value)}
            className="form-control"
            style={{ display: "inline" }}
          />
        </div>
      )}

      {channel?.value === "callback" && (
        <div
          className="NumberFilterContainer"
          style={{
            display: "flex",
            //backgroundColor:"pink",
            marginLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <span style={{ margin: "10px 1rem 0rem 10px" }}>To#:</span>
          <input
            type="text"
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
            className="form-control"
            style={{}}
          />
        </div>
      )}

      {channel?.value === "chat" && (
        <div
          className="OriginContainer"
          style={{
            //backgroundColor:"orange",
            margin: "0rem 0rem 0rem 1rem",
            paddingRight: "1rem",
          }}
        >
          <span style={{ margin: "10px 1rem 0rem 10px" }}>Name:</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            style={{ width: "70%", display: "inline" }}
          />
        </div>
      )}

      <div
        className="WorkerContainer"
        style={{
          //backgroundColor:"orange",
          margin: "0rem 0rem 0rem 1rem",
          paddingRight: "1rem",
        }}
      >
        <span style={{ margin: "10px 1rem 0rem 10px" }}>Worker:</span>
        <input
          type="text"
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
          className="form-control"
          style={{ width: "70%", display: "inline" }}
        />
      </div>

      <div className="col-md-12 col-lg-2 col-xl-1">
        {loading ? (
          <div
            style={{
              padding: "5px",
              marginRight: "25px",
              paddingBottom: "0",
            }}
          >
            <ClipLoader size={25} />
          </div>
        ) : (
          <>
            <div
              className="btn-container"
              style={{
                //backgroundColor: "red",
                display: "flex",
                flexwrap: "nowrap",
                alignItems: "flex-start",
                width: "70%",
              }}
            >
              <button
                style={{
                  display: "inline",
                  alignSelf: "flex-start",
                  marginLeft: "0rem",
                  marginRight: "1rem",
                  padding: "0.3rem 0.5rem",
                }}
                className="btn btn-info"
                onClick={() => (
                  getTasks({
                    startDate,
                    endDate,
                    direction:
                      channel?.value === "voice" ? direction?.value : null,
                    fromNumber: fromNumber.replace("+", "").trim(),
                    name,
                    filter,
                    toNumber: toNumber.replace("+", "").trim(),
                    worker,
                    channel: channel?.value,
                  }),
                  setFilter(transferredType)
                )}
              >
                <FiChevronRight style={{}} size={25} />
              </button>

              <button //Boton de Descarga
                style={{
                  display: "inline",
                  padding: ".3rem .5rem",
                }}
                className="btn btn-info"
                onClick={() => ExportExcel()}
              >
                <FiDownload size={25} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

SearchForm.propTypes = {
  getTasks: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  loading: state.tasks.loading,
  department: state.auth.user.department,
});

export default connect(mapStateToProps, { getTasks })(SearchForm);
