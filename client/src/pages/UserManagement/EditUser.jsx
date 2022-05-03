import React, { useState } from "react";
import Modal from "react-modal";
import { FiX } from "react-icons/fi";
import HashLoader from "react-spinners/HashLoader";
import TimeKeeper from "react-timekeeper";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { startOfDay, endOfDay } from "date-fns";
import { editTimeManageUser } from "../../actions/timeSummary";
import { sendNoteBot } from "../../actions/timeSummary";
import { DateRange } from "react-date-range";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Select from "react-select";
import format from "date-fns/format";

const customStyles = {
  overlay: {
    backgroundColor: "rgb(88 88 88 / 75%)",
  },
  content: {
    inset: 0,
    width: "fit-content",
    minWidth: "980px",
    marginRight: "auto",
    marginLeft: "auto",
    marginTop: "50px",
    position: "relative",
    maxHeight: "90%",
  },
};

const options = [
  {
    label: "Investigation & Development",
    value: "Investigation & Development",
  },
  {
    label: "Inbound & Chat",
    value: "Inbound & Chat",
  },
  {
    label: "Push",
    value: "Push",
  },
  {
    label: "Repetition",
    value: "Repetition",
  },
  {
    label: "Overdue",
    value: "Overdue",
  },
  {
    label: "Operations",
    value: "Operations",
  },
  {
    label: "Information & Technology",
    value: "Information & Technology",
  },
  {
    label: "Analytics",
    value: "Analytics",
  },
  {
    label: "Quality Assurance",
    value: "Quality Assurance",
  },
];

const weekOptions = [
  {
    label: "Monday",
    value: "monday",
  },
  {
    label: "Tuesday",
    value: "tuesday",
  },
  {
    label: "Wednesday",
    value: "wednesday",
  },
  {
    label: "Thursday",
    value: "thursday",
  },
  {
    label: "Friday",
    value: "friday",
  },
];

Modal.setAppElement("#root");

