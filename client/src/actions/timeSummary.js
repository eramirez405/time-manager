import axios from "axios";
import {
  GET_ALL_TIME_MANAGE_USERS,
  TIME_MANAGE_ERROR,
  TIME_MANAGE_LOADING_TRUE,
  EDIT_TIME_MANAGE_USER,
  EDIT_TIME_MANAGE_USER_ERROR,
  GET_TIME_REPORT,
  GET_TIME_REPORT_ERROR,
  GET_TIME_REPORT_LOADING,
} from "./types";

export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({
      type: TIME_MANAGE_LOADING_TRUE,
    });

    const res = await axios.get("/api/users/timelog");
    dispatch({
      type: GET_ALL_TIME_MANAGE_USERS,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TIME_MANAGE_ERROR,
    });
  }
};

export const getTimeReport = ({ startDate, endDate }) => async (dispatch) => {
  try {
    dispatch({
      type: GET_TIME_REPORT_LOADING,
    });

    const res = await axios.get(
      `/api/timelog/timeReport/${startDate}/${endDate}`
    );
    dispatch({
      type: GET_TIME_REPORT,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: GET_TIME_REPORT_ERROR,
    });
  }
};

export const editTimeManageUser = (id, data) => async (dispatch) => {
  let formData = JSON.stringify(data);

  var config = {
    method: "patch",
    url: `/api/users/info/${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: formData,
  };

  axios(config)
    .then(function (res) {
      dispatch({
        type: EDIT_TIME_MANAGE_USER,
        payload: res.data,
      });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({
        type: EDIT_TIME_MANAGE_USER_ERROR,
      });
    });
};

export const sendNoteBot = (id,start,end,reason ) => async (dispatch) => {
  try {
   
    console.log("Execute timeSummary");
    var data = JSON.stringify({
      Id: id,
      Start: start,
      End:end,
      Reason:reason,
    });

    var config = {
      method: "post",
      url: "/api/users/sendNoteLicenseOrVacationBot",
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






export const getLocations = async () => {
  try {
    const res = await axios.get(`/api/timelog/report/locations`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};
