import React, { useState } from "react";
import Num from "../../elements/NumInput";
import JobDiv3Mid from "./JobDiv3Mid";
import JobDiv3Right, { calcCalResult } from "./JobDiv3Right";

export default function JobDiv3({
  qts_componants,
  jobDetails,
  handleChangeNum,
  handleChangeStr,
  handleSubmit,
  hasChanged,
  allPapers,
  showQTS_,
  setShowQTS_,
}) {
  let totalSum = 0;

  qts_componants.forEach((comp) => {
    const count = jobDetails.loop_count?.[comp.name] || 0;
    for (let i = 0; i < count; i++) {
      const name = `${comp.name}_${i}`;
      const { calResult } = calcCalResult(
        name,
        jobDetails.v,
        comp.name,
        comp.min_cal_res
      );
      totalSum += calResult;
    }
  });
  const unit_price = Number(
    ((totalSum + jobDetails.profit) / jobDetails.unit_count).toFixed(2)
  );
  const total_price = unit_price * jobDetails.unit_count;
  const unit_vat = unit_price * 1.18;
  const total_vat = total_price * 1.18;

  return (
    <div>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowQTS_(!showQTS_);
        }}
      >
        {showQTS_ ? "Hide" : "Show"}
      </a>
      <br />
      <br />
      {showQTS_ && (
        <form onSubmit={handleSubmit}>
          <label>Total Units: </label>
          <Num
            name={"unit_count"}
            min={1}
            setTo={jobDetails.unit_count}
            changed={handleChangeNum}
            width={100}
            deci={0}
          />
          <span className="needgap" />
          <label>Total Items: </label>
          <Num
            name={"item_count"}
            min={1}
            setTo={jobDetails.item_count}
            changed={handleChangeNum}
            width={100}
            deci={0}
          />
          <br />
          <br />
          <div></div>
          {/*checkboxex*/}
          {qts_componants.map((comp) => (
            <div key={comp.id} className="boxyy">
              <label>{comp.name} : </label>
              <Num
                name={comp.name}
                setTo={jobDetails.loop_count?.[comp.name] || 0}
                changed={(e) => handleChangeNum(e, "loop_count")}
                width={30}
                max={comp.max}
                deci={0}
              />
            </div>
          ))}
          <br />
          <br />
          {qts_componants.map((comp) => (
            <div key={comp.id}>
              {Array.from({
                length: jobDetails.loop_count?.[comp.name] || 0,
              }).map((_, comp_repeat_index) => (
                <div key={comp_repeat_index}>
                  {/* ///////LEFT//////// */}
                  <div className="boxyy" style={{ width: "8%" }}>
                    {comp.name === "Other" ? (
                      <input
                        type="text"
                        name={`Other_${comp_repeat_index}`}
                        value={
                          jobDetails.notes_other?.[`Other_${comp_repeat_index}`]
                        }
                        style={{ width: "100%" }}
                        onChange={(e) => handleChangeStr(e, "notes_other")}
                      />
                    ) : (
                      comp.name
                    )}
                  </div>

                  {/* ///////MIDDLE//////// */}
                  <div className="boxyy" style={{ width: "80%" }}>
                    <JobDiv3Mid
                      name={`${comp.name}_${comp_repeat_index}`}
                      changed={(e) => handleChangeNum(e, "v")}
                      changedStr={(e) => handleChangeStr(e, "v")}
                      v={jobDetails.v}
                      comp_repeat_index={comp_repeat_index}
                      compID={comp.name}
                      qts_componants={qts_componants}
                      allPapers={allPapers}
                    />
                  </div>

                  {/* ///////RIGHT//////// */}
                  <div className="boxyy" style={{ width: "10%" }}>
                    <JobDiv3Right
                      name={`${comp.name}_${comp_repeat_index}`}
                      v={jobDetails.v}
                      compID={comp.name}
                      min_cal_res={comp.min_cal_res}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
          <br />
          <br />
          <h5 style={{ display: "inline-block", marginRight: "3%" }}>
            Total Cost:{" "}
            {totalSum.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </h5>{" "}
          <Num
            name={"profit"}
            setTo={jobDetails.profit || 0}
            changed={handleChangeNum}
            width={100}
            deci={2}
          />
          <b>||</b>
          <Num
            name={"profit"}
            setTo={(jobDetails.profit / totalSum) * 100 || 0}
            width={70}
            deci={2}
            changed={(e) => {
              const percent = Number(e.target.value);
              const profit = (totalSum / 100) * percent;
              handleChangeNum({
                target: {
                  name: "profit",
                  value: profit,
                },
              });
            }}
          />
          <b>%</b>
          <h3>
            <small>
              {" "}
              <small> Total Price: </small>{" "}
            </small>
            {total_price.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
            <small style={{ marginLeft: "2%" }}>
              {" "}
              <small> Unit Price: </small>{" "}
            </small>
            {unit_price.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}{" "}
            <small style={{ marginLeft: "4%" }}>
              {" "}
              <small> Total +VAT: </small>{" "}
            </small>
            {total_vat.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}{" "}
            <small style={{ marginLeft: "2%" }}>
              <small> Unit +VAT: </small>
            </small>
            {unit_vat.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </h3>
          {hasChanged && <button type="submit">Save</button>}
        </form>
      )}
    </div>
  );
}
