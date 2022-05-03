import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Table from "./Table";
import SearchForm from "./SearchForm";
import WorkersMonitorModal from "./WorkerMonitorModal";
import { getWorkers } from "../../actions/workers";
import { socket } from "../../utils/socket";
import ActivityExportModal from "./ActivityExportModal";

const Workers = ({ workers, getWorkers }) => {
  const [showAllWorkers, setShowAllWorkers] = useState(true);
  const [hideAddButton, setHideAddButton] = useState(false);
  const [addToLocal, setAddToLocal] = useState(false);
  const [isWorkerMonitorOpen, setIsWorkerMonitorOpen] = useState(false);
  const [isActivityExportOpen, setIsActivityExportOpen] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState(
    JSON.parse(localStorage.getItem("workerID"))
  );
  const [workerActivityID, setWorkerActivityID] = useState(null);

  socket.on("workerEvent", (e) => {
    getWorkers();
  });

  useEffect(() => {
    localStorage.setItem("showAllWorkers", JSON.stringify(showAllWorkers));
    if (addToLocal === false) {
      setSelectedWorkers(JSON.parse(localStorage.getItem("workerID")));
    } else {
      setSelectedWorkers(null);
    }
  }, [showAllWorkers]);

  return (
    <div className="container-fluid">
      <SearchForm
        showAllWorkers={showAllWorkers}
        setShowAllWorkers={setShowAllWorkers}
        setAddToLocal={setAddToLocal}
        hideAddButton={hideAddButton}
        openActivityExportModal={() => setIsActivityExportOpen(true)}
      />
      <br />
      {!!isWorkerMonitorOpen && !!workerActivityID && (
        <WorkersMonitorModal
          isOpen={isWorkerMonitorOpen}
          workerActivityID={workerActivityID}
          onRequestClose={() => {
            setIsWorkerMonitorOpen(false);
            setWorkerActivityID(null);
          }}
        />
      )}
      <br />
      {!!isActivityExportOpen && (
        <ActivityExportModal
          isOpen={isActivityExportOpen}
          onRequestClose={() => {
            setIsActivityExportOpen(false);
          }}
        />
      )}
      <Table
        openWorkerMonitorModal={() => setIsWorkerMonitorOpen(true)}
        setWorkerActivityID={setWorkerActivityID}
        setAddToLocal={setAddToLocal}
        addToLocal={addToLocal}
        showAllWorkers={showAllWorkers}
        setHideAddButton={setHideAddButton}
        hideAddButton={hideAddButton}
        // workersData={workers}
        workersData={
          !showAllWorkers && selectedWorkers?.length > 0
            ? workers.filter((e) => {
                let check;
                for (let i = 0; selectedWorkers.length > i; i++) {
                  if (e._id === selectedWorkers[i]) {
                    check = true;
                  }
                }
                if (check) {
                  return e;
                }
              })
            : workers
        }
      />
    </div>
  );
};

Workers.propTypes = {
  workers: PropTypes.array.isRequired,
  workerActivityEvent: PropTypes.array.isRequired,
  getWorkers: PropTypes.func.isRequired,
  // getWorkersEvents: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  workers: state.workers.logs,
});

export default connect(mapStateToProps, { getWorkers })(Workers);
