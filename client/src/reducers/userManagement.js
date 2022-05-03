import {
  GET_ALL_USERS,
  TWILIO_ERROR,
  SET_LOADING_TRUE,
  MODIFY_ROLE,
  MODIFY_STATUS,
  DELETE_USER,
  MODIFY_TIME_MANAGE,
  EDIT_TIME_MANAGE_USER,
  EDIT_TIME_MANAGE_USER_ERROR,
} from "../actions/types";

const initialState = { logs: [], loading: true };

export default function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_ALL_USERS:
      return { ...state, logs: payload, loading: false };
    case SET_LOADING_TRUE:
      return { ...state, loading: true };
    case TWILIO_ERROR:
    case EDIT_TIME_MANAGE_USER_ERROR:
      return { ...state, logs: [], loading: false };
    case MODIFY_ROLE:
    case MODIFY_TIME_MANAGE:
    case MODIFY_STATUS:
    case EDIT_TIME_MANAGE_USER:
      return {
        ...state,
        logs: [...state.logs.filter((e) => e._id !== payload._id), payload],
      };
    case DELETE_USER:
      return {
        ...state,
        logs: [...state.logs.filter((e) => e._id !== payload)],
      };

    default:
      return state;
  }
}
