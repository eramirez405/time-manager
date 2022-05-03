import {
  GET_WORKERS,
  TWILIO_ERROR,
  SET_LOADING_TRUE,
  DELETE_WORKER,
} from "../actions/types";

const initialState = { logs: [], loading: true };

export default function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_WORKERS:
      return {
        ...state,
        logs: payload,
        loading: false,
      };
    case DELETE_WORKER:
      return {
        ...state,
        logs: [...state.logs.filter((e) => e.sid !== payload)],
      };
    case SET_LOADING_TRUE:
      return { ...state, loading: true };
    case TWILIO_ERROR:
      return { ...state, logs: [], loading: false };
    default:
      return state;
  }
}
