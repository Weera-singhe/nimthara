import React from "react";
import { Link } from "react-router-dom";

export default function Welcome({ user }) {
  console.log(user);
  return (
    <div className="new-division">
      {user.loggedIn ? (
        <>
          <h4 style={{ color: "yellowgreen" }}>{"Log In Success..."}</h4>
          <h3>
            {`Logged as `}
            <span style={{ color: "firebrick", fontWeight: "bold" }}>
              {user?.display_name || "error"}
            </span>
          </h3>
        </>
      ) : user.loggedIn === null ? (
        <>{"server is loading..."}</>
      ) : (
        <>
          <h3>
            {"Please "}
            <Link to="/login">{"Login"}</Link> {" for full access..."}
          </h3>
        </>
      )}
    </div>
  );
}
