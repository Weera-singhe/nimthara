import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { JOBS_FILE } from "../../api/urls";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import axios from "axios";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Num from "../../elements/Num";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import Switch from "@mui/material/Switch";
import Radio from "@mui/material/Radio";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import MyFormBox from "../../elements/MyFormBox";
import DocUpload from "../../elements/DocUpload";
import {
  onNUM,
  onSTR,
  onNUM_N,
  onSTR_N,
  handleApiError,
} from "../../elements/HandleChange";
import IconButton from "@mui/material/IconButton";

export default function JobFile({ user }) {
  const navigate = useNavigate();
  const { fileid } = useParams();

  const [jobFilesSaved, setJobFilesSaved] = useState({});
  const [jobFilesTemp, setJobFilesTemp] = useState({});

  const [jobsSaved, setJobsSaved] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [DBLoading, setDBLoading] = useState(true);

  useEffect(() => {
    setDBLoading(true);
    axios
      .get(`${JOBS_FILE}/${fileid || "new"}`)
      .then((res) => {
        setCustomers(res.data.customers || []);
        setJobFilesSaved(res.data.thisJobFile || []);
        setJobFilesTemp(res.data.thisJobFile || []);
        setJobsSaved(res.data.theseJobs || []);
        // console.log("db loaded", res.data);
      })
      .catch(handleApiError)
      .finally(() => {
        setDBLoading(false);
      });
    //console.log("file id = ", fileid);
  }, [fileid]);

  const onStr_ = onSTR(setJobFilesTemp);
  const onStr_BS = onSTR_N(setJobFilesTemp, "bid_submit");
  const onNUM_ = onNUM(setJobFilesTemp);
  const onNUM_BB = onNUM_N(setJobFilesTemp, "bidbond");
  const onNUM_BS = onNUM_N(setJobFilesTemp, "bid_submit");

  function SubmitForm1(form) {
    setDBLoading(true);

    const fullForm = { ...form, ...(fileid && { fileid }) };

    axios
      .post(`${JOBS_FILE}/form1`, fullForm)
      .then((res) =>
        !fileid
          ? navigate(`/jobs/file/${res.data.load_this_id}`)
          : setJobFilesSaved(res.data.thisJobFile || [])
      )
      .catch(handleApiError)
      .finally(() => setDBLoading(false));
  }
  function SubmitForm2(form) {
    setDBLoading(true);
    const fullForm = { ...form, ...{ fileid } };

    axios
      .post(`${JOBS_FILE}/form2`, fullForm)
      .then((res) => setJobFilesSaved(res.data.thisJobFile || []))
      .catch(handleApiError)
      .finally(() => setDBLoading(false));
  }

  const jobfileTag = (i) => String(i || 0).padStart(5, "0");

  // useEffect(() => {
  //   console.log("tempx", jobFilesTemp);
  //   console.log("savedx", jobFilesSaved);
  // }, [jobFilesTemp]);
  // useEffect(() => {
  //   console.log("savedx", jobFilesSaved);
  // }, [jobFilesSaved]);

  const unreg_cus_selected = jobFilesTemp?.customer_id === 1;
  const selectedCustomer = customers.find(
    (c) => c.id === jobFilesTemp?.customer_id
  );
  const CustomerName = unreg_cus_selected
    ? jobFilesTemp?.unreg_customer || "Unregistered"
    : selectedCustomer?.cus_name_short || selectedCustomer?.customer_name || "";

  // form 1 eligible

  const form1Filled =
    jobFilesTemp?.customer_id &&
    (jobFilesTemp?.doc_name || jobFilesTemp?.file_name) &&
    jobFilesTemp?.bid_deadline_i;

  const form1Same =
    (jobFilesTemp?.customer_id || 0) === (jobFilesSaved?.customer_id || 0) &&
    (jobFilesTemp?.doc_name || "") === (jobFilesSaved?.doc_name || "") &&
    (jobFilesTemp?.file_name || "") === (jobFilesSaved?.file_name || "") &&
    (jobFilesTemp?.unreg_customer || "") ===
      (jobFilesSaved?.unreg_customer || "") &&
    (jobFilesTemp?.jobs_count || 1) === (jobFilesSaved?.jobs_count || 1) &&
    (jobFilesTemp?.bid_deadline_i || "") ===
      (jobFilesSaved?.bid_deadline_i || "") &&
    (jobFilesTemp?.bidbond?.status || 0) ===
      (jobFilesSaved?.bidbond?.status || 0);

  const canAddForm1 =
    form1Filled && !form1Same && user?.loggedIn && user?.level_jobs;
  const canEditForm1 =
    form1Filled && !form1Same && user?.loggedIn && user?.level_jobs >= 3;
  const passedForm1 = fileid ? canEditForm1 : canAddForm1;

  // form 1 eligible
  const bidSubJson = jobFilesTemp?.bid_submit;
  const bidSubJsonS = jobFilesSaved?.bid_submit;

  const form2Filled =
    bidSubJson?.method &&
    (bidSubJson?.method === 5 ? bidSubJson?.reason : bidSubJson?.when);

  const form2Same =
    (bidSubJson?.to || "") === (bidSubJsonS?.to || "") &&
    (bidSubJson?.by || "") === (bidSubJsonS?.by || "") &&
    (bidSubJson?.method || 0) === (bidSubJsonS?.method || 0) &&
    ((bidSubJson?.when || "") === (bidSubJsonS?.when || "") &&
      (bidSubJson?.reason || "")) === (bidSubJsonS?.reason || "");

  const unsubmitting =
    !!bidSubJsonS?.method && bidSubJson?.method !== bidSubJsonS?.method;

  const passedForm2 =
    !form2Same &&
    form2Filled &&
    user?.loggedIn &&
    user?.level_jobs &&
    !unsubmitting;

  const isSavedFile = jobFilesSaved?.customer_id;
  const wrongPage = fileid && !isSavedFile;
  const makeItLoad = DBLoading || wrongPage;

  return (
    <Box sx={{ mt: 2, mx: 1 }}>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* ////////////////
      example job file
      ///////////////// */}
      <Box>
        <List component="div" disablePadding>
          <Divider />
          <ListItemButton selected>
            <ListItemAvatar>
              <FolderOutlinedIcon />
            </ListItemAvatar>

            <ListItemText
              primary={
                <>
                  {"#" + jobfileTag(fileid)}{" "}
                  <b>{CustomerName && `- ${CustomerName}`}</b>{" "}
                </>
              }
              secondary={
                <Box
                  sx={{ display: "flex", flexWrap: "wrap" }}
                  component="span"
                >
                  {jobFilesTemp?.doc_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      {jobFilesTemp.doc_name}
                    </Typography>
                  )}

                  {jobFilesTemp?.file_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      ({jobFilesTemp.file_name})
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
          <Divider />

          {Array.from({ length: jobFilesTemp?.jobs_count || 1 }).map((_, i) => (
            <React.Fragment key={i}>
              <ListItemButton
                component={Link}
                to={fileid && `/jobs/job/${fileid}/${i + 1}`}
                sx={{ ml: 4 }}
              >
                <ListItemAvatar>
                  <WorkOutlineRoundedIcon />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <>
                      {"#" +
                        jobfileTag(fileid) +
                        "_" +
                        (jobsSaved[i]?.job_code || i + 1)}
                      <b>{CustomerName && ` - ${CustomerName}`}</b>
                    </>
                  }
                  secondary={
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap" }}
                      component="span"
                    >
                      {jobFilesTemp?.doc_name && (
                        <Typography component="span" sx={{ mx: 0.25 }}>
                          {jobFilesTemp.doc_name}
                        </Typography>
                      )}

                      {jobFilesTemp?.file_name && (
                        <Typography component="span" sx={{ mx: 0.25 }}>
                          ({jobFilesTemp.file_name})
                        </Typography>
                      )}
                      {jobsSaved[i]?.job_name && (
                        <Typography component="span" sx={{ mx: 0.25 }}>
                          - {jobsSaved[i].job_name}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
              <Divider sx={{ ml: 4 }} />
            </React.Fragment>
          ))}
        </List>
      </Box>
      {/* ////////////////
      FORM 1 FORM1
      ///////////////// */}
      <MyFormBox
        label="Job File Details"
        clickable={passedForm1}
        onPress={() => SubmitForm1(jobFilesTemp)}
        user={user}
      >
        <FormControl sx={{ minWidth: 150, maxWidth: "90%" }} size="small">
          <InputLabel>Customer</InputLabel>
          <Select
            name="customer_id"
            value={jobFilesTemp?.customer_id || ""}
            label="Customer"
            onChange={onNUM_}
            MenuProps={{
              PaperProps: { style: { maxHeight: 300 } },
            }}
          >
            <MenuItem value="">
              <em>-</em>
            </MenuItem>
            <MenuItem value={1}>Unregistered</MenuItem>

            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.customer_name || c.cus_name_short}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {unreg_cus_selected && (
          <TextField
            label="Customer Name"
            variant="outlined"
            size="small"
            name="unreg_customer"
            value={jobFilesTemp?.unreg_customer || ""}
            onChange={onStr_}
            sx={{ width: 300 }}
          />
        )}
        <TextField
          label="Document Reference"
          variant="outlined"
          size="small"
          name="doc_name"
          value={jobFilesTemp?.doc_name || ""}
          onChange={onStr_}
          sx={{ width: 300 }}
        />
        <TextField
          label="File Name"
          variant="outlined"
          size="small"
          name="file_name"
          value={jobFilesTemp?.file_name || ""}
          onChange={onStr_}
          sx={{ width: 300 }}
        />
        <Num
          width={120}
          label="Job Count"
          max={500}
          min={jobFilesSaved?.jobs_count || 1}
          onChange={onNUM_}
          name="jobs_count"
          value={jobFilesTemp?.jobs_count}
        />
        <TextField
          label="Bid Submission Deadline"
          type="datetime-local"
          size="small"
          onChange={onStr_}
          name="bid_deadline_i"
          value={jobFilesTemp?.bid_deadline_i || ""}
          InputLabelProps={{ shrink: true }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!jobFilesTemp?.bidbond?.status}
              disabled={Number(jobFilesTemp?.bidbond?.status || 0) >= 2}
              value={jobFilesTemp?.bidbond?.status ? 0 : 1}
              name="status"
              onChange={onNUM_BB}
              color="success"
            />
          }
          label="Bid Bond"
        />

        {!!jobFilesTemp?.bidbond?.status && (
          <IconButton
            color="primary"
            disabled={!jobFilesSaved?.bidbond?.status}
          >
            <AddLinkRoundedIcon />
          </IconButton>
        )}
      </MyFormBox>

      {/* ////////////////
      DOCS DOCUMENTS
      ///////////////// */}
      <DocUpload
        located_id={"jobfile" + fileid}
        label="Documents"
        prefix={jobfileTag(fileid)}
        folder_name="jobs/file"
        can_upload={user?.loggedIn}
        can_delete={user?.level > 2 && user?.loggedIn}
        can_view={user?.loggedIn}
        user={user}
      />
      {/* ////////////////
      FORM 2 FORM2
      ///////////////// */}
      {isSavedFile && (
        <MyFormBox
          label="Bid Submission"
          clickable={passedForm2}
          onPress={() => SubmitForm2(jobFilesTemp?.bid_submit)}
          user={user}
        >
          <FormControl sx={{ minWidth: 150, maxWidth: "90%" }} size="small">
            <InputLabel>Submit By</InputLabel>
            <Select
              name="method"
              value={bidSubJson?.method || ""}
              label="Submit By"
              onChange={onNUM_BS}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300 } },
              }}
            >
              <MenuItem value="">-</MenuItem>
              <MenuItem value={1}>email</MenuItem>
              <MenuItem value={2}>deliver</MenuItem>
              <MenuItem value={3}>post</MenuItem>
              <MenuItem value={4}>direct</MenuItem>
              <MenuItem value={5}>not bidding</MenuItem>
            </Select>
          </FormControl>

          {bidSubJson?.method === 5 ? (
            <TextField
              label="Reason"
              variant="outlined"
              size="small"
              name="reason"
              value={bidSubJson?.reason || ""}
              onChange={onStr_BS}
              sx={{ width: 300 }}
            />
          ) : (
            <>
              <TextField
                label="To"
                variant="outlined"
                size="small"
                name="to"
                value={bidSubJson?.to || ""}
                onChange={onStr_BS}
                sx={{ width: 300 }}
              />

              <TextField
                label="By"
                variant="outlined"
                size="small"
                name="by"
                value={bidSubJson?.by || ""}
                onChange={onStr_BS}
                sx={{ width: 300 }}
              />
              <TextField
                label="Date"
                type="date"
                size="small"
                onChange={onStr_BS}
                name="when"
                value={bidSubJson?.when || ""}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </MyFormBox>
      )}
    </Box>
  );
}
