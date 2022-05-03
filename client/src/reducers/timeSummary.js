import {
  GET_ALL_TIME_MANAGE_USERS,
  TIME_MANAGE_ERROR,
  TIME_MANAGE_LOADING_TRUE,
  GET_TIME_REPORT,
  GET_TIME_REPORT_ERROR,
  GET_TIME_REPORT_LOADING,
} from "../actions/types";

const initialState = {
  logs: [],
  loading: true,
  error: null,
  timeReport: [],
  timeReportLoading: true,
  timeReportError: null,
};

export default function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_ALL_TIME_MANAGE_USERS:
      return { ...state, logs: payload, loading: false, error: null };
    case GET_TIME_REPORT:
      return {
        ...state,
        timeReport: payload,
        timeReportLoading: false,
        timeReportError: null,
      };
    case TIME_MANAGE_LOADING_TRUE:
      return { ...state, loading: true };
    case GET_TIME_REPORT_LOADING:
      return { ...state, timeReportLoading: true };
    case TIME_MANAGE_ERROR:
      return {
        ...state,
        logs: [],
        loading: false,
        error: "Something went wrong, contact support...",
      };
    case GET_TIME_REPORT_ERROR:
      return {
        ...state,
        timeReport: [],
        timeReportLoading: false,
        timeReportError: "Something went wrong, contact support...",
      };
    default:
      return state;
  }
}
