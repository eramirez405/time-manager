import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import tasks from "./tasks";
import workers from "./workers";
import taskQueue from "./taskQueue";
import workSummary from "./workSummary";
import numbers from "./numbers";
import userManagement from "./userManagement";
import workerActivityEvent from "./workerActivityEvent";
import timeSummary from "./timeSummary";
import workersLive from "./workersLive";

export default combineReducers({
  alert,
  auth,
  tasks,
  workers,
  taskQueue,
  workSummary,
  numbers,
  userManagement,
  workerActivityEvent,
  timeSummary,
  workersLive,
});
