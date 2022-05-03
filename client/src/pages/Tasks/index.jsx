import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Table from "./Table";
import SearchForm from "./SearchForm";
import TaskDetailModal from "./TaskDetailModal";

const Task = ({ tasks, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState(null);
  const [channel, setChannel] = useState({
    value: "voice",
    label: "Voice",
  });

  const [direction, setDirection] = useState("");

  const [filter, setFilter] = useState({ value: "viewAll", label: "View All" });

  const filterData =
    channel?.value === "voice"
      ? tasks.filter((e) => {
          if (filter?.value === "transferred") {
            return e.reservations.length > 1;
          } else if (filter?.value === "direct") {
            return e.reservations.length < 2;
          } else {
            return e;
          }
        })
      : tasks;

  const _filterData = filterData.filter((e) => e.reason !== "task transferred");

  return (
    <div className="container-fluid">
      <SearchForm
        data={_filterData}
        channel={channel}
        setChannel={setChannel}
        direction={direction}
        setDirection={setDirection}
        filter={filter}
        setFilter={setFilter}
      />
      <br />

      <Table
        data={_filterData}
        openModal={() => setIsOpen(true)}
        setTask={setTask}
        user={user}
        channel={channel}
        direction={direction}
        filter={filter}
        tasks={tasks}
      />
      {!!task && !!isOpen && (
        <TaskDetailModal
          isOpen={isOpen}
          task={task}
          onRequestClose={() => {
            setTask(null);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

Task.propTypes = {
  tasks: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  tasks: state.tasks.logs,
  user: state.auth.user,
});

export default connect(mapStateToProps)(Task);
