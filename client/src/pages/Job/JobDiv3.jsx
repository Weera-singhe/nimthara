import React from "react";
//import React, { useState, useEffect } from "react";
//import Num from "../../elements/NumInput";
import { toLKR } from "../../elements/cal";
//import JobDiv2 from "./JobDiv2";

export default function JobDiv3({
  allUsernames,
  detailsDiv1,
  detailsDiv2,
  allTotalPrices,
  displayID,
  //handleSubmit,
}) {
  //const [div2DataTemp, setDiv2DataTemp] = useState(detailsDiv2);

  // function NumChanged(e, i) {
  //   const { name, value } = e.target;
  //   setDiv2DataTemp((p) => ({ ...p, [i]: { ...p[i], [name]: Number(value) } }));
  // }

  // useEffect(() => {
  //   setDiv2DataTemp(detailsDiv2);
  // }, [detailsDiv2]);

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
              {`# ${displayID}_${detailsDiv2[i].cus_id_each || i + 1} : `}
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
                {j.deployed ? (
                  <>
                    <li>
                      <small>
                        <label>Total : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.total_price)}
                      <small style={{ marginLeft: "2%" }}>
                        <label>Total +VAT : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.total_vat)}
                    </li>

                    <li>
                      <small style={{ color: "darkblue" }}>
                        <label>Units :</label>
                      </small>
                      <b style={{ color: "darkblue" }}>
                        {detailsDiv2[i].unit_count.toLocaleString()}
                      </b>
                      <small style={{ marginLeft: "2%" }}>
                        <label>Unit : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.unit_price)}
                      <small style={{ marginLeft: "2%" }}>
                        <label>Unit +VAT : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.unit_vat)}

                      {/* <small style={{ marginLeft: "4%" }}>
                        <label>units : </label>
                        <Num
                          name={"unit_count"}
                          min={1}
                          setTo={detailsDiv2[i]?.unit_count}
                          changed={(e) => NumChanged(e, i)}
                          width={100}
                          deci={0}
                        />
                        <button
                          disabled={
                            detailsDiv2[i].unit_count ===
                            div2DataTemp[i]?.unit_count
                          }
                          onClick={(e) => handleSubmit(e, div2DataTemp[i])}
                        >
                          save
                        </button>
                        {detailsDiv2[i].unit_count !==
                          div2DataTemp[i]?.unit_count && (
                          <>
                            <small style={{ marginLeft: "1%" }}>
                              <label>Unit : </label>
                            </small>
                            {toLKR(
                              allTotalPrices[i]?.total_price /
                                div2DataTemp[i]?.unit_count
                            )}
                            <small style={{ marginLeft: "1%" }}>
                              <label>Unit +VAT : </label>
                            </small>
                            {toLKR(
                              allTotalPrices[i]?.total_vat /
                                div2DataTemp[i]?.unit_count
                            )}
                          </>
                        )}
                      </small> */}
                    </li>
                  </>
                ) : (
                  <li></li>
                )}
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
