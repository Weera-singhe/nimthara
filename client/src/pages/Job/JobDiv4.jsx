import React from "react";
import Num from "../../elements/NumInput";

export default function JobDiv4({ allUsernames, detailsDiv1 }) {
  return (
    <>
      <h4>
        <li>
          Submitted to System -
          <small>{` by ${allUsernames[detailsDiv1.created_by - 1] || "?"} on ${
            detailsDiv1.created_at_ || "?"
          }`}</small>
        </li>
        <li>
          Submitted Estimation -
          <small>{` by ???????????????????????????`}</small>
        </li>
        <li>
          Submitted To Customer
          <select>
            <option value="email">emailed</option>
            <option value="post">posted</option>
            <option value="deliver">delivered</option>
          </select>
          <input type="text"></input>
        </li>
        <li>Results</li>
        <li>PO Recieved</li>
        <li>Artwork</li>
        <li>Artwork Approved</li>
        <li>Samples Approved</li>
        <li>Proccesing</li>
        <li>Job Completed</li>
        <li>Delivered</li>
        <li>Payment Recieved</li>
      </h4>
    </>
  );
}
