import {
  Autocomplete,
  Backdrop,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { RECORDS_API_URL } from "../../api/urls";

export default function RecJobTicket({ user }) {
  const [DBLoading, SetDBLoading] = useState(true);

  const [allJobs, setAllJobs] = useState([]);
  const makeItLoad = DBLoading;

  useEffect(() => {
    SetDBLoading(true);

    axios
      .get(`${RECORDS_API_URL}/nim/jticket`)
      .then((res) => {
        setAllJobs(res.data.allJobs || []);
        res.data.success && SetDBLoading(false);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  useEffect(() => {
    console.log("allJobs", allJobs);
  }, [allJobs]);
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

      <Autocomplete
        disablePortal
        options={allJobs}
        sx={{ width: 300 }}
        getOptionLabel={(j) =>
          `#${jobfileTag(j?.file_id)}_${j?.job_code || j?.job_index} - ${CustomerName(j)}`
        }
        renderInput={(params) => <TextField {...params} label="Job" />}
      />
    </Box>
  );
}
