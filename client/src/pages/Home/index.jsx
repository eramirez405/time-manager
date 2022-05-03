import React, { useEffect } from "react";
import { getTaskQueue } from "../../actions/taskQueue";
import { connect } from "react-redux";
import Table from "./Table";
import { Redirect } from "react-router-dom";

const Home = ({ getTaskQueue, taskQueue, user }) => {
  useEffect(() => {
    getTaskQueue();
  }, [getTaskQueue]);

  if (user?.role === "lead") {
    return <Redirect to="/workers" />;
  }

  if (user?.role === "supervisor") {
    return <Redirect to="/tasks" />;
  }

  return (
    <div className="container-fluid">
      <Table data={taskQueue} />
    </div>
  );
};

const mapStateToProps = (state) => ({
  taskQueue: state.taskQueue.logs,
  user: state.auth.user,
});

export default connect(mapStateToProps, { getTaskQueue })(Home);
