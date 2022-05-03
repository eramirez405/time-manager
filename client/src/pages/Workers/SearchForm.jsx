import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getWorkers } from "../../actions/workers";
import { BsFillPersonCheckFill, BsToggleOn, BsToggleOff } from "react-icons/bs";
import ClipLoader from "react-spinners/ClipLoader";
import notie from "notie";
import { FiDownload } from "react-icons/fi";
//import XLSX from "xlsx";
import { getWorkersEvents } from "../../actions/workerActivityEvent";
//import moment from "moment";

const SearchForm = ({
  loading,
  getWorkers,
  showAllWorkers,
  setShowAllWorkers,
  setAddToLocal,
  hideAddButton,
  getWorkersEvents,
  openActivityExportModal,
}) => {
  useEffect(() => {
    getWorkers();
    getWorkersEvents();
  }, [getWorkers]);

  //console.log(workerActivityEvent);

  return (
    <div className="row">
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
            <div style={{ display: "flex", backgroundColor: "transparent" }}>
              {showAllWorkers ? (
                <button
                  style={{
                    marginRight: "2rem",
                    padding: ".3rem .5rem",
                  }}
                  className="btn btn-info"
                  onClick={() => setShowAllWorkers(false)}
                  s
                >
                  <BsToggleOn fill="#81f562" stroke="#81f562" size={25} />
                </button>
              ) : (
                <button
                  style={{
                    marginRight: "2rem",
                    padding: ".3rem .5rem",
                  }}
                  className="btn btn-info"
                  onClick={() => setShowAllWorkers(true)}
                >
                  <BsToggleOff fill="#ff0000" stroke="red" size={25} />
                </button>
              )}
              {hideAddButton === true ? (
                <button
                  style={{
                    marginRight: "2rem",
                    padding: ".3rem .5rem",
                  }}
                  className="btn btn-info"
                  onClick={() => {
                    setAddToLocal(true);
                    notie.alert({
                      type: 1, // optional, default = 4, enum: [1, 2, 3, 4, 5, 'success', 'warning', 'error', 'info', 'neutral']
                      text: "Workers added",
                      stay: false, // optional, default = false
                      time: 2, // optional, default = 3, minimum = 1,
                      position: "top", // optional, default = 'top', enum: ['top', 'bottom']
                    });
                  }}
                >
                  <BsFillPersonCheckFill size={25} />
                </button>
              ) : (
                <div></div>
              )}
              <button //Button to open Download Modal
                style={{
                  display: "block",
                  padding: ".3rem .5rem",
                }}
                className="btn btn-info"
                onClick={() => openActivityExportModal()}
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
  getWorkers: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  loading: state.workers.loading,
  workerActivityEvent: state.workerActivityEvent.logs,
});

export default connect(mapStateToProps, { getWorkers, getWorkersEvents })(
  SearchForm
);
