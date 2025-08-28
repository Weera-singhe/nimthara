import React, { useState, useEffect } from "react";
import Num from "../../elements/NumInput";
//import { toLKR } from "../../elements/cal";

export default function JobDiv3({
  mainJDB,
  eachJDB,
  eachJXDB,
  allTotalPrices,
  displayID,
  handleSubmit,
  user,
}) {
  const [tempEjx, setTempEjx] = useState([]);
  const [tempEjb, setTempEjb] = useState([]);

  useEffect(() => {
    !tempEjb.length && setTempEjb(eachJDB);
  }, [eachJDB, tempEjb.length]);

  useEffect(() => {
    !tempEjx.length && setTempEjx(eachJXDB);
  }, [eachJXDB, tempEjx.length]);

  function NumChanged(e, id_each) {
    const { name, value } = e.target;

    if (
      name === "j_status" ||
      name === "aw" ||
      name === "samp_pr" ||
      name === "deadline_dlty"
    ) {
      setTempEjb((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    }
    if (name === "pb" || name === "pb_amount" || name === "po") {
      setTempEjx((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    }
  }
  function StrChanged(e, id_each) {
    const { name, value } = e.target;

    if (name === "po_date_") {
      setTempEjx((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: value } : slot
        )
      );
    }
    if (name === "deadline_dl_") {
      setTempEjb((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: value } : slot
        )
      );
    }
  }

  function onSubmit(e, exprt) {
    const name = e.target.name;
    handleSubmit(exprt, name);
  }
  const userJobsL2 = user.level_jobs > 1 && user.loggedIn;
  //  const userJobsL3 = user.level_jobs > 2 && user.loggedIn;
  const userAuditL2 = user.level_audit > 1 && user.loggedIn;

  const totalJobs = mainJDB?.total_jobs;

  const pendingQuali = totalJobs - tempEjb.filter((j) => j.j_status).length;

  const donePB = tempEjx.filter((j, idx) => j.pb || !eachJDB[idx].j_status);
  const pendingPB = totalJobs - donePB.length;

  const donePO = tempEjx.filter((j, idx) => j.po || !eachJDB[idx].j_status);
  const pendingPO = totalJobs - donePO.length;

  const doneAW = tempEjb.filter((j, idx) => j.aw > 1 || !eachJDB[idx].j_status);
  const pendingAW = totalJobs - doneAW.length;

  const donesamp_pr = tempEjb.filter(
    (j, idx) => j.samp_pr > 1 || !eachJDB[idx].j_status
  );
  const pendingSamp_pr = totalJobs - donesamp_pr.length;

  useEffect(() => {
    console.log("eachJXDB : ", eachJXDB);
  }, [eachJXDB]);

  return (
    <ul className="jb">
      <li>
        Customer Decision :
        <small style={{ color: "firebrick" }}>
          {pendingQuali ? ` ${pendingQuali} pending...` : "✅"}
        </small>
        <ul>
          {eachJDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const temp = tempEjb[i];

            const jstChanged =
              temp?.j_status !== j.j_status ||
              temp?.deadline_dl_ !== j?.deadline_dl_ ||
              temp?.deadline_dlty !== j?.deadline_dlty;

            const null_date =
              temp?.j_status === 1 &&
              (!temp?.deadline_dl_ || !temp?.deadline_dlty);

            // const lastEditText = j.last_jst_edit_by
            //   ? `( last edit at ${j.last_jst_edit_at_t} by ${
            //       allUsernames[j.last_jst_edit_by]
            //     } ) `
            //   : "";

            return (
              <li
                key={i}
                style={{
                  backgroundColor: !temp?.j_status ? "mistyrose" : undefined,
                }}
              >
                {`# ${displayID}_${j.cus_id_each || j.id_each}`}
                <small>
                  <label>Waiting :</label>
                  <input
                    name="j_status"
                    type="checkbox"
                    checked={!temp?.j_status}
                    value={0}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  {/* <label style={{ color: "red" }}>Disqualified :</label>
                  <input
                    name="j_status"
                    type="checkbox"
                    checked={temp?.j_status === 2}
                    value={2}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  /> */}
                  <label style={{ color: "green" }}>Qualified : </label>
                  <input
                    name="j_status"
                    type="checkbox"
                    checked={temp?.j_status === 1}
                    value={1}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  {temp?.j_status === 1 && (
                    <>
                      {" "}
                      <label>Deadline Type : </label>
                      <select
                        name="deadline_dlty"
                        value={temp?.deadline_dlty || 0}
                        onChange={(e) => NumChanged(e, j.id_each)}
                      >
                        <option value={0}></option>
                        <option value={1}>Exact</option>
                        <option value={2}>Approximate</option>
                      </select>
                      {temp?.deadline_dlty ? (
                        <>
                          <label>Delivery Deadline : </label>
                          <input
                            type="date"
                            name="deadline_dl_"
                            value={temp?.deadline_dl_ || ""}
                            onChange={(e) => StrChanged(e, j.id_each)}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </small>
                <small>
                  {userJobsL2 && jstChanged && !null_date && (
                    <button name="j_status" onClick={(e) => onSubmit(e, temp)}>
                      Save
                    </button>
                  )}
                </small>
              </li>
            );
          })}
        </ul>
      </li>
      <li>
        {`Performance Bond : `}
        <small style={{ color: "firebrick" }}>
          {pendingPB ? ` ${pendingPB} pending...` : "✅"}
        </small>

        <ul>
          {eachJXDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const temp = tempEjx[i];
            const pbChanged =
              temp?.pb !== j.pb || temp?.pb_amount !== j.pb_amount;
            const qualified_ = eachJDB[i]?.j_status;

            // const lastEditText = j.last_pb_edit_by
            //   ? `( last edit at ${j.last_pb_edit_at_t} by ${
            //       allUsernames[j.last_pb_edit_by]
            //     } ) `
            //   : "";

            const showAmount = temp?.pb !== 1;

            return (
              <li
                key={j.id_each}
                style={{
                  backgroundColor:
                    !temp?.pb && qualified_ ? "mistyrose" : undefined,
                }}
              >
                {`# ${displayID}_${eachJDB[i]?.cus_id_each || j.id_each} : `}
                {qualified_ ? (
                  <small>
                    <label>Not Needed :</label>
                    <input
                      name="pb"
                      type="checkbox"
                      checked={temp?.pb === 1}
                      value={1}
                      onChange={(e) => NumChanged(e, j.id_each)}
                    />
                    <label>Waiting :</label>
                    <input
                      name="pb"
                      type="checkbox"
                      checked={!temp?.pb}
                      value={0}
                      onChange={(e) => NumChanged(e, j.id_each)}
                    />
                    <label>Approved : </label>
                    <input
                      name="pb"
                      type="checkbox"
                      checked={temp?.pb === 2}
                      value={2}
                      onChange={(e) => NumChanged(e, j.id_each)}
                    />
                    <label>Amount : </label>
                    {showAmount ? (
                      <Num
                        name="pb_amount"
                        min={0}
                        setTo={temp?.pb_amount || 0}
                        changed={(e) => NumChanged(e, j.id_each)}
                        width={100}
                        deci={2}
                      />
                    ) : (
                      <input
                        style={{ width: "100px", marginRight: "0" }}
                        readOnly
                        value="✅"
                      />
                    )}{" "}
                    {j?.pb === 2 &&
                      (temp?.pb !== 2 || temp?.pb_amount !== j?.pb_amount) && (
                        <small style={{ color: "red" }}>
                          cannot change once approved
                        </small>
                      )}
                    <small>
                      {/*once approved cannot change*/}
                      {(userAuditL2 || userJobsL2) &&
                        pbChanged &&
                        j?.pb !== 2 && (
                          <button name="pb" onClick={(e) => onSubmit(e, temp)}>
                            Save
                          </button>
                        )}
                    </small>
                  </small>
                ) : (
                  <small style={{ color: "firebrick" }}>not Qualified</small>
                )}
              </li>
            );
          })}
        </ul>
      </li>
      <li>
        {`PO : `}
        <small style={{ color: "firebrick" }}>
          {pendingPO ? ` ${pendingPO} pending...` : "✅"}
        </small>

        <ul>
          {eachJXDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const temp = tempEjx[i];
            const poChanged =
              temp?.po !== j?.po || temp?.po_date_ !== j?.po_date_;
            const qualified_ = eachJDB[i]?.j_status;

            const null_date = temp?.po === 2 && !temp?.po_date_;

            // const lastEditText = j.last_po_edit_by
            //   ? `( last edit at ${j.last_po_edit_at_t} by ${
            //       allUsernames[j.last_po_edit_by]
            //     } ) `
            //   : "";

            return (
              <li
                key={j.id_each}
                style={{
                  backgroundColor:
                    !temp?.po && qualified_ ? "mistyrose" : undefined,
                }}
              >
                {`# ${displayID}_${eachJDB[i]?.cus_id_each || j.id_each} : `}
                {qualified_ ? (
                  <small>
                    <label>Not Providing :</label>
                    <input
                      name="po"
                      type="checkbox"
                      checked={temp?.po === 1}
                      value={1}
                      onChange={(e) => NumChanged(e, j.id_each)}
                    />
                    <label>Waiting :</label>
                    <input
                      name="po"
                      type="checkbox"
                      checked={!temp?.po}
                      value={0}
                      onChange={(e) => NumChanged(e, j.id_each)}
                    />
                    <label>Recieved : </label>
                    <input
                      name="po"
                      type="checkbox"
                      checked={temp?.po === 2}
                      value={2}
                      onChange={(e) => NumChanged(e, j.id_each)}
                    />
                    <label>Date : </label>
                    <input
                      type="date"
                      name="po_date_"
                      value={temp?.po_date_ || ""}
                      onChange={(e) => StrChanged(e, j.id_each)}
                    />

                    <small>
                      {/*once approved cannot change*/}
                      {(userAuditL2 || userJobsL2) &&
                        poChanged &&
                        !null_date && (
                          <button name="po" onClick={(e) => onSubmit(e, temp)}>
                            Save
                          </button>
                        )}
                    </small>
                  </small>
                ) : (
                  <small style={{ color: "firebrick" }}>not Qualified</small>
                )}
              </li>
            );
          })}
        </ul>
      </li>
      <li>
        Approval :
        <ul>
          <li>
            Artwork :
            <small style={{ color: "firebrick" }}>
              {pendingAW ? ` ${pendingAW} pending...` : "✅"}
            </small>
            <ul>
              {eachJDB.map((j, i) => {
                const temp = tempEjb[i];
                const awChanged = temp?.aw !== j?.aw;
                const qualified_ = eachJDB[i]?.j_status;

                return (
                  <li
                    key={j.id_each}
                    style={{
                      backgroundColor:
                        (temp?.aw === 1 || !temp?.aw) && qualified_
                          ? "mistyrose"
                          : undefined,
                    }}
                  >
                    {`# ${displayID}_${
                      eachJDB[i]?.cus_id_each || j.id_each
                    } : `}
                    {qualified_ ? (
                      <small>
                        <label>Processing : </label>
                        <input
                          name="aw"
                          type="checkbox"
                          checked={!temp?.aw}
                          value={0}
                          onChange={(e) => NumChanged(e, j.id_each)}
                        />
                        <label>Ready : </label>
                        <input
                          name="aw"
                          type="checkbox"
                          checked={temp?.aw === 1}
                          value={1}
                          onChange={(e) => NumChanged(e, j.id_each)}
                        />
                        <label>Approved / Received : </label>
                        <input
                          name="aw"
                          type="checkbox"
                          checked={temp?.aw === 2}
                          value={2}
                          onChange={(e) => NumChanged(e, j.id_each)}
                        />

                        <span>
                          {userJobsL2 && awChanged && (
                            <button
                              name="aw"
                              onClick={(e) => onSubmit(e, temp)}
                            >
                              Save
                            </button>
                          )}
                        </span>
                      </small>
                    ) : (
                      <small style={{ color: "firebrick" }}>
                        not Qualified
                      </small>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
          <li>
            Proof :
            <small style={{ color: "firebrick" }}>
              {pendingSamp_pr ? ` ${pendingSamp_pr} pending...` : "✅"}
            </small>
            <ul>
              {eachJDB.map((j, i) => {
                const temp = tempEjb[i];
                const sampprChanged = temp?.samp_pr !== j?.samp_pr;
                const qualified_ = eachJDB[i]?.j_status;

                return (
                  <li
                    key={j.id_each}
                    style={{
                      backgroundColor:
                        (temp?.samp_pr === 1 || !temp?.samp_pr) && qualified_
                          ? "mistyrose"
                          : undefined,
                    }}
                  >
                    {`# ${displayID}_${
                      eachJDB[i]?.cus_id_each || j.id_each
                    } : `}
                    {qualified_ ? (
                      <small>
                        <label>Not Needed : </label>
                        <input
                          name="samp_pr"
                          type="checkbox"
                          checked={temp?.samp_pr === 3}
                          value={3}
                          onChange={(e) => NumChanged(e, j.id_each)}
                        />
                        <label>Processing : </label>
                        <input
                          name="samp_pr"
                          type="checkbox"
                          checked={!temp?.samp_pr}
                          value={0}
                          onChange={(e) => NumChanged(e, j.id_each)}
                        />
                        <label>Submitted : </label>
                        <input
                          name="samp_pr"
                          type="checkbox"
                          checked={temp?.samp_pr === 1}
                          value={1}
                          onChange={(e) => NumChanged(e, j.id_each)}
                        />
                        <label>Approved : </label>
                        <input
                          name="samp_pr"
                          type="checkbox"
                          checked={temp?.samp_pr === 2}
                          value={2}
                          onChange={(e) => NumChanged(e, j.id_each)}
                        />
                        <span>
                          {userJobsL2 && sampprChanged && (
                            <button
                              name="samp_pr"
                              onClick={(e) => onSubmit(e, temp)}
                            >
                              Save
                            </button>
                          )}
                        </span>
                      </small>
                    ) : (
                      <small style={{ color: "firebrick" }}>
                        not Qualified
                      </small>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </li>

      <li>Proccesing</li>
      <li>Job Completed</li>
      <li>Delivered</li>
      <li>Payment Recieved</li>
    </ul>
  );
}
