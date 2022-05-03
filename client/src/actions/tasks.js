import axios from "axios";
import { GET_TASKS, TWILIO_ERROR, SET_LOADING_TRUE } from "./types";

export const getTasks = (formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    dispatch({
      type: SET_LOADING_TRUE,
    });

    const res = await axios.post("/api/twilio/tasksLogs", formData, config);
    dispatch({
      type: GET_TASKS,
      payload: res.data.result,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};

export const getChatMessages = async (workFlow, service) => {
  try {
    const res = await axios.get(
      `/api/twilio/workFlow/${workFlow}/chatMessages/${service}`
    );
    return res.data;
  } catch (err) {
    return err;
  }
};
