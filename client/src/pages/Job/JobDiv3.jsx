import React, { useState, useEffect } from "react";
import Num from "../../elements/NumInput";
import { toLKR } from "../../elements/cal";

export default function JobDiv3({
  allUsernames,
  div1DataDB,
  div2DataDB,
  allTotalPrices,
  displayID,
  handleSubmit,
  user,
  setDiv2DataDB,
}) {
  const [div1DataTemp, setDiv1DataTemp] = useState(div1DataDB);
  const [selctedforResult, setSelctedforResult] = useState(0);

  useEffect(() => {
    console.log("div 3 : tmp set to db");
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
  function sampPPChanged(e, id_each) {
    const { checked, value } = e.target;
    console.log("check : ", value, checked);

    setDiv2DataDB((prev) =>
      prev.map((slot) =>
        slot.id_each === id_each ? { ...slot, samp_pp: Number(value) } : slot
      )
    );
  }

  function onSubmit(e, form) {
    e.preventDefault();
    handleSubmit(div1DataTemp, form);
  }
  const submitByDis =
    (div1DataTemp.submit_method === div1DataDB.submit_method &&
      div1DataTemp.submit_note1 === div1DataDB.submit_note1 &&
      div1DataTemp.submit_note2 === div1DataDB.submit_note2) ||
    user.level_jobs < 2 ||
    !user.loggedIn;

  useEffect(() => {
    console.log("data 2 from db : ", div2DataDB);
  }, [div2DataDB]);
  useEffect(() => {
    console.log("totals  from db : ", allTotalPrices);
  }, [allTotalPrices]);

  return (
    <>
      {/*1_SubDiv_________________________________________*/}
      <li>
        Job ID :<b> {displayID}</b>
        <ul>
          <li>
            <small>{`Created by : ${
              allUsernames[div1DataDB?.created_by] || "?"
            } on ${div1DataDB?.created_at_t || "?"}`}</small>
          </li>
        </ul>
      </li>

      {/*2_SubDiv_________________________________________*/}
      <li>
        Estimation - {div2DataDB.filter((j) => j.deployed).length} /{" "}
        {div1DataDB?.total_jobs}
        <ul>
          {div2DataDB.map((j, i) => (
            <li key={j.id_each}>
              {`# ${displayID}_${j.cus_id_each || j.id_each} : `}
              {j.deployed ? (
                <>
                  <span>
                    <small>
                      <b style={{ color: "green" }}>Deployed. </b>
                      {` ( last edit by : ${
                        allUsernames[j.last_qt_edit_by] || "loading..."
                      } on ${j.last_qt_edit_at_t || "loading..."} )`}
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

      {/*3_SubDiv_________________________________________*/}
      <li>
        {`Sample Submission : `}
        <ul>
          {div2DataDB.map((j, i) => (
            <li key={j.id_each}>
              {`# ${displayID}_${j.cus_id_each || j.id_each} : `}
              <small style={{ marginLeft: "2%" }}>
                <label>Processing : </label>
                <input
                  type="checkbox"
                  checked={!div2DataDB[i]?.samp_pp}
                  value={0}
                  onChange={(e) => sampPPChanged(e, j.id_each)}
                />{" "}
                <label>Submitted : </label>
                <input
                  type="checkbox"
                  checked={div2DataDB[i]?.samp_pp === 1}
                  value={1}
                  onChange={(e) => sampPPChanged(e, j.id_each)}
                />
                <label>Approved : </label>
                <input
                  type="checkbox"
                  checked={div2DataDB[i]?.samp_pp === 2}
                  value={2}
                  onChange={(e) => sampPPChanged(e, j.id_each)}
                />
                <label>Not Needed : </label>
                <input
                  type="checkbox"
                  checked={div2DataDB[i]?.samp_pp === 3}
                  value={3}
                  onChange={(e) => sampPPChanged(e, j.id_each)}
                />
              </small>
            </li>
          ))}
        </ul>
      </li>
      <li>
        {`Bid Submission : `}
        <ul>
          <li>
            <form onSubmit={(e) => onSubmit(e, "form1")} name="form1">
              <span># {displayID} : </span>
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
              {div1DataTemp.submit_method > 0 && (
                <>
                  <span>to : </span>
                  <input
                    type="text"
                    name="submit_note1"
                    onChange={strChanged}
                    value={div1DataTemp.submit_note1 || ""}
                    style={{ width: "30%" }}
                  ></input>
                  <span>by : </span>
                  <input
                    type="text"
                    name="submit_note2"
                    onChange={strChanged}
                    value={div1DataTemp.submit_note2 || ""}
                  ></input>
                </>
              )}

              {!submitByDis && <button type="submit">save</button>}
            </form>
          </li>
        </ul>
      </li>

      {/*4_SubDiv_________________________________________*/}
      <li>
        {`Results : `}

        <ul>
          <small>Pending : </small>
          <input type="checkbox" />
          <small>Not Public : </small>
          <input type="checkbox" />
          <li>
            <select
              value={selctedforResult}
              onChange={(e) => setSelctedforResult(Number(e.target.value))}
            >
              <option value={0}></option>
              {div2DataDB
                .filter((j) => j.deployed)
                .map((j) => (
                  <option key={j.id_each} value={j.id_each}>
                    {`# ${displayID}_${j.cus_id_each || j.id_each} `}
                  </option>
                ))}
            </select>
            <br />
            <br />
            {selctedforResult > 0 && (
              <>
                <input type="text" readOnly={true} value="Nimthara Printers" />
                <input
                  type="text"
                  // readOnly={true}value={allTotalPrices.find((p) => p.id_each === selctedforResult)?.total_price}
                  style={{ width: "100px" }}
                />
                <br />
                <input type="text" />
                <Num />
                <br /> <input type="text" />
                <Num />
                <br /> <input type="text" />
                <Num />
                <br />
                <input type="text" />
                <Num />
              </>
            )}
          </li>
        </ul>
      </li>
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