const EditUser = ({
  user,
  open,
  closeModal,
  editTimeManageUser,
  sendNoteBot,
}) => {
  const [backofficeId, setBackofficeId] = useState(user?.backofficeId || "");
  const [validBackofficeId, setValidBackofficeId] = useState(1);
  const [department, setDepartment] = useState(
    user?.department ? options.find((e) => e.value === user?.department) : ""
  );
  const [weekDaySelected, setWeekDaySelected] = useState({
    label: format(new Date(), "EEEE"),
    value: format(new Date(), "EEEE").toLowerCase(),
  });
  const [schedule, setSchedule] = useState(
    user?.schedule || {
      monday: {
        scheduleStart: "9:00 am",
        breakTime: "12:00 pm",
        scheduleEnd: "6:00 pm",
      },
      tuesday: {
        scheduleStart: "10:00 am",
        breakTime: "12:00 pm",
        scheduleEnd: "7:00 pm",
      },
      wednesday: {
        scheduleStart: "9:00 am",
        breakTime: "12:00 pm",
        scheduleEnd: "6:00 pm",
      },

      thursday: {
        scheduleStart: "9:00 am",
        breakTime: "12:00 pm",
        scheduleEnd: "6:00 pm",
      },

      friday: {
        scheduleStart: "9:00 am",
        breakTime: "12:00 pm",
        scheduleEnd: "6:00 pm",
      },
    }
  );
  const [showStartTime, setShowStartTime] = useState(false);
  const [showBreakTime, setShowBreakTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [licenseModified, setLicenseModified] = useState(false);
  const [VacationModified, setVacationModified] = useState(false);
  const [range, setRange] = useState({
    startDate: startOfDay(
      user?.vacationStart ? new Date(user?.vacationStart) : new Date()
    ),
    endDate: endOfDay(
      user?.vacationEnd ? new Date(user?.vacationEnd) : new Date()
    ),
    key: "selection",
  });

  const [licenseRange, setLicenseRange] = useState({
    startDate: startOfDay(
      user?.licenseStart ? new Date(user?.licenseStart) : new Date()
    ),
    endDate: endOfDay(
      user?.licenseEnd ? new Date(user?.licenseEnd) : new Date()
    ),
    key: "selection",
  });
  const [licenseReason, setLicenseReason] = useState(
    user?.licenseReason ? user.licenseReason : null
  );
  const [validation, setValidation] = useState("");
  const [loading, setLoading] = useState(false);

  // 1 if it has not been modified yet
  // 2 if it is valid
  // 3 if it is invalid

  const validateBackofficeId = () => {
    if (
      !!backofficeId &&
      (backofficeId.length === 11) & (backofficeId.substring(0, 2) === "A-")
    ) {
      setValidBackofficeId(2);
    } else {
      setValidBackofficeId(3);
    }
  };

  //Applies changes to the user
  const onSubmit = async (e) => {
    e.preventDefault();

    if (backofficeId === "" || department === "") {
      setValidation("Please complete all the fields!");
    } else {
      if (validBackofficeId === 3) {
        setValidation("Please fix incorrect inputs!");
      } else {
        setLoading(true);
        let data = {
          backofficeId,
          department: department.value,
          schedule,
          vacationStart: startOfDay(range.startDate),
          vacationEnd: endOfDay(range.endDate),
        };
        if (licenseModified == false && VacationModified == true) {
          await sendNoteBot(user?.name, range.startDate, range.endDate);
        }

        if (licenseModified) {
          data.licenseStart = startOfDay(licenseRange.startDate);
          data.licenseEnd = endOfDay(licenseRange.endDate);
          data.licenseReason = licenseReason;

          await sendNoteBot(
            user?.name,
            licenseRange.startDate,
            licenseRange.endDate,
            licenseReason
          );
        }

        await editTimeManageUser(user._id, data);
        setLoading(false);
        closeModal();
      }
    }
    setTimeout(() => {
      setValidation("");
    }, 8000);
  };

  const handleSelect = (ranges) => {
    if (!!ranges?.selection) {
      setRange(ranges.selection);
      setVacationModified(true);
    }
  };

  //Handle Select for License data
  const handleLicenseSelect = (ranges) => {
    if (!!ranges?.selection) {
      setLicenseRange(ranges.selection);
      setLicenseModified(true);
    }
  };

  return (
    <Modal
      isOpen={open}
      onRequestClose={() => {
        if (!loading) closeModal();
      }}
      style={customStyles}
    >
      <span onClick={closeModal} style={{ cursor: "pointer" }}>
        <FiX color="red" style={{ float: "right" }} size={30} />
      </span>
      <h1>{user?.name}</h1>
      <hr />
      <form onSubmit={onSubmit}>
        <div
          className={`form-group ${
            validBackofficeId === 2 ? "has-success" : ""
          } ${validBackofficeId === 3 ? "has-danger" : ""}`}
        >
          <label
            className="col-form-label font-weight-bold"
            htmlFor="inputLarge1"
          >
            Backoffice ID
          </label>
          <input
            className={`form-control form-control-lg ${
              validBackofficeId === 2 ? "is-valid" : ""
            } ${validBackofficeId === 3 ? "is-invalid" : ""}`}
            type="text"
            value={backofficeId}
            onChange={(e) => setBackofficeId(e.target.value)}
            onBlur={validateBackofficeId}
            id="inputLarge1"
          />
          {validBackofficeId === 3 && (
            <div className="invalid-feedback">Wrong format!</div>
          )}
        </div>

        <div className={`form-group`}>
          <label
            className="col-form-label font-weight-bold"
            htmlFor="inputLarge2"
          >
            Department
          </label>
          <Select
            isClearable
            className={"select time-index"}
            placeholder=""
            value={department}
            onChange={(value) => setDepartment(value)}
            options={options}
          />
        </div>
        <div className="row">
          <div className="col-md-4">
            <label
              className="col-form-label font-weight-bold"
              htmlFor="inputLarge2"
            >
              Schedule
            </label>
            <Select
              isClearable
              className={"select time-index"}
              placeholder=""
              value={weekDaySelected}
              onChange={(value) => setWeekDaySelected(value)}
              options={weekOptions}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div
              className={`form-group`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label className="col-form-label font-weight-bold">Start</label>
              {showStartTime ? (
                <TimeKeeper
                  time={schedule[weekDaySelected.value].scheduleStart}
                  onChange={(data) => {
                    console.log(data);
                    setSchedule({
                      ...schedule,
                      [weekDaySelected.value]: {
                        ...schedule[weekDaySelected.value],
                        scheduleStart: data.formatted12,
                      },
                    });
                  }}
                  onDoneClick={() => setShowStartTime(false)}
                />
              ) : (
                <h1
                  onClick={() => setShowStartTime(true)}
                  style={{ cursor: "pointer" }}
                >
                  {schedule[weekDaySelected.value].scheduleStart}
                </h1>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div
              className={`form-group`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label className="col-form-label font-weight-bold">
                Break Time
              </label>
              {showBreakTime ? (
                <TimeKeeper
                  time={schedule[weekDaySelected.value].breakTime}
                  onChange={(data) => {
                    setSchedule({
                      ...schedule,
                      [weekDaySelected.value]: {
                        ...schedule[weekDaySelected.value],
                        breakTime: data.formatted12,
                      },
                    });
                  }}
                  onDoneClick={() => setShowBreakTime(false)}
                />
              ) : (
                <h1
                  onClick={() => setShowBreakTime(true)}
                  style={{ cursor: "pointer" }}
                >
                  {schedule[weekDaySelected.value].breakTime}
                </h1>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div
              className={`form-group`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label className="col-form-label font-weight-bold">End</label>
              {showEndTime ? (
                <TimeKeeper
                  time={schedule[weekDaySelected.value].scheduleEnd}
                  onChange={(data) => {
                    setSchedule({
                      ...schedule,
                      [weekDaySelected.value]: {
                        ...schedule[weekDaySelected.value],
                        scheduleEnd: data.formatted12,
                      },
                    });
                  }}
                  onDoneClick={() => setShowEndTime(false)}
                />
              ) : (
                <h1
                  onClick={() => setShowEndTime(true)}
                  style={{ cursor: "pointer" }}
                >
                  {schedule[weekDaySelected.value].scheduleEnd}
                </h1>
              )}
            </div>
          </div>
        </div>

        <div
          className={`form-group`}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            //width: "fit-content",
            //backgroundColor: "red",
          }}
        >
          <div
            className="VacationsDiv"
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "flex-start",
            }}
          >
            <label
              className="col-form-label font-weight-bold"
              htmlFor="inputLarge3"
              style={{ textAlign: "center" }}
            >
              Vacations
            </label>
            <DateRange
              ranges={[range]}
              onChange={handleSelect}
              minDate={new Date()}
              staticRanges={[]}
            />
          </div>

          <div
            className="LicenseDiv"
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "flex-end",
              // backgroundColor: "green",
            }}
          >
            <label
              className="col-form-label font-weight-bold"
              htmlFor="inputLarge3"
              style={{ textAlign: "center" }}
            >
              License{" "}
              {!user.licenseStart && !licenseModified ? "(Default)" : ""}
            </label>
            <DateRange
              ranges={[licenseRange]}
              onChange={handleLicenseSelect}
              minDate={new Date()}
              staticRanges={[]}
            />
            <b style={{ textAlign: "center" }}>Reason for the license:</b>
            <input
              className={`form-control form-control-lg`}
              type="text"
              value={licenseReason}
              required={licenseModified}
              onChange={(e) => {
                setLicenseReason(e.target.value);
                setLicenseModified(true);
              }}
              id="inputLarge1"
            />
          </div>
        </div>

        <br />

        <button
          type="submit"
          className="btn btn-success"
          style={{ width: "100%" }}
        >
          Update
        </button>
        <small style={{ color: "#e51c23" }}>{validation}</small>
        <br />
      </form>
      {loading && (
        <div
          style={{
            background: "rgb(0 0 0 / 40%)",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: "1",
          }}
        >
          <div
            style={{
              marginRight: "auto",
              marginLeft: "auto",
              width: "fit-content",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <HashLoader color={"white"} size={150} />
          </div>
        </div>
      )}
    </Modal>
  );
};

EditUser.propTypes = {
  editTimeManageUser: PropTypes.func.isRequired,
};

export default connect(null, {
  editTimeManageUser,
  sendNoteBot,
})(EditUser);
