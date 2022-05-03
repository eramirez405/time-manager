import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { socket } from "./utils/socket";

// Redux
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/auth";
import setAuthToken from "./utils/setAuthToken";
import { useEffect } from "react";

// Components
import PrivateRoute from "./components/routing/PrivateRoute";
import NavBar from "./components/layout/NavBar";
import Alert from "./components/layout/Alert";

// Pages
import Home from "./pages/Home/index";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import Workers from "./pages/Workers";
import WorkSummary from "./pages/WorkSummary";
import NumbersPool from "./pages/NumbersPool";
import UserManagement from "./pages/UserManagement";
import TimeSummary from "./pages/TimeSummary";
import WorkersLive from "./pages/WorkersLive";
import JuliaDashBoard from "./pages/juliaDashboard";

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

socket.on("connection", () => {
  console.log(`I'm connected with the back-end`);
});

function App() {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <NavBar />
        <Alert />
        <br />
        <Switch>
          <PrivateRoute
            exact
            roles={["admin", "supervisor"]}
            path="/"
            component={() => <Home />}
          />
          <PrivateRoute
            exact
            roles={["admin", "supervisor", "lead"]}
            path="/tasks"
            component={() => <Tasks />}
          />
          <PrivateRoute
            exact
            roles={["admin", "supervisor", "lead"]}
            path="/workers"
            component={() => <Workers />}
          />
          <PrivateRoute
            exact
            roles={["admin", "supervisor"]}
            path="/userManagement"
            component={() => <UserManagement />}
          />
          <PrivateRoute
            exact
            path="/numbersPool"
            roles={["admin"]}
            component={() => <NumbersPool />}
          />
          <PrivateRoute
            exact
            path="/workSummary"
            roles={["admin", "supervisor"]}
            component={() => <WorkSummary />}
          />
          <PrivateRoute
            exact
            path="/timeSummary"
            roles={["admin", "supervisor"]}
            component={() => <TimeSummary />}
          />
          <PrivateRoute
            exact
            path="/workersLive"
            roles={["admin", "supervisor"]}
            component={() => <WorkersLive />}
          />
           <PrivateRoute
            exact
            path="/juliaHome"
            roles={["admin", "julia", "supervisor"]}
            component={() => <JuliaDashBoard />}
          />
          <Route exact path="/login" component={Login} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
