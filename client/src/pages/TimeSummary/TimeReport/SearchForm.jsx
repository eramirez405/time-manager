import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTimeReport } from "../../../actions/timeSummary";
import DatePicker from "react-datepicker";
import { FiChevronRight } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";
import "react-datepicker/dist/react-datepicker.css";
import setDay from "date-fns/setDay";

const SearchForm = ({ loading, getTimeReport }) => {
  const [startDate, setStartDate] = useState(setDay(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    getTimeReport({
      startDate,
      endDate,
    });
  }, [getTimeReport]);

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
          dateFormat="MMMM d, yyyy"
          className="form-control"
        />

        <span style={{ margin: "10px 1rem 0rem 2rem" }}>To :</span>
        <DatePicker
          selected={endDate}
          style={{}}
          onChange={(date) => setEndDate(date)}
          dateFormat="MMMM d, yyyy"
          className="form-control"
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
                onClick={() =>
                  getTimeReport({
                    startDate,
                    endDate,
                  })
                }
              >
                <FiChevronRight style={{}} size={25} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

SearchForm.propTypes = {
  getTimeReport: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  loading: state.timeSummary.timeReportLoading,
});

export default connect(mapStateToProps, { getTimeReport })(SearchForm);
