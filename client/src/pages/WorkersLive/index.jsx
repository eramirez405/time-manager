import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import SearchForm from "./SearchForm";
import { getWorkersLive } from "../../actions/workersLive";
import { modifyStatus } from "../../actions/workersLive";
import Table from "./Table";
import { socket } from "../../utils/socket";

const WorkersLive = ({ workersLive, getWorkersLive, modifyStatus }) => {
  const unmoun = useRef(true);
  const [stop, setStop] = useState(false);
  const [Data, setData] = useState(null);

  socket.on("statusActivity", (e) => {
    setData(e);
  });
  useEffect(() => {
    if (Data != null) {
      modifyStatus(Data.user, Data.activity);
    }
  }, [Data]);

  useEffect(() => {
    getWorkersLive();
  }, []);

  return (
    <div className="container-fluid">
      <SearchForm />
      <Table workersLive={workersLive} />
    </div>
  );
};

WorkersLive.propTypes = {
  getWorkersLive: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  workersLive: state.workersLive.logs,
});

export default connect(mapStateToProps, { getWorkersLive, modifyStatus })(
  WorkersLive
);
