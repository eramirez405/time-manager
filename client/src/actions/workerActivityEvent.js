import axios from "axios";
import {
  GET_WORKERS_EVENTS,
  TWILIO_ERROR,
  LOADING_WORKER_ACTIVITY,
} from "./types";

export const getWorkersEvents = (e) => async (dispatch) => {
  //console.log(e);
  try {
    dispatch({
      type: LOADING_WORKER_ACTIVITY,
    });

    const res = await axios.get(`/api/workerActivityEvent/${e}`);
    //console.log(res);
    dispatch({
      type: GET_WORKERS_EVENTS,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};
