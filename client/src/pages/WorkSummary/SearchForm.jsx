import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getWorkSummary } from "../../actions/workSummary";
import { FiChevronRight, FiDownload } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";
import DatePicker from "react-datepicker";
import subDays from "date-fns/subDays";
import startOfDay from "date-fns/startOfDay";
import endOfDay from "date-fns/endOfDay";
import "react-datepicker/dist/react-datepicker.css";
import XLSX from "xlsx";

const SearchForm = ({ loading, getWorkSummary, data }) => {
  //Func to download Excel File
  const ExportExcel = async () => {
    const newItem = data.workSummary.map((key) => ({
      //Creating the structure for the excel file from the data
      Name: key.friendlyName, //moment(key.attributes.dateCreated).format(),
      Created: key.reservations_created,
      Accepted: key.reservations_accepted,
      Rejected: key.reservations_rejected,
      TimedOut: key.reservations_timed_out,
      Canceled: key.reservations_canceled,
      Completed: key.reservations_completed,
      Available: key.activity_durations.total,
      //Break: key.
      //Offline: key.
      //Unavailable: key.
    }));

    const ws = XLSX.utils.json_to_sheet(newItem); //Convert Json(data) to Excel work sheet
    const wb = XLSX.utils.book_new(); //Create a new Excel Workbook(like a folder)
    XLSX.utils.book_append_sheet(wb, ws, "Lista"); //Assign a name to the Excel sheet and putting it inside the Workbook
    XLSX.writeFile(wb, "Data importada.xlsx"); //Exporting the workbook with the data as an Excel file.
  };
  //End of Func

  const [startDate, setStartDate] = useState(
    startOfDay(subDays(new Date(), 1))
  );
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  //const [downloadLoading, setDownloadLoading] = useState(false);  -Never used

  useEffect(() => {
    getWorkSummary({ startDate, endDate });
  }, [getWorkSummary]);

  return (
    <div className="d-flex" style={{ justifyContent: "end" }}>
      <div style={{ whiteSpace: "nowrap" }}>
        <span style={{ marginRight: "10px" }}>From :</span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="MMMM d, yyyy"
          className="form-control"
        />
      </div>
      <div
        style={{
          marginLeft: "2rem",
          marginRight: "2rem",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ marginRight: "10px" }}>To :</span>
        <DatePicker
          selected={endDate}
          style={{ width: "100%" }}
          onChange={(date) => setEndDate(date)}
          dateFormat="MMMM d, yyyy"
          className="form-control"
        />
      </div>
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
          <button
            style={{
              marginRight: "2rem",
              padding: ".3rem .5rem",
            }}
            className="btn btn-info"
            onClick={() => getWorkSummary({ startDate, endDate })}
          >
            <FiChevronRight size={25} />
          </button>

          <button
            style={{
              marginRight: "2rem 2rem 2rem 0.1rem",
              padding: ".3rem .5rem",
            }}
            className="btn btn-info"
            onClick={() => ExportExcel()}
          >
            <FiDownload size={25} />
          </button>
        </>
      )}
      {/* {downloadLoading ? (
        <div
          style={{
            padding: '5px',
            marginRight: '25px',
            paddingBottom: '0',
          }}
        >
          <ClipLoader size={25} />
        </div>
      ) : (
        <button
          style={{
            marginRight: '2rem',
            padding: '.3rem .5rem',
          }}
          className='btn btn-info'
          // onClick={() => getWorkSummary({ startDate, endDate })}
        >
          <FiDownload size={25} />
        </button>
      )} */}
    </div>
  );
};

SearchForm.propTypes = {
  getWorkSummary: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  loading: state.workSummary.loading,
});

export default connect(mapStateToProps, { getWorkSummary })(SearchForm);
