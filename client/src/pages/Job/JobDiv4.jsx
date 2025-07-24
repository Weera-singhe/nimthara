import React from "react";
import Num from "../../elements/NumInput";

export default function JobDiv4({
  allUsernames,
  detailsDiv1,
  detailsDiv3,
  allTotalPrices,
}) {
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
          <small>
            {` by ???????????????????????????`}
            <ul>
              {allTotalPrices.map((price, i) => (
                <li key={i}>
                  <b>#{i + 1}</b>
                  <small style={{ marginLeft: "4%" }}>Total Price:</small>
                  <b>
                    {price.toLocaleString("en-LK", {
                      style: "currency",
                      currency: "LKR",
                    })}
                  </b>
                  <small style={{ marginLeft: "4%" }}>unit price:</small>
                  <b>
                    {(price / detailsDiv3[i]?.unit_count).toLocaleString(
                      "en-LK",
                      {
                        style: "currency",
                        currency: "LKR",
                      }
                    )}
                  </b>
                </li>
              ))}
            </ul>
          </small>
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
