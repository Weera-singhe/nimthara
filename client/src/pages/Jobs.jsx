import { JOBS_API_URL } from "../api/urls";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Jobbs() {
  const [allJobs, loadAllJobs] = useState([]);
  const [allCustomers, loadAllCustomers] = useState([]);

  useEffect(() => {
    axios.get(JOBS_API_URL).then((res) => {
      loadAllJobs(res.data.jobs);
      loadAllCustomers(res.data.cus);
    });
  }, []);

  return (
    <div>
      <h2>All Jobs</h2>
      <Link to="/jobs/add">Add New Job</Link>
      <ul>
        {allJobs.map((j) => {
          const cus = allCustomers.find((c) => c.id === j.customer);

          return (
            <li key={j.id}>
              <Link to={`/jobs/${j.id}`}>
                {`${j.created_at}_ ${String(j.id).padStart(4, "0")}`}{" "}
                {cus?.customer_name || ""}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
