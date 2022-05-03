//import { format } from 'date-fns/esm';
import Modal from "react-modal";
//import Pagination from './Pagination';
import React, { useState } from "react";
import axios from "axios";

const RegisterModal = (props) => {
  const { isOpen } = props;
  const { onRequestClose } = props;
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [role, setRole] = useState("");
  const [validation, setValidation] = useState("");
  const [success, setSuccess] = useState("");

  //Func to send a Post and add the user to the DB
  const onSubmit = async (e) => {
    e.preventDefault();

    if (
      email === "" ||
      password === "" ||
      cpassword === "" ||
      role === "" ||
      username === ""
    ) {
      setValidation("Please Complete All Fields!");
    } else if (password !== cpassword) {
      setValidation("Passwords fields do not match! Check your passwords!");
    } else {
      var data = JSON.stringify({
        name: username.trim(),
        email: email.trim(),
        password: password.trim(),
        role: role,
        //"status": "Active",
      });

      var config = {
        method: "post",
        url: "/api/users",
        headers: {
          //'': '',
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          setSuccess("User created");
          setUsername("");
          setRole("");
          setEmail("");
          setPassword("");
          setCPassword("");
          onRequestClose();
        })
        .catch(function (error) {
          setValidation(error.reason);
          setInterval(() => {
            setValidation("");
          }, 5000);

          console.log(error);
        });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      {...props}
      style={{
        display: "block",
        content: {
          overflow: "visible",
          height: "70%",
          width: "40%",
          margin: "auto",
          backgroundColor: "#031e36",
          borderRadius: "20px",
          borderColor: "transparent",
        },
        overlay: { background: "rgb(105 105 105 / 75%)" },
      }}
      ariaHideApp={false}
      contentLabel="Task Detail"
    >
      <form
        onSubmit={onSubmit}
        className="RootContainer"
        style={{
          display: "flex",
          //padding: 'auto',
          marginTop: "1rem",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: "transparent",
        }}
      >
        <div
          id="legend"
          style={{
            backgroundColor: "transparent",
            borderRadius: "30px 30px 0px 0px",
            display: "flex",
            padding: "0rem",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: "200%",
              backgroundColor: "white",
              borderRadius: "10px",
              margin: "auto",
              padding: "auto",
              alignSelf: "center",
            }}
          >
            <h2
              style={{
                color: "black",
                padding: "0.5rem",
              }}
            >
              User Register
            </h2>
          </div>
        </div>

        <div
          className="InputContainer"
          style={{
            backgroundColor: "white",
            display: "flex",
            padding: "1rem",
            margin: "0.5rem",
            borderRadius: "10px",
            flexDirection: "column",
          }}
        >
          {/* Username */}
          <label
            htmlFor="username"
            style={{
              textAlign: "center",
              borderRadius: "10px",
              backgroundColor: "#033c73",
              alignSelf: "center",
              color: "white",
              width: "12rem",
              padding: "0.5rem",
            }}
          >
            Name
          </label>

          <input
            type="text"
            id="username"
            name="username"
            placeholder="Insert name.."
            style={{
              alignSelf: "center",
              width: "45%",
              margin: "auto",
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Role */}

          <label
            className="control-label"
            htmlFor="email"
            style={{
              textAlign: "center",
              borderRadius: "10px",
              backgroundColor: "#033c73",
              alignSelf: "center",
              color: "white",
              padding: "0.5rem",
              width: "12rem",
              marginTop: "1rem",
            }}
          >
            Role
          </label>
          <select
            name="select"
            style={{
              alignSelf: "center",
              width: "45%",
              margin: "auto",
            }}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" selected>
              Choose a role...
            </option>
            <option value="admin">Admin</option>
            <option value="supervisor"> Supervisor</option>
            <option value="lead">Lead</option>
            <option value="agent">Agent</option>
            <option value="julia">Julia</option>

          </select>

          {/* Email */}

          <label
            className="control-label"
            htmlFor="email"
            style={{
              textAlign: "center",
              borderRadius: "10px",
              backgroundColor: "#033c73",
              alignSelf: "center",
              color: "white",
              padding: "0.5rem",
              width: "12rem",
              marginTop: "1rem",
            }}
          >
            E-mail
          </label>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Ex: boss@ualett.com"
            style={{
              alignSelf: "center",
              width: "45%",
              margin: "auto",
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}

          <label
            className="control-label"
            htmlFor="password"
            style={{
              textAlign: "center",
              borderRadius: "10px",
              backgroundColor: "#033c73",
              alignSelf: "center",
              color: "white",
              padding: "0.5rem",
              width: "12rem",

              marginTop: "1rem",
            }}
          >
            Password
          </label>

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Insert password.."
            style={{
              alignSelf: "center",
              width: "45%",
              margin: "auto",
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Confirm password */}

          <label
            className="control-label"
            htmlFor="password_confirm"
            style={{
              textAlign: "center",
              borderRadius: "10px",
              backgroundColor: "#033c73",
              alignSelf: "center",
              color: "white",
              padding: "0.5rem",
              width: "12rem",
              margin: "1rem",
            }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="cpassword"
            name="cpassword"
            placeholder="Confirm password.."
            style={{
              alignSelf: "center",
              width: "45%",
              margin: "auto",
            }}
            value={cpassword}
            onChange={(e) => setCPassword(e.target.value)}
          />

          <button
            type="submit"
            style={{
              fontSize: "1.5rem",
              alignSelf: "center",
              margin: "4rem auto auto auto",
              padding: "0.3rem",
              width: "30%",
              backgroundColor: "green",
              borderRadius: "10px",
              color: "white",
            }}
          >
            Submit
          </button>

          <p>
            <small className="text-danger">{validation}</small>
            <small className="text-success">{success}</small>
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterModal;
