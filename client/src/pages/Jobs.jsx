import { JOBS_API_URL } from "../api/urls";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Jobbs() {
  const [allJobs, loadAllJobs] = useState([]);
  const [allJobsQu, loadAllJobsQu] = useState([]);
  const [allJobsLoading, isAllJobsLoading] = useState(true);

  const [showQ, setShowQ] = useState(false);
  const [showNotQ, setShowNotQ] = useState(false);

  useEffect(() => {
    axios
      .get(JOBS_API_URL)
      .then((res) => {
        loadAllJobs(res.data.jobs);
        loadAllJobsQu(res.data.qualified);
        console.log(res.data);
      })
      .catch((err) => alert("Error: " + err))
      .finally(() => {
        isAllJobsLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>All Jobs</h2>
      <Link to="/jobs/add">Add New Job</Link>
      <br />
      {allJobsLoading ? (
        <>
          <br />
          Loading...
        </>
      ) : (
        <>
          <div className="framed">
            <Link onClick={() => setShowQ((p) => !p)}>
              {showQ ? "Hide Qualified  Jobs" : "Show Qualified  Jobs"}
            </Link>
            {showQ && (
              <ul className="jb">
                <li>
                  <b>Not Started</b>
                </li>
                <ul className="jblist">
                  {allJobsQu
                    .filter((j) => j.j_status === 1)
                    .sort(
                      (b, a) =>
                        new Date(a.deadline_dl) - new Date(b.deadline_dl)
                    )
                    .map((j) => (
                      <li key={j.id_je}>
                        <Link to={`/jobs/${j.id_main}`}>
                          {`${j.j_created_at_x}_${String(j.id).padStart(
                            4,
                            "0"
                          )}_${j.cus_id_each || j.id_each}`}
                        </Link>
                        <b>{`- ${
                          j.cus_name_short || j.customer_name || ""
                        } : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                        <b>
                          {!j.po && (
                            <small style={{ color: "red" }}>
                              {"PurchaseOrder"}
                            </small>
                          )}
                          <small style={{ color: "tomato" }}>
                            deliver @ {j?.deadline_dl_ || "no deadline"}
                          </small>
                          {!j.pb && (
                            <small style={{ color: "darkred" }}>
                              {"PerformanceBond"}
                            </small>
                          )}{" "}
                          {!(j.aw > 1) && (
                            <small style={{ color: "chocolate" }}>
                              {"Artwork"}
                            </small>
                          )}{" "}
                          {!(j.samp_pr > 1) && (
                            <small style={{ color: "indianred" }}>
                              {"Proof"}
                            </small>
                          )}
                        </b>
                      </li>
                    ))}
                </ul>
                <br />
                <li>
                  <b>Proccesing</b>
                </li>
                <ul className="jblist">
                  {allJobsQu
                    .filter((j) => j.j_status === 2)
                    .sort(
                      (b, a) =>
                        new Date(a.deadline_dl) - new Date(b.deadline_dl)
                    )
                    .map((j) => (
                      <li key={j.id_je}>
                        <Link to={`/jobs/${j.id_main}`}>
                          {`${j.j_created_at_x}_${String(j.id).padStart(
                            4,
                            "0"
                          )}_${j.cus_id_each || j.id_each}`}
                        </Link>
                        <b>{`- ${
                          j.cus_name_short || j.customer_name || ""
                        } : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                        <b>
                          {!j.po && (
                            <small style={{ color: "red" }}>
                              {"PurchaseOrder"}
                            </small>
                          )}
                          <small style={{ color: "tomato" }}>
                            deliver @ {j?.deadline_dl_ || "no deadline"}
                          </small>
                          {!j.pb && (
                            <small style={{ color: "darkred" }}>
                              {"PerformanceBond"}
                            </small>
                          )}{" "}
                          {!(j.aw > 1) && (
                            <small style={{ color: "chocolate" }}>
                              {"Artwork"}
                            </small>
                          )}{" "}
                          {!(j.samp_pr > 1) && (
                            <small style={{ color: "indianred" }}>
                              {"Proof"}
                            </small>
                          )}
                        </b>
                      </li>
                    ))}
                </ul>
                <br />
                <li>
                  <b>Waiting For Payment</b>
                </li>
                <ul className="jblist">
                  {allJobsQu
                    .filter((j) => j.j_status === 3 && !j.full_paym)
                    .sort(
                      (b, a) =>
                        new Date(a.deadline_dl) - new Date(b.deadline_dl)
                    )
                    .map((j) => (
                      <li key={j.id_je}>
                        <Link to={`/jobs/${j.id_main}`}>
                          {`${j.j_created_at_x}_${String(j.id).padStart(
                            4,
                            "0"
                          )}_${j.cus_id_each || j.id_each}`}
                        </Link>
                        <b>{`- ${
                          j.cus_name_short || j.customer_name || ""
                        } : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                      </li>
                    ))}
                </ul>
                <br />
                <li>
                  <b style={{ color: "green" }}>Payment Recieved</b>
                </li>
                <ul className="jblist">
                  {allJobsQu
                    .filter((j) => j.j_status === 3 && j.full_paym)
                    .sort(
                      (b, a) =>
                        new Date(a.deadline_dl) - new Date(b.deadline_dl)
                    )
                    .map((j) => (
                      <li key={j.id_je}>
                        <Link to={`/jobs/${j.id_main}`}>
                          {`${j.j_created_at_x}_${String(j.id).padStart(
                            4,
                            "0"
                          )}_${j.cus_id_each || j.id_each}`}
                        </Link>
                        <b>{`- ${
                          j.cus_name_short || j.customer_name || ""
                        } : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                      </li>
                    ))}
                </ul>
                <br />
              </ul>
            )}
          </div>
          <div className="framed">
            <Link onClick={() => setShowNotQ((p) => !p)}>
              {showNotQ ? "Hide Unconfirmed Jobs" : "Show Unconfirmed Jobs"}
            </Link>
            {showNotQ && (
              <ul className="jb">
                <li>
                  <b>Estimation Pending</b>
                </li>
                <ul className="jblist">
                  {allJobs
                    .filter((j) => j.total_jobs > j.dep_count)
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                    .map((j) => (
                      <li key={j.id}>
                        <Link to={`/jobs/${j.id}`}>
                          {`${j.created_at_x}_${String(j.id).padStart(4, "0")}`}
                        </Link>
                        <b>{`- ${j.customer_name || ""} : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                        <b>
                          {j.bb_done_count < j.total_jobs && (
                            <small style={{ color: "red" }}>{"bid bond"}</small>
                          )}{" "}
                          {j.spp_ready_count < j.total_jobs && (
                            <small style={{ color: "darksalmon" }}>
                              {"paper samples"}
                            </small>
                          )}
                          <small style={{ color: "firebrick" }}>
                            {` deadline : ${j?.deadline_t}`}
                          </small>
                        </b>
                      </li>
                    ))}
                </ul>
                <br />
                <li>
                  <b>Submit Pending</b>
                </li>
                <ul className="jblist">
                  {allJobs
                    .filter(
                      (j) => j.total_jobs <= j.dep_count && !j.submit_method
                    )
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                    .map((j) => (
                      <li key={j.id}>
                        <Link to={`/jobs/${j.id}`}>
                          {`${j.created_at_x}_${String(j.id).padStart(4, "0")}`}
                        </Link>
                        <b>{`- ${j.customer_name || ""} : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                        <b>
                          {j.bb_done_count < j.total_jobs && (
                            <small style={{ color: "red" }}>{"bid bond"}</small>
                          )}{" "}
                          {j.spp_ready_count < j.total_jobs && (
                            <small style={{ color: "darksalmon" }}>
                              {"paper samples"}
                            </small>
                          )}
                          <small style={{ color: "firebrick" }}>
                            {` deadline : ${j?.deadline_t}`}
                          </small>
                        </b>
                      </li>
                    ))}
                </ul>
                <br />
                <li>
                  <b>Results Pending</b>
                </li>
                <ul className="jblist">
                  {allJobs
                    .filter(
                      (j) =>
                        j.total_jobs <= j.dep_count &&
                        j.submit_method &&
                        j.submit_method !== 5 &&
                        j.total_jobs > j.res_count
                    )
                    .sort((b, a) => new Date(a.deadline) - new Date(b.deadline))
                    .map((j) => (
                      <li key={j.id}>
                        <Link to={`/jobs/${j.id}`}>
                          {`${j.created_at_x}_${String(j.id).padStart(4, "0")}`}
                        </Link>
                        <b>{`- ${j.customer_name || ""} : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                        <b>
                          {j.bb_done_count < j.total_jobs && (
                            <small style={{ color: "red" }}>{"bid bond"}</small>
                          )}
                          {j.spp_ready_count < j.total_jobs && (
                            <small style={{ color: "darksalmon" }}>
                              {"paper samples"}
                            </small>
                          )}
                        </b>
                      </li>
                    ))}
                </ul>
                <br />
                <li>
                  <b>Customer Desicion Pending </b>
                </li>
                <ul className="jblist">
                  {allJobs
                    .filter(
                      (j) =>
                        j.total_jobs <= j.dep_count &&
                        j.submit_method &&
                        j.submit_method !== 5 &&
                        j.total_jobs <= j.res_count
                    )
                    .sort((b, a) => new Date(a.deadline) - new Date(b.deadline))
                    .map((j) => (
                      <li key={j.id}>
                        <Link to={`/jobs/${j.id}`}>
                          {`${j.created_at_x}_${String(j.id).padStart(4, "0")}`}
                        </Link>
                        <b>{`- ${j.customer_name || ""} : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                        <b>
                          {j.bb_done_count < j.total_jobs && (
                            <small style={{ color: "red" }}>{"bid bond"}</small>
                          )}
                          {j.spp_ready_count < j.total_jobs && (
                            <small style={{ color: "darksalmon" }}>
                              {"paper samples"}
                            </small>
                          )}
                          <small
                            style={{
                              color: "green",
                            }}
                          >
                            {j.inc_respub ? " Results  Published " : ""}
                          </small>
                        </b>
                      </li>
                    ))}
                </ul>
                <br />
                <li>
                  <b>Not Bidding</b>
                </li>
                <ul className="jblist">
                  {allJobs
                    .filter((j) => j.submit_method === 5)
                    .map((j) => (
                      <li key={j.id}>
                        <Link to={`/jobs/${j.id}`}>
                          {`${j.created_at_x}_${String(j.id).padStart(4, "0")}`}
                        </Link>
                        <b>{`- ${j.customer_name || ""} : `}</b>
                        <span>
                          {j?.reference || j?.contact_p || j?.contact_d}
                        </span>
                      </li>
                    ))}
                </ul>
                <br />
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
