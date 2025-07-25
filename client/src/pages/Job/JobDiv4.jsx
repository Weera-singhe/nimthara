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
            {allTotalPrices.map((price, i) => (
              <div
                key={i}
                style={{ border: "0.1px solid #a2a2a2", fontSize: "2vw" }}
              >
                <div
                  style={{
                    width: "5%",
                    display: "inline-block",
                  }}
                >
                  {"#" + (i + 1)}
                </div>{" "}
                <div
                  style={{
                    width: "20%",
                    textAlign: "right",
                    display: "inline-block",
                  }}
                >
                  {price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div
                  style={{
                    width: "15%",
                    textAlign: "right",
                    display: "inline-block",
                  }}
                >
                  {(price / detailsDiv3[i]?.unit_count).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
                <div
                  style={{
                    width: "15%",
                    textAlign: "right",
                    display: "inline-block",
                  }}
                >
                  {(
                    price /
                    detailsDiv3[i]?.unit_count /
                    detailsDiv3[i]?.v.Paper_0_7
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>{" "}
                <div
                  style={{
                    width: "10%",
                    textAlign: "right",
                    display: "inline-block",
                  }}
                >
                  {detailsDiv3[i]?.v.Paper_0_7.toLocaleString()}
                </div>{" "}
                <div
                  style={{
                    width: "15%",
                    textAlign: "right",
                    display: "inline-block",
                  }}
                >
                  {detailsDiv3[i]?.unit_count.toLocaleString()}
                </div>{" "}
                <div
                  style={{
                    width: "15%",
                    textAlign: "right",
                    display: "inline-block",
                  }}
                >
                  {" "}
                  {detailsDiv3[i]?.v.Paper_1_1 === 4720
                    ? "crown"
                    : detailsDiv3[i]?.v.Paper_1_1 === 3070
                    ? "demy"
                    : "none"}
                  <b>-</b>
                  {detailsDiv3[i]?.v.Paper_0_1 === 3925
                    ? "B"
                    : detailsDiv3[i]?.v.Paper_0_1 === 5220
                    ? "B"
                    : detailsDiv3[i]?.v.Paper_0_1 === 5330
                    ? "B"
                    : detailsDiv3[i]?.v.Paper_0_1 === 4485
                    ? "A"
                    : detailsDiv3[i]?.v.Paper_0_1 === 5970
                    ? "A"
                    : detailsDiv3[i]?.v.Paper_0_1 === 6465
                    ? "A"
                    : "x"}
                </div>
              </div>
            ))}
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
