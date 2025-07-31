import React, { useState, useEffect } from "react";
//import Num from "../../elements/NumInput";
import { toLKR } from "../../elements/cal";

export default function JobDiv3({
  allUsernames,
  div1DataDB,
  div2DataDB,
  allTotalPrices,
  displayID,
}) {
  const [div1DataTemp, setDiv1DataTemp] = useState(div1DataDB);

  useEffect(() => {
    setDiv1DataTemp(div1DataDB);
  }, [div1DataDB]);

  function strChanged(e) {
    const { name, value } = e.target;
    setDiv1DataTemp((p) => ({ ...p, [name]: value }));
  }
  function NumChanged(e) {
    const { name, value } = e.target;
    setDiv1DataTemp((p) => ({ ...p, [name]: Number(value) }));
  }
  const submitByDis =
    JSON.stringify(div1DataTemp) === JSON.stringify(div1DataDB) ||
    div1DataTemp.submit_method === 0 ||
    !(div1DataTemp.submit_note1 || "").trim() ||
    !(div1DataTemp.submit_note2 || "").trim();
  return (
    <>
      <li>
        Job ID :<b> {displayID}</b>
        <ul>
          <li>
            <small>{`Created by : ${
              allUsernames[div1DataDB?.created_by] || "?"
            } on ${div1DataDB?.created_at_ || "?"}`}</small>
          </li>
        </ul>
      </li>
      <li>
        Estimation - {div2DataDB.filter((j) => j.deployed).length} /{" "}
        {div1DataDB?.total_jobs}
        <ul>
          {div2DataDB.map((j, i) => (
            <li key={j.id_each}>
              {`# ${displayID}_${div2DataDB[i].cus_id_each || i + 1} : `}
              {j.deployed ? (
                <>
                  <span>
                    <small>
                      <b style={{ color: "green" }}>Deployed. </b>
                      {` ( last edit by : ${
                        allUsernames[j.last_qt_edit_by] || "loading..."
                      } on ${j.last_qt_edit_at_ || "loading..."} )`}
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
                        {div2DataDB[i].unit_count.toLocaleString()}
                      </b>
                      <small style={{ marginLeft: "2%" }}>
                        <label>Unit : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.unit_price)}
                      <small style={{ marginLeft: "2%" }}>
                        <label>Unit +VAT : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.unit_vat)}
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
        {`Submit by : `}
        <select
          name="submit_method"
          onChange={NumChanged}
          value={div1DataTemp.submit_method || 0}
        >
          <option value={0}></option>
          <option value={1}>email</option>
          <option value={2}>deliver</option>
          <option value={3}>post</option>
        </select>
        <input
          type="text"
          name="submit_note1"
          onChange={strChanged}
          value={div1DataTemp.submit_note1 || ""}
          style={{ width: "30%" }}
        ></input>{" "}
        <input
          type="text"
          name="submit_note2"
          onChange={strChanged}
          value={div1DataTemp.submit_note2 || ""}
        ></input>
        {!submitByDis && <button>save</button>}
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
