import React, { Fragment, useState } from "react";
import { useTable, usePagination, useSortBy, useRowSelect } from "react-table";
import { Checkbox } from "./Checkbox";
import Pagination from "./Pagination";
import PasswordInput from "./PasswordInput";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  modifyRole,
  modifyStatus,
  modifyPassword,
  deleteUser,
  modifyTimeManage,
} from "../../actions/userManagement";
import Select from "react-select";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { BsQuestionCircle } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import EditUser from "./EditUser";
import format from "date-fns/format";
import isBefore from "date-fns/isBefore";
import isAfter from "date-fns/isAfter";
import endOfDay from "date-fns/endOfDay";

const options = [
  {
    value: "statusChange",
    label: "Change Status",
  },
  {
    value: "timeManageChange",
    label: "Change Time Manage",
  },
  {
    value: "rolesChange",
    label: "Change Role",
  },
  {
    value: "passwordsChange",
    label: "Change Password",
  },
  {
    value: "deleteAccount",
    label: "Delete Account",
  },
];

const Table = ({
  data,
  modifyRole,
  modifyStatus,
  modifyTimeManage,
  modifyPassword,
  deleteUser,
  user,
}) => {
  const [formSelector, setFormSelector] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("");
  const [validation, setValidation] = useState("");
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  //const [onLicense, setOnLicense] = useState(false);

  const columns = React.useMemo(
    () => [
      {
        Header: "Username",
        accessor: "email", // accessor is the "key" in the data
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Role",
        accessor: "role",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => {
          if (value === "Active") {
            return <FiCheckCircle size={25} color={"rgb(25 205 25)"} />;
          }
          if (value === "Inactive") {
            return <FiXCircle size={25} color={"#ff4f4f"} />;
          }
          return <BsQuestionCircle size={25} color={"gray"} />;
        },
      },
      {
        Header: "Time Manage",
        accessor: "timeManage",
        Cell: ({ value }) => {
          if (value === true) {
            return <FiCheckCircle size={25} color={"rgb(25 205 25)"} />;
          }
          if (value === false) {
            return <FiXCircle size={25} color={"#ff4f4f"} />;
          }
          return <BsQuestionCircle size={25} color={"gray"} />;
        },
      },
      {
        Header: "Department",
        accessor: "department",
      },
      {
        Header: "Schedule Start",
        accessor: `schedule.${format(
          new Date(),
          "EEEE"
        ).toLowerCase()}.scheduleStart`,
      },
      {
        Header: "Break time",
        accessor: `schedule.${format(
          new Date(),
          "EEEE"
        ).toLowerCase()}.breakTime`,
      },
      {
        Header: "Schedule End",
        accessor: `schedule.${format(
          new Date(),
          "EEEE"
        ).toLowerCase()}.scheduleEnd`,
      },
      {
        Header: "Vacations",
        accessor: "vacationStart",
        Cell: ({
          row: {
            original: { vacationStart, vacationEnd },
          },
        }) => {
          if (vacationStart && vacationEnd) {
            return `${format(new Date(vacationStart), "MMM do y")} - ${format(
              new Date(vacationEnd),
              "MMM do y"
            )}`;
          } else {
            return "";
          }
        },
      },
      {
        Header: "License",
        accessor: "licenseStatus",
        Cell: ({ row: { original } }) => {
          const withinLicenseRange =
            isAfter(endOfDay(new Date(original?.licenseEnd)), new Date()) &&
            isBefore(new Date(original?.licenseStart), new Date());
          if (withinLicenseRange === true) {
            return <FiCheckCircle size={25} color={"rgb(25 205 25)"} />;
          } else if (withinLicenseRange === false) {
            return <FiXCircle size={25} color={"#ff4f4f"} />;
          }
        },
      },
      {
        id: "edit",
        width: 20,
        Cell: ({ row: { original } }) => {
          return (
            <FiEdit
              onClick={() => {
                setUserToEdit(original);
                setEditUserModalOpen(true);
              }}
              style={{ cursor: "pointer" }}
              size={20}
            />
          );
        },
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex, pageSize },
  } = useTable(
    { columns, data },
    useSortBy,
    usePagination,
    useRowSelect,
    user.role === "admin"
      ? (hooks) => {
          hooks.visibleColumns.push((columns) => {
            return [
              {
                id: "selection",
                Header: ({ getToggleAllRowsSelectedProps }) => (
                  <Checkbox {...getToggleAllRowsSelectedProps()} />
                ),
                Cell: ({ row }) => (
                  <Checkbox {...row.getToggleRowSelectedProps()} />
                ),
              },
              ...columns,
            ];
          });
        }
      : false
  );

  ////////////Multiple change of Roles/////////////////
  const multipleRoleChange = () => {
    if (role === "") {
      setValidation("Please select a role");
      setInterval(() => {
        setValidation("");
      }, 5000);
    } else {
      selectedFlatRows.forEach(async (item) => {
        let id = item.original._id;
        modifyRole(id, role);
        setFormSelector("");
        setRole("");
      });
    }
  };

  ////////////Multiple change of Status/////////////////
  const multipleChangeStatus = () => {
    selectedFlatRows.forEach(async (item) => {
      let id = item.original._id;
      modifyStatus(id, item.original.status);
      setFormSelector("");
    });
  };

  ////////////Multiple change of Status/////////////////
  const multipleTimeManageChange = () => {
    selectedFlatRows.forEach(async (item) => {
      let id = item.original._id;
      modifyTimeManage(id, item.original?.timeManage);
      setFormSelector("");
    });
  };

  ////////////Change of Password/////////////////
  const PasswordChange = () => {
    if (newPassword === "") {
      setValidation("Please complete all the fields");
      setInterval(() => {
        setValidation("");
      }, 5000);
    } else {
      selectedFlatRows.forEach(async (item) => {
        let id = item.original._id;
        await modifyPassword(id, newPassword);
        setFormSelector("");
        setNewPassword("");
      });
    }
  };

  ////////////Delete User Account/////////////////
  const delUser = () => {
    selectedFlatRows.forEach(async (item) => {
      let id = item.original._id;
      deleteUser(id);
      setFormSelector("");
    });
  };

  return pageCount > 0 ? (
    <>
      <table {...getTableProps()} className="table table-hover">
        <thead className="bg-dark text-white">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔻"
                        : " 🔺"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pageCount > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            pageIndex={pageIndex}
            pageOptions={pageOptions}
            gotoPage={gotoPage}
            pageSize={pageSize}
            previousPage={previousPage}
            nextPage={nextPage}
            pageCount={pageCount}
            setPageSize={setPageSize}
          />
        </div>
      )}

      <br />

      {selectedFlatRows.length > 0 ? (
        <form
          style={{
            //backgroundColor: "red",
            display: "flex",
          }}
        >
          {/* <select
            className="selectpicker"
            // className="custom-select"
            style={{
              width: "auto",
            }}
            value={formSelector}
            onChange={(e) => setFormSelector(e.target.value)}
          >
            <option value="" style={{ display: "none" }}>
              Choose action...
            </option>
            <option value="statusChange">Change Status</option>
            <option value="rolesChange">Change Roles</option>
            {selectedFlatRows.length === 1 ? (
              <option value="passwordsChange">Change passwords</option>
            ) : null}
            <option value="deleteAccount">Delete Account</option>
          </select> */}

          <div
            className="SelectContainer"
            style={{
              minWidth: "20rem",
              fontweight: "700",
              color: "#444",
              lineheight: "1.3",
              padding: "0em 1.4em .5em .8em",
              maxwidth: "100%",
            }}
          >
            <Select
              isClearable
              className={"select"}
              style={{ width: "300px" }}
              placeholder="Choose action..."
              value={formSelector}
              onChange={(value) => setFormSelector(value)}
              options={options}
            />
          </div>

          {formSelector?.value === "statusChange" && (
            <Fragment>
              <div className="form-group mx-sm-3 mb-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={multipleChangeStatus}
                >
                  Change Status
                </button>
              </div>
              <div className="form-group mx-sm-3 mb-2 text-secondary"></div>
            </Fragment>
          )}

          {formSelector?.value === "timeManageChange" && (
            <Fragment>
              <div className="form-group mx-sm-3 mb-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={multipleTimeManageChange}
                >
                  Change time manage
                </button>
              </div>
              <div className="form-group mx-sm-3 mb-2 text-secondary"></div>
            </Fragment>
          )}

          {formSelector?.value === "rolesChange" && (
            <Fragment>
              <div className="form-group mx-sm-3 mb-2">
                <select
                  className="custom-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="" style={{ display: "none" }}>
                    Choose a role...
                  </option>
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="lead">Lead</option>
                  <option value="julia">Julia</option>
                </select>
                {/* <small className='text-danger ml-2'>{validation}</small> */}
              </div>
              <div className="form-group mx-sm-3 mb-2 text-secondary">|</div>
              <div className="form-group mx-sm-3 mb-2">
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={multipleRoleChange}
                >
                  Change Role
                </button>
              </div>
            </Fragment>
          )}

          {formSelector?.value === "passwordsChange" &&
            selectedFlatRows.length === 1 && (
              <Fragment>
                {/* <div className='form-group mx-sm-3 mb-2'>
                  
                  <PasswordInput
                    value={adminPassword}
                    setValue={setAdminPassword}
                    placeholder={'Admin Password'}
                  />
                </div>

                <div className='form-group mx-sm-3 mb-2 text-secondary'>|</div> */}

                <div className="form-group mx-sm-3 mb-2">
                  <PasswordInput
                    value={newPassword}
                    setValue={setNewPassword}
                    placeholder={"New Password"}
                  />
                </div>

                <div className="form-group mx-sm-3 mb-2 text-secondary">|</div>

                <div className="form-group mx-sm-3 mb-2">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={PasswordChange}
                  >
                    Change Password
                  </button>
                </div>

                <small className="text-danger ml-2">{validation}</small>
              </Fragment>
            )}

          {formSelector?.value === "deleteAccount" && (
            <Fragment>
              <div className="form-group mx-sm-3 mb-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={delUser}
                >
                  Delete User Account
                </button>
              </div>
              <div className="form-group mx-sm-3 mb-2 text-secondary"></div>
            </Fragment>
          )}
        </form>
      ) : null}
      {editUserModalOpen && !!userToEdit && (
        <EditUser
          open={editUserModalOpen}
          closeModal={() => setEditUserModalOpen(false)}
          user={userToEdit}
          //setOnLicense={setOnLicense}
        />
      )}
      <br />
    </>
  ) : (
    <div className="text-center p-3">
      <h3 className="text-secondary">No content with this filters...</h3>
    </div>
  );
};

Table.propTypes = {
  modifyRole: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, {
  modifyRole,
  modifyStatus,
  modifyTimeManage,
  modifyPassword,
  deleteUser,
})(Table);
