import axios from "axios";
import {
  GET_WORKERS_LIVE,
  GET_WORKERS_LIVE_ERROR,
  SET_LOADING_TRUE,
  EDIT_WORKERS_LIVE,
  UPDATE_AGENT_NOTE,
  UPDATE_AGENT_NOTESIS,
} from "./types";

export const getWorkersLive = () => async (dispatch) => {
  try {
    dispatch({
      type: SET_LOADING_TRUE,
    });

    const res = await axios.get("/api/timelog/workersLive");

    dispatch({
      type: GET_WORKERS_LIVE,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: GET_WORKERS_LIVE_ERROR,
    });
  }
};

export const modifyStatus = (user, activity) => async (dispatch) => {
  try {
    dispatch({
      type: EDIT_WORKERS_LIVE,
      payload: { user, activity },
    });
  } catch (e) {
    console.log(e);
  }
};

export const saveNote = (email, note) => async (dispatch) => {
  try {
    const data = JSON.stringify({
      Id: email,
      dailyNotes: note,
    });

    const config = {
      method: "put",
      url: "/api/users/savedNote",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const res = await axios(config);

    if (res) {
      dispatch({
        type: UPDATE_AGENT_NOTE,
        payload: {
          id: email,
          note,
          timestamp:new Date(),
        },
      });
    }
  } catch (err) {
    console.log(err);
    dispatch({
      type: GET_WORKERS_LIVE_ERROR,
    });
  }
};
export const saveNoteSis = (email, note, start, end) => async (dispatch) => {
  try {
    const data = JSON.stringify({
      Id: email,
      NoteSis: note,
      HourStar: start,
      HourdEnd: end,
    });

    const config = {
      method: "put",
      url: "/api/users/savedNoteSis",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const res = await axios(config);

    if (res) {
      dispatch({
        type: UPDATE_AGENT_NOTESIS,
        payload: {
          id: email,
          note,
          timestamp:new Date(),
        },
      });
    }
  } catch (err) {
    console.log(err);
    dispatch({
      type: GET_WORKERS_LIVE_ERROR,
    });
  }
};

export const GetLastNote = (email) => async (dispatch) => {
  try {
    const data = JSON.stringify({
      email: email,
    });

    const config = {
      method: "post",
      url: "/api/users/GetLastNote",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const res = await axios(config);

    return res.data;
  } catch (err) {
    console.log("please call support", err);
  }
};
export const GetLastNoteSis = (email) => async (dispatch) => {
  try {
    const data = JSON.stringify({
      email: email,
    });

    const config = {
      method: "post",
      url: "/api/users/GetLastNoteSis",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const res = await axios(config);

    return res.data;
  } catch (err) {
    console.log("please call support", err);
  }
};
export const SendNoteBot = (email, message,hour) => async (dispatch) => {
  try {
    var axios = require("axios");
    var data = JSON.stringify({
      Email: email,
      message: message,
      hour:hour,
    });

    var config = {
      method: "post",
      url: "/api/users/sendNoteBot",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
  }
};
