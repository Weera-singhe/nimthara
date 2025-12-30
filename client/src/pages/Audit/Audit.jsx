import React from "react";
//import React, { useEffect, useState } from "react";
// import Num from "../elements/NumInput";
// import axios from "axios";
// import { Price_API_URL, ADD_Price_API_URL } from "../api/urls";
import { Link } from "react-router-dom";
// import { toLKR } from "../elements/cal";

export default function Audit({ user }) {
  return (
    <>
      <div className="new-division jb">
        <ul>
          <li>
            <Link to={`/audit/ledger`}>Ledger</Link>
          </li>{" "}
          <li>
            <Link to={`/audit/bb`}>Bid Bond</Link>
          </li>
          <li>Petty Cash</li>
          <li>PO</li>
        </ul>
      </div>
    </>
  );
}
