import React, { useState, useEffect } from "react";
import Num from "../../elements/NumInput";
import { toLKR } from "../../elements/cal";

export default function JobDiv3({
  mainJDB,
  eachJDB,
  eachJXDB,
  allTotalPrices,
  displayID,
  handleSubmit,
  user,
}) {
  const [tempEstSub, setTempEstSub] = useState([]);
  //const [eachJTemp, setEachJTemp] = useState([]);
  const [tempBB, setTempBB] = useState([]);
  const [tempSampPP, setTempSampPP] = useState([]);
  const [tempRes, setTempRes] = useState([]);
  const [idEachRes, setIDEachRes] = useState(0);
  const [resJsonCh, setResJsonCh] = useState(false);

  useEffect(() => {
    !tempEstSub.length && setTempEstSub(mainJDB);
  }, [mainJDB, tempEstSub.length]);

  useEffect(() => {
    !tempBB.length && setTempBB(eachJXDB);
  }, [eachJXDB, tempBB.length]);

  useEffect(() => {
    !tempRes.length && setTempRes(eachJXDB);
  }, [eachJXDB, tempRes.length]);

  useEffect(() => {
    !tempSampPP.length && setTempSampPP(eachJXDB);
  }, [eachJXDB, tempSampPP.length]);

  function strChanged_M(e) {
    const { name, value } = e.target;
    setTempEstSub((p) => ({ ...p, [name]: value }));
  }
  function NumChanged_M(e) {
    const { name, value } = e.target;
    setTempEstSub((p) => ({ ...p, [name]: Number(value) }));
  }
  function NumChanged_xtra(e, id_each) {
    const { name, value } = e.target;
    if (name === "bb" || name === "bb_amount") {
      setTempBB((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    } else if (name === "samp_pp") {
      setTempSampPP((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    } else if (name === "res_status") {
      setTempRes((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    }
  }

  function resChanged(e, id_each, i) {
    const { name, value } = e.target;
    const safeval = name === "v" ? Number(value) : value;

    setTempRes((prev) =>
      prev.map((slot) =>
        slot.id_each === id_each
          ? {
              ...slot,
              result: {
                ...(slot.result || {}),
                [i]: {
                  ...((slot.result && slot.result[i]) || {}),
                  [name]: safeval,
                  ...(i === 0 ? { n: "Nimthara Printers" } : {}),
                },
              },
            }
          : slot
      )
    );
    setResJsonCh(true);
  }

  function onSubmit(e, i) {
    const name = e.target.name;
    const exprt =
      name === "est_sub"
        ? tempEstSub
        : name === "bb"
        ? tempBB[i]
        : name === "samp_pp"
        ? tempSampPP[i]
        : tempRes[i];
    handleSubmit(exprt, name);

    name === "result" && setResJsonCh(false);
  }
  const userJobsL2 = user.level_jobs > 1 && user.loggedIn;
  const userAuditL2 = user.level_audit > 1 && user.loggedIn;
  const estiSubDis =
    (tempEstSub.submit_method === mainJDB.submit_method &&
      tempEstSub.submit_note1 === mainJDB.submit_note1 &&
      tempEstSub.submit_note2 === mainJDB.submit_note2 &&
      tempEstSub.submit_at_ === mainJDB.submit_at_) ||
    !userJobsL2;
  const totalJobs = mainJDB?.total_jobs;
  const pendingDep = totalJobs - eachJDB.filter((j) => j.deployed).length;
  const pendingSPP = totalJobs - tempSampPP.filter((j) => j.samp_pp > 1).length;
  const pendingRes = totalJobs - tempRes.filter((j) => j.res_status).length;

  useEffect(() => {
    console.log(tempRes[0]?.result);
  }, [tempRes]);

  useEffect(() => {
    console.log("xchanged : ", eachJDB);
  }, [eachJDB]);

  return (
    <ul className="jb">
      {/*1_SubDiv_________________________________________*/}
      <li>
        Job ID :<b> {displayID}</b>
        <ul>
          <li>
            <small>{`Created at : ${mainJDB?.created_at_t || "?"}`}</small>
          </li>
        </ul>
      </li>

      {/*2_SubDiv_________________________________________*/}
      <li>
        {`Estimation : `}
        <small style={{ color: "firebrick" }}>
          {pendingDep ? ` ${pendingDep} pending...` : "✅"}
        </small>
        <ul>
          {eachJDB.map((j, i) => (
            <li
              key={j.id_each}
              style={{ backgroundColor: !j.deployed && "mistyrose" }}
            >
              {`# ${displayID}_${j.cus_id_each || j.id_each} : `}
              {j.deployed ? (
                <>
                  <span>
                    <small>
                      <b style={{ color: "green" }}>Deployed. </b>
                      {/* {` ( last edit by : ${
                        allUsernames[j.last_qt_edit_by] || "loading..."
                      } on ${j.last_qt_edit_at_t || "loading..."} )`} */}
                    </small>
                  </span>
                  <ul>
                    <li>
                      <div className="cellx">UNITS</div>
                      <div className="cellx">NET</div>
                      <div className="cellx">VAT</div>
                      <div className="cellx">NET+VAT</div>
                      <div className="cellx">SSCL</div>
                      <div className="cellx">NET+VAT+SSCL</div>
                      <br />
                      <div className="cellx">
                        {eachJDB[i].unit_count.toLocaleString()}
                      </div>
                      <div className="cellx">
                        <b>{toLKR(allTotalPrices[i]?.total_price)}</b>
                      </div>
                      <div className="cellx">
                        <b>+</b>
                        {toLKR(allTotalPrices[i]?.total_vat)}
                      </div>
                      <div className="cellx">
                        <b>{toLKR(allTotalPrices[i]?.total_vat_)}</b>
                      </div>
                      <div className="cellx">
                        <b>+</b>
                        {toLKR(allTotalPrices[i]?.total_sscl)}
                      </div>
                      <div className="cellx">
                        <b>{toLKR(allTotalPrices[i]?.total_ssclvat_)}</b>
                      </div>
                      <br />
                      <div className="cellx">1</div>
                      <div className="cellx">
                        <b>{toLKR(allTotalPrices[i]?.unit_price)}</b>
                      </div>
                      <div className="cellx">
                        <b>+</b>
                        {toLKR(allTotalPrices[i]?.unit_vat)}
                      </div>
                      <div className="cellx">
                        <b>{toLKR(allTotalPrices[i]?.unit_vat_)}</b>
                      </div>
                      <div className="cellx">
                        <b>+</b>
                        {toLKR(allTotalPrices[i]?.unit_sscl)}
                      </div>
                      <div className="cellx">
                        <b>{toLKR(allTotalPrices[i]?.unit_ssclvat_)}</b>
                      </div>
                      <br />
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <small>
                    <b style={{ color: "firebrick" }}>pending.....</b>
                  </small>
                  <ul>
                    <li></li>
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      </li>
      {/*3_SubDiv_________________________________________*/}
      <li>
        {`Bid Bond : `}
        <small style={{ color: "firebrick" }}>
          {!tempBB[0]?.bb ? "pending..." : "✅"}
        </small>

        <ul>
          <li
            style={{
              backgroundColor: !tempBB[0]?.bb && "mistyrose",
            }}
          >
            {`# ${displayID} : `}
            <small>
              <label>Not Needed :</label>
              <input
                name="bb"
                type="checkbox"
                checked={tempBB[0]?.bb === 1}
                value={1}
                onChange={(e) => NumChanged_xtra(e, 1)}
              />
              <label>Processing :</label>
              <input
                name="bb"
                type="checkbox"
                checked={!tempBB[0]?.bb}
                value={0}
                onChange={(e) => NumChanged_xtra(e, 1)}
              />
              <label>Approved : </label>
              <input
                name="bb"
                type="checkbox"
                checked={tempBB[0]?.bb === 2}
                value={2}
                onChange={(e) => NumChanged_xtra(e, 1)}
              />
              <label>Amount : </label>
              {tempBB[0]?.bb !== 1 ? (
                <Num
                  name="bb_amount"
                  min={0}
                  setTo={tempBB[0]?.bb_amount || 0}
                  changed={(e) => NumChanged_xtra(e, 1)}
                  width={100}
                  deci={2}
                />
              ) : (
                <input
                  style={{ width: "100px", marginRight: "0" }}
                  readOnly
                  value="✅"
                />
              )}
              {eachJXDB[0]?.bb === 2 &&
                (tempBB[0]?.bb !== 2 ||
                  tempBB[0]?.bb_amount !== eachJXDB[0]?.bb_amount) && (
                  <small style={{ color: "red" }}>
                    cannot change once approved
                  </small>
                )}
              <span style={{ marginLeft: "2.5%" }}>
                {/*once approved cannot change*/}
                {(userAuditL2 || userJobsL2) &&
                  (tempBB[0]?.bb !== eachJXDB[0]?.bb ||
                    tempBB[0]?.bb_amount !== eachJXDB[0]?.bb_amount) &&
                  eachJXDB[0]?.bb !== 2 && (
                    <button name="bb" onClick={(e) => onSubmit(e, 0)}>
                      Save
                    </button>
                  )}
              </span>
            </small>
          </li>
        </ul>
      </li>

      {/*3_SubDiv_________________________________________*/}
      <li>
        {`Samples (Paper/Dummy) : `}
        <small style={{ color: "firebrick" }}>
          {pendingSPP ? ` ${pendingSPP} pending...` : "✅"}
        </small>
        <ul>
          {/* */}
          {eachJXDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const sppChanged = tempSampPP[i]?.samp_pp !== j.samp_pp;

            // const lastEditText = j.last_samppp_edit_by
            //   ? ` ( last edit at ${j.last_samppp_edit_at_t} by ${
            //       allUsernames[j.last_samppp_edit_by]
            //     } ) `
            //   : "";

            return (
              <li
                key={j.id_each}
                style={{
                  backgroundColor:
                    (tempSampPP[i]?.samp_pp < 2 || !tempSampPP[i]?.samp_pp) &&
                    "mistyrose",
                }}
              >
                {`# ${displayID}_${eachJDB[i]?.cus_id_each || j.id_each} : `}
                <small>
                  <label>Not Needed : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={tempSampPP[i]?.samp_pp === 3}
                    value={3}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />
                  <label>Processing : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={!tempSampPP[i]?.samp_pp}
                    value={0}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />{" "}
                  <label>Ready to Submit : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={tempSampPP[i]?.samp_pp === 1}
                    value={1}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />
                  <label>Approved : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={tempSampPP[i]?.samp_pp === 2}
                    value={2}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />
                  <span>
                    {userJobsL2 && sppChanged && (
                      <button name="samp_pp" onClick={(e) => onSubmit(e, i)}>
                        Save
                      </button>
                    )}
                  </span>
                </small>
              </li>
            );
          })}
        </ul>
      </li>
      <li>
        {`Estimation Submission : `}
        {/* <small>
          {mainJDB?.last_sub_edit_by &&
            ` ( last edit by ${allUsernames[mainJDB?.last_sub_edit_by]} at ${
              mainJDB?.last_sub_edit_at_t
            } ) `}
        </small> */}
        <ul>
          <li
            style={{
              backgroundColor: !tempEstSub.submit_method && "mistyrose",
            }}
          >
            <span># {displayID} : </span>
            <select
              name="submit_method"
              onChange={NumChanged_M}
              value={tempEstSub.submit_method || 0}
            >
              <option value={0}></option>
              <option value={1}>email</option>
              <option value={2}>deliver</option>
              <option value={3}>post</option>
              <option value={4}>direct</option>
              <option value={5}>not bidding</option>
            </select>
            {tempEstSub.submit_method > 0 && (
              <>
                <span>
                  {tempEstSub.submit_method === 5 ? " reason : " : " to : "}
                </span>
                <input
                  type="text"
                  name="submit_note1"
                  onChange={strChanged_M}
                  value={tempEstSub.submit_note1 || ""}
                  style={{ width: "30%" }}
                />
                {tempEstSub.submit_method !== 5 && (
                  <>
                    <span>by : </span>
                    <input
                      type="text"
                      name="submit_note2"
                      onChange={strChanged_M}
                      value={tempEstSub.submit_note2 || ""}
                    />
                    <span>at : </span>
                    <input
                      type="date"
                      name="submit_at_"
                      onChange={strChanged_M}
                      value={tempEstSub.submit_at_ || ""}
                    />
                  </>
                )}
              </>
            )}

            {!estiSubDis && (
              <button name="est_sub" onClick={onSubmit}>
                save
              </button>
            )}
          </li>
        </ul>
      </li>

      {/*4_SubDiv_________________________________________*/}
      <li>
        {`Results : `}

        <small style={{ color: "firebrick" }}>
          {pendingRes ? ` ${pendingRes} pending...` : "✅"}
        </small>

        <ul>
          <li>
            <ul>
              {eachJXDB.map((j, i) => (
                <li
                  key={i}
                  style={{
                    backgroundColor: !tempRes[i]?.res_status && "mistyrose",
                  }}
                >
                  {`# ${displayID}_${eachJDB[i].cus_id_each || j.id_each}`}
                  <small>
                    <span>
                      {!j.res_status
                        ? "Waiting"
                        : j.res_status === 1
                        ? "Private"
                        : "Published"}
                    </span>
                    {/* <small>
                      {j?.last_res_edit_by
                        ? ` ( last edit at ${j.last_res_edit_at_t} by ${
                            allUsernames[j.last_res_edit_by]
                          } ) `
                        : ""}
                    </small> */}
                    {j.res_status === 2 && (
                      <ol>
                        {Object.values(j.result || {})
                          .filter((r) => r?.v > 0)
                          .sort((a, b) => a.v - b.v)
                          .map((r, idx) => (
                            <li key={idx}>{`${r.n} : ${toLKR(r.v)}`}</li>
                          ))}
                      </ol>
                    )}
                  </small>
                </li>
              ))}
            </ul>
          </li>
          <li>
            {(() => {
              const totRes = allTotalPrices.find(
                (item) => item.id_each === idEachRes
              );
              const tempJ = tempRes[idEachRes - 1];
              const dbJX = eachJXDB[idEachRes - 1];
              const dbJ = eachJDB[idEachRes - 1];
              const resultsChanged =
                tempJ?.res_status !== dbJX?.res_status || resJsonCh;

              const pubEmpty =
                tempJ?.res_status === 2 && !tempJ?.result?.[0]?.v;

              return (
                <>
                  <small style={{ color: "darkblue" }}>Edit Results : </small>
                  {userJobsL2 && resultsChanged && idEachRes ? (
                    <>
                      <input
                        style={{ width: "12%" }}
                        value={`# ${displayID}_${
                          dbJ?.cus_id_each || dbJ?.id_each
                        } `}
                        readOnly={true}
                      />
                      <button
                        name="result"
                        onClick={(e) => onSubmit(e, idEachRes - 1)}
                        disabled={pubEmpty}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <select
                        style={{ width: "12%" }}
                        value={idEachRes}
                        onChange={
                          resultsChanged
                            ? undefined
                            : (e) => setIDEachRes(Number(e.target.value))
                        }
                      >
                        <option value={0}></option>
                        {eachJDB
                          .filter((j) => j.deployed)
                          .map((j) => (
                            <option key={j.id_each} value={j.id_each}>
                              {`# ${displayID}_${j.cus_id_each || j.id_each} `}
                            </option>
                          ))}
                      </select>
                    </>
                  )}

                  {idEachRes ? (
                    <>
                      <br />
                      <br />
                      <small>
                        <label>Waiting : </label>
                        <input
                          name="res_status"
                          type="checkbox"
                          checked={!tempJ?.res_status || false}
                          value={0}
                          onChange={(e) => NumChanged_xtra(e, idEachRes)}
                        />

                        <label style={{ color: "green" }}>Published : </label>
                        <input
                          name="res_status"
                          type="checkbox"
                          checked={tempJ?.res_status === 2 || false}
                          value={2}
                          onChange={(e) => NumChanged_xtra(e, idEachRes)}
                        />
                        <label style={{ color: "red" }}>Private : </label>
                        <input
                          name="res_status"
                          type="checkbox"
                          checked={tempJ?.res_status === 1 || false}
                          value={1}
                          onChange={(e) => NumChanged_xtra(e, idEachRes)}
                        />
                      </small>
                      {tempJ.res_status === 2 && (
                        <>
                          <br />
                          <br />
                          <input
                            type="text"
                            readOnly
                            value="Nimthara Printers"
                          />

                          <select
                            name="v"
                            onChange={(e) => resChanged(e, idEachRes, 0)}
                            value={tempJ.result?.[0]?.v || 0}
                          >
                            <option></option>
                            <option value={totRes?.total_price}>
                              {`total : ${toLKR(totRes?.total_price)}`}
                            </option>
                            <option value={totRes?.total_vat_}>
                              {`total+VAT : ${toLKR(totRes?.total_vat_)}`}
                            </option>
                            <option value={totRes?.total_ssclvat_}>
                              {`total+VAT+SSCL : ${toLKR(
                                totRes?.total_ssclvat_
                              )}`}
                            </option>
                            <option value={totRes?.unit_price}>
                              {`unit : ${toLKR(totRes?.unit_price)}`}
                            </option>
                            <option value={totRes?.unit_vat_}>
                              {`unit+VAT : ${toLKR(totRes?.unit_vat_)}`}
                            </option>
                            <option value={totRes?.unit_ssclvat_}>
                              {`unit+VAT+SSCL : ${toLKR(
                                totRes?.unit_ssclvat_
                              )}`}
                            </option>
                          </select>

                          {[...Array(9)].map((_, idx) => (
                            <div key={idx}>
                              <br />
                              <input
                                type="text"
                                name="n"
                                value={tempJ.result?.[idx + 1]?.n || ""}
                                onChange={(e) =>
                                  resChanged(e, idEachRes, idx + 1)
                                }
                              />
                              <Num
                                name="v"
                                min={0}
                                setTo={tempJ.result?.[idx + 1]?.v || 0}
                                changed={(e) =>
                                  resChanged(e, idEachRes, idx + 1)
                                }
                                deci={2}
                              />
                              <br />
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </>
              );
            })()}
          </li>
        </ul>
      </li>
    </ul>
  );
}
