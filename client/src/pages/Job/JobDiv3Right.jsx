import React from "react";

export function calcCalResult(name, v, compID, min_cal_res) {
  let calResult = 0;
  if (compID === "Artwork" || compID === "Delivery") {
    calResult = v?.[name + "_0"];
  } else if (compID === "Plates") {
    calResult =
      v?.[name + "_0"] * v?.[name + "_1"] * v?.[name + "_2"] * v?.[name + "_3"];
  } else if (compID === "Paper") {
    calResult =
      (v?.[name + "_1"] / v?.[name + "_2"]) *
      Math.ceil(
        (v?.[name + "_3"] * v?.[name + "_7"]) / v?.[name + "_4"] +
          v?.[name + "_5"] / v?.[name + "_6"]
      );
  } else if (compID === "Print") {
    const imp =
      (v?.[name + "_0"] / v?.[name + "_1"]) *
      v?.[name + "_2"] *
      v?.[name + "_4"];

    calResult =
      imp < min_cal_res
        ? min_cal_res * v?.[name + "_3"]
        : imp * v?.[name + "_3"];
    min_cal_res = min_cal_res * v?.[name + "_3"];
  } else if (compID === "Cutting" || compID === "Padding") {
    calResult = v?.[name + "_0"] * v?.[name + "_1"];
  } else if (compID === "Perforation" || compID === "Numbering") {
    calResult = v?.[name + "_0"] + v?.[name + "_1"] * v?.[name + "_2"];
  } else if (compID === "Other") {
    calResult =
      ((v?.[name + "_0"] / v?.[name + "_1"]) * v?.[name + "_2"]) /
      v?.[name + "_3"];
  }
  const isBelowMin = calResult <= min_cal_res;

  return { calResult, isBelowMin };
}

export default function JobDiv3Right({ name, v, compID, min_cal_res }) {
  const { calResult, isBelowMin } = calcCalResult(name, v, compID, min_cal_res);

  return (
    <span style={{ color: isBelowMin ? "red" : "black" }}>
      {calResult.toLocaleString("en-LK", {
        style: "currency",
        currency: "LKR",
      })}
    </span>
  );
}
