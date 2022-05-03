import React from "react";
import { IoPersonAddSharp } from "react-icons/io5";

const SearchForm = ({ openModal, user }) => {
  return (
    <div
      className="RootContainer"
      style={{
        display: "flex",
        backgroundColor: "transparent",
      }}
    >
      <h1 style={{ margin: "1rem", right: "10rem", color: "black" }}>
        User Management
      </h1>

      {!!user && user.role === "admin" && (
        <button
          className="RegisterButton"
          style={{
            //Style for the Register Button
            alignSelf: "center",
            color: "white",
            marginLeft: "auto",
            padding: "0.5rem 0.7rem 0.5rem 0.7rem",
            backgroundColor: "#033c73",
            borderRadius: "10px",
            border: "1px solid white",
          }}
          onClick={() => openModal()}
        >
          <IoPersonAddSharp size={25}></IoPersonAddSharp>
        </button>
      )}
    </div>
  );
};

export default SearchForm;
