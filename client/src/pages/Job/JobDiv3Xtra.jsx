import React from "react";

export default function JobDiv3Xtra({ detailsDiv2, allTotalPrices }) {
  return (
    <>
      {allTotalPrices.map((price, i) => (
        <div key={i} style={{ border: "0.1px solid #a2a2a2", fontSize: "2vw" }}>
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
            {(price / detailsDiv2[i]?.unit_count).toLocaleString(undefined, {
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
            {(
              price /
              detailsDiv2[i]?.unit_count /
              detailsDiv2[i]?.v.Paper_0_7
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
            {detailsDiv2[i]?.v.Paper_0_7.toLocaleString()}
          </div>{" "}
          <div
            style={{
              width: "15%",
              textAlign: "right",
              display: "inline-block",
            }}
          >
            {detailsDiv2[i]?.unit_count.toLocaleString()}
          </div>{" "}
          <div
            style={{
              width: "15%",
              textAlign: "right",
              display: "inline-block",
            }}
          >
            {" "}
            {detailsDiv2[i]?.v.Paper_1_1 === 4720
              ? "crown"
              : detailsDiv2[i]?.v.Paper_1_1 === 3070
              ? "demy"
              : "none"}
            <b>-</b>
            {detailsDiv2[i]?.v.Paper_0_1 === 3925
              ? "B"
              : detailsDiv2[i]?.v.Paper_0_1 === 5220
              ? "B"
              : detailsDiv2[i]?.v.Paper_0_1 === 5330
              ? "B"
              : detailsDiv2[i]?.v.Paper_0_1 === 4485
              ? "A"
              : detailsDiv2[i]?.v.Paper_0_1 === 5970
              ? "A"
              : detailsDiv2[i]?.v.Paper_0_1 === 6465
              ? "A"
              : "x"}
          </div>
        </div>
      ))}
    </>
  );
}
