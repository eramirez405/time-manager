import axios from "axios";
import {
  GET_ALL_USERS,
  MODIFY_ROLE,
  MODIFY_STATUS,
  MODIFY_PASSWORD,
  SET_LOADING_TRUE,
  TWILIO_ERROR,
  DELETE_USER,
  MODIFY_TIME_MANAGE,
} from "./types";

export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({
      type: SET_LOADING_TRUE,
    });

    const res = await axios.get("/api/users");
    dispatch({
      type: GET_ALL_USERS,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};

export const modifyRole = (id, role) => async (dispatch) => {
  let formData = JSON.stringify({
    role: role,
  });

  var config = {
    method: "patch",
    url: `/api/users/${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: formData,
  };

  axios(config)
    .then(function (res) {
      //console.log("El res" + res);
      //console.log(JSON.stringify(res.data));
      //console.log("El role:" + role);
      //res.data.role = role;
      dispatch({
        type: MODIFY_ROLE,
        payload: res.data,
      });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({
        type: TWILIO_ERROR,
      });
    });
};

export const modifyStatus = (id, status) => async (dispatch) => {
  let formData;

  if (status === "Active") {
    formData = JSON.stringify({
      status: "Inactive",
    });
  } else if (status === "Inactive") {
    formData = JSON.stringify({
      status: "Active",
    });
  }

  var config = {
    method: "patch",
    url: `/api/users/${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: formData,
  };

  axios(config)
    .then(function (res) {
      dispatch({
        type: MODIFY_STATUS,
        payload: res.data,
      });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({
        type: TWILIO_ERROR,
      });
    });
};

export const modifyTimeManage = (id, status) => async (dispatch) => {
  let formData = {
    timeManage: !!!status,
  };

  var config = {
    method: "patch",
    url: `/api/users/${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: formData,
  };

  axios(config)
    .then(function (res) {
      dispatch({
        type: MODIFY_TIME_MANAGE,
        payload: res.data,
      });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({
        type: TWILIO_ERROR,
      });
    });
};

export const modifyPassword = (id, password) => async (dispatch) => {
  let formData = JSON.stringify({
    password: password,
  });

  var config = {
    method: "patch",
    url: `/api/users/${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: formData,
  };

  axios(config)
    .then(function (res) {
      console.log(JSON.stringify(res.data));
      dispatch({
        type: MODIFY_PASSWORD,
        payload: res.data,
      });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({
        type: TWILIO_ERROR,
      });
    });
};

export const deleteUser = (id) => async (dispatch) => {
  var config = {
    method: "delete",
    url: `/api/users/${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: [],
  };

  axios(config)
    .then(function (res) {
      console.log(JSON.stringify(res.data));
      dispatch({
        type: DELETE_USER,
        payload: id,
      });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({
        type: TWILIO_ERROR,
      });
    });
};
