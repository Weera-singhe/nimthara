import {
  Autocomplete,
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { RECORDS_API_URL } from "../../api/urls";
import MyFormBox from "../../helpers/MyFormBox";
import PrintOut from "../../helpers/PrintOut";
import JobTicket from "../../forms/JobTicket";

export default function RecJobTicket({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [DBLoading, SetDBLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const [qualiJobs, setQualiJobs] = useState([]);
  const makeItLoad = DBLoading;

  useEffect(() => {
    SetDBLoading(true);
    const safeFormID = Number(id || 0);

    axios
      .get(`${RECORDS_API_URL}/nim/jticket/${safeFormID}`)
      .then((res) => {
        const jobs = res.data.qualiJobs || [];
        setQualiJobs(jobs);
        const selectedJ = jobs.find((j) => j.job_id === safeFormID) || null;
        setSelectedJob(selectedJ);
      })
      .catch((err) => console.error("Error fetching papers:", err))
      .finally(() => SetDBLoading(false));
  }, [id]);

  useEffect(() => {
    console.log("idSelectedJob", selectedJob);
  }, [selectedJob]);

  const jobfileTag = (i) => String(i || 0).padStart(5, "0");
  const CustomerName = (j) =>
    j?.customer_id === 1
      ? j?.unreg_customer || "Unregistered"
      : j?.cus_name_short || j?.customer_name;

  return (
    <Box>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyFormBox noBttn label="Job Tickets">
        <Autocomplete
          size="small"
          sx={{ width: 400, maxWidth: "70%", mt: 4 }}
          options={qualiJobs}
          value={selectedJob}
          onChange={(_, j) => {
            const newId = j?.job_id ?? null;
            setSelectedJob(j);
            if (newId) navigate(`/records/nim/jticket/${newId}`);
          }}
          isOptionEqualToValue={(opt, val) => opt.job_id === val.job_id}
          getOptionLabel={(j) =>
            j
              ? `#${jobfileTag(j?.file_id)}_${j?.job_code || j?.job_index} - ${CustomerName(j)}`
              : ""
          }
          renderInput={(params) => (
            <TextField {...params} label="Job" placeholder="Search job..." />
          )}
        />
        <PrintOut paperSize="A3">
          <JobTicket />
        </PrintOut>
      </MyFormBox>
    </Box>
  );
}
