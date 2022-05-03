import axios from "axios";
import {
  GET_WORKERS,
  TWILIO_ERROR,
  SET_LOADING_TRUE,
  DELETE_WORKER,
} from "./types";

export const getWorkers = () => async (dispatch) => {
  try {
    dispatch({
      type: SET_LOADING_TRUE,
    });

    const res = await axios.get("/api/twilio/workers");
    dispatch({
      type: GET_WORKERS,
      payload: res.data.result,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};

export const deleteWorker = (id) => async (dispatch) => {
  var config = {
    method: "delete",
    url: `/api/twilio/workers/delete/${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: [],
  };

  console.log("executed");

  axios(config)
    .then(function (res) {
      console.log(JSON.stringify(res.data));
      dispatch({
        type: DELETE_WORKER,
        payload: id,
      });
    })
    .catch(function (error) {
      console.log(error);
      alert("Something was wrong, check the logs");
      dispatch({
        type: TWILIO_ERROR,
      });
    });
};
