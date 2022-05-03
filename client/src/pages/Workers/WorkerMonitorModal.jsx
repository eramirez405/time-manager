import React, { useEffect } from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";
import Timeline from "./Timeline";
import { getWorkersEvents } from "../../actions/workerActivityEvent";
import { connect } from "react-redux";
import format from "date-fns/format";

const WorkerMonitorModal = (props) => {
  const {
    isOpen,
    workerActivityID,
    getWorkersEvents,
    workerActivityEvent,
  } = props;

  useEffect(() => {
    getWorkersEvents(workerActivityID);
  }, [workerActivityID]);

  if (workerActivityID) {
    return (
      <Modal
        isOpen={isOpen}
        {...props}
        style={{
          content: { overflow: "auto" },
          overlay: { background: "rgb(105 105 105 / 75%)" },
        }}
        ariaHideApp={false}
        contentLabel="Worker Activity Detail"
      >
        {/* color="#033c73" */}
        <div>
          <h1 style={{ color: "#033c73" }}>{workerActivityID}</h1>
          <h2>Today's Activity Timeline </h2>
        </div>
        <hr color="black"></hr>
        {/* //////////////////////////////////////// */}
        <Timeline workerActivityEvent={workerActivityEvent} />
      </Modal>
    );
  }
};

WorkerMonitorModal.propTypes = {
  workerActivityEvent: PropTypes.array.isRequired,
  getWorkersEvents: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  workerActivityEvent: state.workerActivityEvent.logs,
});

export default connect(mapStateToProps, { getWorkersEvents })(
  WorkerMonitorModal
);
