import { ESTI_API_URL } from "../../api/urls";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export default function Esti({ user }) {
  const { linkid } = useParams();
  const [jobsQualified, loadQualified] = useState([]);
  const [dbLoading, setDbloading] = useState(true);

  const [allJobs, setAllJobs] = useState([]);
  const [allJobFiles, setAllJobFiles] = useState([]);

  useEffect(() => {
    axios
      .get(`${ESTI_API_URL}/${linkid}`)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.log("Error: " + err))
      .finally(() => {
        setDbloading(false);
      });
  }, []);
}
