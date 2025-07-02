import React, { useState } from "react";
import axios from "axios";
import {
  USER_REGISTER_API_URL,
  USER_LOGIN_API_URL,
  CHECK_AUTH_API_URL,
} from "../api/urls";
import { Link } from "react-router-dom";

axios.defaults.withCredentials = true;

export default function Login({ user, setUser }) {
  //
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });
  const [regDetails, setRegDetails] = useState({
    display_name: "",
    regname: "",
    pwr: "",
    pwrr: "",
  });
  const [whichFormShows, setShowForm] = useState(1);
  const [thisShows, setShowing] = useState(true);
  const [pwIsMathing, checkPwMatch] = useState(true);

  const changedLogDetails = (e) => {
    const { name, value } = e.target;
    setLoginDetails((p) => ({ ...p, [name]: value }));
  };
  const changedRegDetails = (e) => {
    const { name, value } = e.target;
    setRegDetails((prev) => {
      const updated = { ...prev, [name]: value };
      updated.pwr === updated.pwrr ? checkPwMatch(true) : checkPwMatch(false);
      return updated;
    });
  };

  const userLogin = async (e) => {
    e.preventDefault();
    setShowing(false);
    try {
      const res = await axios.post(USER_LOGIN_API_URL, loginDetails);

      if (res.data.success) {
        setUser(res.data.user);
        window.location.href = "/";
      } else {
        alert("Login failed");
        setShowing(true);
      }
    } catch (err) {
      alert("Login failed");
      setShowing(true);
    }
  };

  const userRegister = async (e) => {
    e.preventDefault();
    setShowing(false);
    try {
      const res = await axios.post(USER_REGISTER_API_URL, regDetails);
      alert(res.data.message);
      setShowForm(1);
    } catch {
      alert("Registration failed.");
    } finally {
      setShowing(true);
    }
  };

  return (
    <>
      {thisShows && !user.loggedIn && (
        <>
          <div className="form-box book">
            {whichFormShows === 2 ? (
              <Link
                onClick={() => setShowForm(1)}
                style={{ cursor: "pointer" }}
              >
                User Login
              </Link>
            ) : (
              <>
                <h1>Login</h1>
                <form onSubmit={userLogin}>
                  <label>username : </label>
                  <input
                    name="username"
                    type="text"
                    value={loginDetails.username}
                    onChange={changedLogDetails}
                  />
                  <label>password : </label>
                  <input
                    name="password"
                    type="password"
                    value={loginDetails.password}
                    onChange={changedLogDetails}
                  />
                  <button type="submit">login</button>
                </form>
              </>
            )}
          </div>

          <div className="form-box book">
            {whichFormShows === 1 ? (
              <Link
                onClick={() => setShowForm(2)}
                style={{ cursor: "pointer" }}
              >
                Register/Change Password
              </Link>
            ) : (
              <>
                <h1>Register / Change Paaword</h1>{" "}
                <form onSubmit={userRegister}>
                  <label>name : </label>
                  <input
                    name="display_name"
                    type="text"
                    value={regDetails.display_name}
                    onChange={changedRegDetails}
                  />
                  <label>username : </label>
                  <input
                    name="regname"
                    type="text"
                    value={regDetails.regname}
                    onChange={changedRegDetails}
                  />
                  <label>password : </label>
                  <input
                    name="pwr"
                    type="password"
                    value={regDetails.pwr}
                    onChange={changedRegDetails}
                  />
                  <label>repeat password : </label>
                  <input
                    name="pwrr"
                    type="password"
                    value={regDetails.pwrr}
                    onChange={changedRegDetails}
                    style={{ color: pwIsMathing ? "black" : "red" }}
                  />
                  <button disabled={!pwIsMathing} type="submit">
                    submit
                  </button>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
