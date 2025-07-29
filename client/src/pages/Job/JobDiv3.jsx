import React, { useState, useEffect } from "react";
import Num from "../../elements/NumInput";
import { toLKR } from "../../elements/cal";

export default function JobDiv3({
  allUsernames,
  detailsDiv1,
  detailsDiv2,
  allTotalPrices,
  displayID,
}) {
  const [div2DataTemp, setDiv2DataTemp] = useState(detailsDiv2);

  function NumChanged(e, i) {
    const { name, value } = e.target;
    setDiv2DataTemp((p) => ({ ...p, [i]: { ...p[i], [name]: Number(value) } }));
  }

  return (
    <>
      <li>
        System Submission - Done
        <ul>
          <li>
            <small>{`Submitted by : ${
              allUsernames[detailsDiv1.created_by] || "?"
            } on ${detailsDiv1.created_at_ || "?"}`}</small>
          </li>
        </ul>
      </li>
      <li>
        Estimation - {detailsDiv2.filter((j) => j.deployed).length} /{" "}
        {detailsDiv1.total_jobs}
        <ul>
          {detailsDiv2.map((j, i) => (
            <li key={j.id_each}>
              {`# ${displayID}_${i + 1} : `}
              {j.deployed ? (
                <>
                  <span>
                    <small>
                      <b style={{ color: "green" }}>Submitted. </b>
                      {` ( last edit by : ${
                        allUsernames[j.last_edit_by] || "loading..."
                      } on ${j.last_edit_at_ || "loading..."} )`}
                    </small>
                  </span>
                </>
              ) : (
                <small>
                  <b style={{ color: "firebrick" }}>pending.....</b>
                </small>
              )}
              <ul>
                <li>
                  {j.deployed ? (
                    <>
                      {toLKR(allTotalPrices[i])}{" "}
                      <small style={{ marginLeft: "2%" }}>
                        <label>units : </label>
                        <Num
                          name={"unit_count"}
                          min={1}
                          setTo={detailsDiv2[i].unit_count}
                          changed={(e) => NumChanged(e, i)}
                          width={100}
                          deci={0}
                        />
                        <button
                          disabled={
                            detailsDiv2[i].unit_count ===
                            div2DataTemp[i].unit_count
                          }
                        >
                          save
                        </button>
                      </small>
                    </>
                  ) : null}
                </li>
              </ul>
              <br />
            </li>
          ))}
        </ul>
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
    </>
  );
}
