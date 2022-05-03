import {
  GET_WORKERS_EVENTS,
  TWILIO_ERROR,
  LOADING_WORKER_ACTIVITY,
} from "../actions/types";

const initialState = { logs: [], loading: true };

export default function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_WORKERS_EVENTS:
      return { ...state, logs: payload, loading: false };
    case LOADING_WORKER_ACTIVITY:
      return { ...state, loading: true };
    case TWILIO_ERROR:
      return { ...state, logs: [], loading: false };

    default:
      return state;
  }
}
