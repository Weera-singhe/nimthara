import { JOBS_API_URL } from "../api/urls";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Jobbs() {
  const [allJobs, loadAllJobs] = useState([]);
  const [allJobsLoading, isAllJobsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(JOBS_API_URL)
      .then((res) => {
        loadAllJobs(res.data);
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
      <div></div>
      {allJobsLoading ? (
        <>
          <br />
          Loading...
        </>
      ) : (
        <ul className="jb">
          <li>
            <b>Estimation Pending</b>
          </li>
          <ul>
            {allJobs
              .filter((j) => j.total_jobs > j.dep_count)
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .map((j) => (
                <li key={j.id}>
                  <Link to={`/jobs/${j.id}`}>
                    {`${j.created_at_x}_ ${String(j.id).padStart(4, "0")}`}
                  </Link>
                  <b>{`- ${j.customer_name || ""} : `}</b>
                  <span>{j?.reference || j?.contact_p || j?.contact_d}</span>
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
          <ul>
            {allJobs
              .filter((j) => j.total_jobs <= j.dep_count && !j.submit_method)
              .map((j) => (
                <li key={j.id}>
                  <Link to={`/jobs/${j.id}`}>
                    {`${j.created_at_x}_ ${String(j.id).padStart(4, "0")}`}
                  </Link>
                  <b>{`- ${j.customer_name || ""} : `}</b>
                  <span>{j?.reference || j?.contact_p || j?.contact_d}</span>
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
          <ul>
            {allJobs
              .filter(
                (j) =>
                  j.total_jobs <= j.dep_count &&
                  j.submit_method &&
                  j.total_jobs > j.res_count
              )
              .map((j) => (
                <li key={j.id}>
                  <Link to={`/jobs/${j.id}`}>
                    {`${j.created_at_x}_ ${String(j.id).padStart(4, "0")}`}
                  </Link>
                  <b>{`- ${j.customer_name || ""} : `}</b>
                  <span>{j?.reference || j?.contact_p || j?.contact_d}</span>
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
          <li>
            <b>Results Published</b>
          </li>
          <ul>
            {allJobs
              .filter(
                (j) =>
                  j.total_jobs <= j.dep_count &&
                  j.submit_method &&
                  j.total_jobs <= j.res_count
              )
              .map((j) => (
                <li key={j.id}>
                  <Link to={`/jobs/${j.id}`}>
                    {`${j.created_at_x}_ ${String(j.id).padStart(4, "0")}`}
                  </Link>
                  <b>{`- ${j.customer_name || ""} : `}</b>
                  <span>{j?.reference || j?.contact_p || j?.contact_d}</span>
                  <b>
                    {j.bb_done_count < j.total_jobs && (
                      <small style={{ color: "red" }}>{"bid bond"}</small>
                    )}
                    {j.spp_ready_count < j.total_jobs && (
                      <small style={{ color: "darksalmon" }}>
                        {"paper samples"}
                      </small>
                    )}
                    {j.inc_private && (
                      <small style={{ color: "darkblue" }}>
                        {"include private"}
                      </small>
                    )}
                  </b>
                </li>
              ))}
          </ul>
        </ul>
      )}
    </div>
  );
}
