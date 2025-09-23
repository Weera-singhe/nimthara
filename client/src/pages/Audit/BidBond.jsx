import React, { useEffect, useState } from "react";
import Num from "../../elements/NumInput";
import axios from "axios";
import { BB_Audit_API_URL } from "../../api/urls";
import { toLKR } from "../../elements/cal";
import { Link } from "react-router-dom";

export default function BidBond({ user }) {
  const [bbDB, setBBDB] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios
      .get(BB_Audit_API_URL)
      .then((res) => {
        setBBDB(res.data.bb);
        setBanks(res.data.banks);
      })
      .catch((err) => console.error("Error fetching papers:", err))
      .finally(() => setLoading(false));
  }, []);

  function RefChanged(e, i) {
    const { name, checked } = e.target;
    setBBDB((p) =>
      p.map((slot) =>
        slot.idx === i
          ? { ...slot, [name]: checked ? 3 : 2, samp_pp: "x" }
          : slot
      )
    );
  }
  function StrChanged(e, i) {
    const { name, value } = e.target;
    const safeVal =
      name === "bb_bank" ? value.trimStart().toUpperCase() : value.trimStart();
    setBBDB((p) =>
      p.map((slot) =>
        slot.idx === i ? { ...slot, [name]: safeVal, samp_pp: "x" } : slot
      )
    );
  }
  function NumChanged(e, i) {
    const { name, value } = e.target;
    setBBDB((p) =>
      p.map((slot) =>
        slot.idx === i ? { ...slot, [name]: Number(value), samp_pp: "x" } : slot
      )
    );
  }
  function SubmitStage2(exprt) {
    setLoading(true);
    const updatedExprt = { ...exprt, user_id: user.id };

    console.log("export : ", updatedExprt);
    axios
      .post(BB_Audit_API_URL, updatedExprt)
      .then((res) =>
        setBBDB((p) =>
          p.map((slot) => (slot.idx === res.data.idx ? res.data : slot))
        )
      )
      .catch((err) => alert("Error: " + err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    console.log(bbDB);
  }, [bbDB]);

  //displayID

  const displayID = (created, idMain) =>
    created && idMain
      ? `${created}_${idMain.toString().padStart(4, "0")}`
      : "loading...";

  const userAuditL2 = user.level_audit > 1 && user.loggedIn;
  return (
    <>
      <div className="framed jb">
        <h4>Proccessing</h4>
        {loading ? (
          "loading"
        ) : (
          <ul>
            {bbDB
              .filter((b) => !b.bb)
              .map((b) => (
                <li key={b.id}>
                  <Link to={`/jobs/${encodeURIComponent(b.id)}`}>
                    {displayID(b.created_at_x, b.id)}
                  </Link>
                  <small>
                    <b> {b.customer_name}</b>
                  </small>
                  <small>
                    {" "}
                    {`${b?.reference || b?.contact_p || ""}${
                      b?.unq_name ? ` ( ${b.unq_name} )` : ""
                    }`}
                  </small>
                  <small
                    style={{ color: "firebrick" }}
                  >{`deadline : ${b.deadline_t}`}</small>
                </li>
              ))}
          </ul>
        )}
      </div>
      <div className="framed jb">
        <h4>Approved and Not Refunded</h4>
        {loading ? (
          "loading"
        ) : (
          <ul>
            {bbDB
              .filter((b) => b.bb === 2)
              .map((b) => {
                const empty = !b.bb_code || !b.bb_op_at_ || !b.bb_bank;
                const empty3 = b.bbtemp === 3 && (!b.bb_ref_at_ || !b.bb_ref);
                ///////

                return (
                  <li key={b.idx}>
                    <Link to={`/jobs/${encodeURIComponent(b.id)}`}>
                      {displayID(b.created_at_x, b.id)}
                    </Link>
                    <small>
                      <b> {b.customer_name}</b>
                    </small>
                    <small>
                      {" "}
                      {`${b?.reference || b?.contact_p || ""}${
                        b?.unq_name ? ` ( ${b.unq_name} )` : ""
                      }`}
                    </small>
                    <small>{toLKR(b.bb_amount)}</small>
                    {!empty && !empty3 && b.samp_pp === "x" && userAuditL2 && (
                      <button
                        onClick={() => SubmitStage2(b)}
                        style={{ marginLeft: "2%" }}
                      >
                        save
                      </button>
                    )}
                    <ul
                      style={{
                        backgroundColor: (empty || empty3) && "mistyrose",
                      }}
                    >
                      <li>
                        <small style={{ marginLeft: 0 }}>
                          <label>Code : </label>
                          <input
                            type="text"
                            name="bb_code"
                            value={b?.bb_code || ""}
                            onChange={(e) => StrChanged(e, b.idx)}
                          />

                          <label>Approved on: </label>
                          <input
                            type="date"
                            name="bb_op_at_"
                            value={b?.bb_op_at_ || ""}
                            onChange={(e) => StrChanged(e, b.idx)}
                          />

                          <label>Bank : </label>
                          <select
                            name="bb_bank"
                            value={b?.bb_bank || 0}
                            onChange={(e) => NumChanged(e, b.idx)}
                          >
                            <option value={0}></option>
                            {banks.map((bk) => (
                              <option key={bk.id} value={bk.id}>
                                {bk.customer_name}
                              </option>
                            ))}
                          </select>

                          <label>Refunded : </label>
                          <input
                            name="bbtemp"
                            type="checkbox"
                            checked={b?.bbtemp === 3 || false}
                            onChange={(e) => RefChanged(e, b.idx)}
                          />
                          {b?.bbtemp === 3 && (
                            <>
                              <br />
                              <br />
                              <label>Refunded on : </label>
                              <input
                                type="date"
                                name="bb_ref_at_"
                                value={b?.bb_ref_at_ || ""}
                                onChange={(e) => StrChanged(e, b.idx)}
                              />

                              <label>Amount : </label>
                              <Num
                                min={0}
                                max={b.bb_amount}
                                name="bb_ref"
                                setTo={b?.bb_ref}
                                deci={2}
                                changed={(e) => NumChanged(e, b.idx)}
                              />
                            </>
                          )}
                        </small>
                      </li>
                    </ul>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <div className="framed jb">
        <h4>Refunded</h4>
        {loading ? (
          "loading"
        ) : (
          <ul>
            {bbDB
              .filter((b) => b.bb === 3)
              .map((b) => {
                const empty = !b.bb_code || !b.bb_op_at_ || !b.bb_bank;
                const empty3 = b.bbtemp === 3 && (!b.bb_ref_at_ || !b.bb_ref);
                ///////

                return (
                  <li key={b.idx}>
                    <Link to={`/jobs/${encodeURIComponent(b.id)}`}>
                      {displayID(b.created_at_x, b.id)}
                    </Link>
                    <small>
                      <b> {b.customer_name}</b>
                    </small>
                    <small>
                      {`${b?.reference || b?.contact_p || ""}${
                        b?.unq_name ? ` ( ${b.unq_name} )` : ""
                      }`}
                    </small>
                    <small>{toLKR(b.bb_amount)}</small>

                    <ul
                      style={{
                        backgroundColor: (empty || empty3) && "mistyrose",
                      }}
                    >
                      <li>
                        <small style={{ marginLeft: 0 }}>
                          <label>Code : </label>
                          <input
                            type="text"
                            name="bb_code"
                            value={b?.bb_code || ""}
                            onChange={(e) => StrChanged(e, b.idx)}
                          />

                          <label>Approved on: </label>
                          <input
                            type="date"
                            name="bb_op_at_"
                            value={b?.bb_op_at_ || ""}
                            onChange={(e) => StrChanged(e, b.idx)}
                          />

                          <label>Bank : </label>
                          <select
                            name="bb_bank"
                            value={b?.bb_bank || 0}
                            onChange={(e) => NumChanged(e, b.idx)}
                          >
                            <option value={0}></option>
                            {banks.map((bk) => (
                              <option key={bk.id} value={bk.id}>
                                {bk.customer_name}
                              </option>
                            ))}
                          </select>

                          <label>Refunded : </label>
                          <input
                            name="bbtemp"
                            type="checkbox"
                            checked={b?.bb === 3 || false}
                            onChange={(e) => RefChanged(e, b.idx)}
                          />
                          {b?.bb === 3 && (
                            <>
                              <label>Refunded on : </label>
                              <input
                                type="date"
                                name="bb_ref_at_"
                                value={b?.bb_ref_at_ || ""}
                                onChange={(e) => StrChanged(e, b.idx)}
                              />

                              <label>Amount : </label>
                              <Num
                                min={0}
                                max={b.bb_amount}
                                name="bb_ref"
                                setTo={b?.bb_ref}
                                deci={2}
                                changed={(e) => NumChanged(e, b.idx)}
                              />
                            </>
                          )}
                        </small>
                      </li>
                    </ul>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </>
  );
}
