import { JOBS_API_URL } from "../../api/urls";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { SumsOfQuot, toLKR } from "../../helpers/cal";

import axios from "axios";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DocUpload from "../../helpers/DocUpload";
import MyFormBox from "../../helpers/MyFormBox";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/Edit";
import deepEqual from "fast-deep-equal";
import Num from "../../helpers/Num";

import {
  onNUM,
  onSTR,
  onNUM_N,
  onNUM_NN,
  onSTR_N,
  onSTR_NN,
  onSTRCode,
  handleApiError,
} from "../../helpers/HandleChange";
import {
  FormControlLabel,
  IconButton,
  InputLabel,
  ListItem,
  ListItemIcon,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
} from "@mui/material";

export default function JobJob({ user }) {
  const { fileid, jobindex } = useParams();

  const [DBLoading, setDBLoading] = useState(true);

  const [jobSaved, setJobSaved] = useState([]);
  const [jobTemp, setJobTemp] = useState([]);
  const [theseJobs, setTheseJobs] = useState([]);
  const [sampleTemp, setSampleTemp] = useState([]);
  const [deliTemp, setDeliTemp] = useState([]);
  //const [bidResTemp, setBidResTemp] = useState([]);

  const [elementz, setElementz] = useState([]);
  const [extras, setExtras] = useState([]);

  const [tabV, setTabV] = useState(0);
  const [estiOk, setEstiOk] = useState(false);

  const onSTR_ = onSTR(setJobTemp);
  const onSTRCode_ = onSTRCode(setJobTemp);
  const onNUM_ = onNUM(setJobTemp);
  const onNUMSample = onNUM_N(setSampleTemp, "data");
  const onNUMPO = onNUM_N(setJobTemp, "po");
  const onSTRPO = onSTR_N(setJobTemp, "po");
  const onNUMPerfBond = onNUM_N(setJobTemp, "perfbond");

  const onNUMProof = onNUM_N(setJobTemp, "proof");
  const onSTRProof = onSTR_N(setJobTemp, "proof");

  const onNUMAW = onNUM_N(setJobTemp, "artwork");
  const onSTRAW = onSTR_N(setJobTemp, "artwork");

  const onNUMPay = onNUM_N(setJobTemp, "job_payment");

  const onSTRInfo = onSTR_N(setJobTemp, "job_info");

  useEffect(() => {
    setDBLoading(true);
    axios
      .get(`${JOBS_API_URL}/job/${fileid}/${jobindex}`)
      .then((res) => {
        const job = res.data.thisJob || {};

        setJobSaved(job);
        setJobTemp(job);
        setTabV(job?.bid_submit?.method ? (job?.job_status || 0) + 1 : 0);

        setSampleTemp(job.sample || {});
        setDeliTemp(job.delivery || {});

        setEstiOk(job?.job_info?.esti_ok);
        setTheseJobs(res.data.theseJobs || {});

        const keysSamp = Object.keys(job?.sample?.items ?? {}).map(Number);
        const sampItemTot_ = keysSamp.length ? Math.max(...keysSamp) + 1 : 0;

        const keysDeli = Object.keys(job?.delivery?.log ?? {}).map(Number);
        const deliLogTot_ = keysDeli.length ? Math.max(...keysDeli) + 1 : 0;

        const keysBidres = Object.keys(job?.bid_result?.log ?? {}).map(Number);
        const bidresTot_ = keysBidres.length ? Math.max(...keysBidres) + 1 : 0;

        setElementz({
          samp: sampItemTot_,
          sampInitial: sampItemTot_,
          deli: deliLogTot_,
          deliInitial: deliLogTot_,
          bidres: bidresTot_,
          bidresInitial: bidresTot_,
        });
      })
      .catch(handleApiError)
      .finally(() => {
        setDBLoading(false);
      });
  }, [fileid, jobindex]);

  useEffect(() => {
    console.log("temp", jobTemp);
  }, [jobTemp]);

  // useEffect(() => {
  //   console.log("sampleItems", sampleTemp);
  // }, [sampleTemp]);
  useEffect(() => {
    console.log("deli", deliTemp);
  }, [deliTemp]);
  useEffect(() => {
    console.log("elemnt = ", elementz);
  }, [elementz]);

  const isSavedJob = jobSaved?.job_index;
  const isSavedFile = jobSaved?.file_id;
  const isSubmittedBid = [1, 2, 3, 4].includes(
    Number(jobSaved?.bid_submit?.method),
  );

  const same = (a, b, e) => (a || e) === (b || e);

  const inf = jobTemp?.job_info;

  const form1Same =
    same(jobSaved?.job_name, jobTemp.job_name, "") &&
    same(jobSaved?.job_code, jobTemp.job_code, "");

  const form1Acess = isSavedJob ? user?.level_jobs >= 1 : user?.level_jobs;

  const passedForm1 = !form1Same && user?.loggedIn && form1Acess;

  function SubmitForm1(form) {
    setDBLoading(true);
    const fullForm = { ...form, ...{ fileid }, ...{ jobindex } };

    axios
      .post(`${JOBS_API_URL}/job/form1`, fullForm)
      .then((res) => setJobSaved(res.data.thisJob || {}))
      .catch(handleApiError)
      .finally(() => setDBLoading(false));
  }
  /////////////////////////////////////////////

  const tab = tabV ?? 0; // treat null/undefined as 0

  const isForm2Same = () => {
    switch (tabV) {
      case 0: {
        const savedItems = jobSaved?.sample?.items ?? [];
        const tempItems = sampleTemp?.items ?? [];

        return (
          deepEqual(savedItems, tempItems) &&
          same(jobSaved?.sample?.data?.status, sampleTemp?.data?.status, 0)
        );
      }
      case 1: {
        const savedLog = jobSaved?.bid_result?.log ?? [];
        const tempLog = jobTemp?.bid_result?.log ?? [];
        return (
          same(jobTemp?.po?.status, jobSaved?.po?.status, "") &&
          same(jobTemp?.po?.when, jobSaved?.po?.when, 0) &&
          same(jobTemp?.po?.code, jobSaved?.po?.code, 0) &&
          same(deliTemp?.deadline_type, jobSaved?.delivery?.deadline_type, 0) &&
          same(deliTemp?.deadline, jobSaved?.delivery?.deadline, "") &&
          same(jobTemp?.job_status, jobSaved?.job_status, 0) &&
          deepEqual(savedLog, tempLog)
        );
      }
      case 2: {
        const savedOther = jobSaved?.job_info?.other ?? [];
        const tempOther = jobTemp?.job_info?.other ?? [];
        const savedFin = jobSaved?.job_info?.finishing ?? [];
        const tempFin = jobTemp?.job_info?.finishing ?? [];
        const savedMach = jobSaved?.job_info?.machine ?? [];
        const tempMach = jobTemp?.job_info?.machine ?? [];
        return (
          same(jobTemp?.perfbond?.status, jobSaved?.perfbond?.status, 0) &&
          same(jobTemp?.proof?.status, jobSaved?.proof?.status, 0) &&
          same(jobTemp?.proof?.ok_when, jobSaved?.proof?.ok_when, "") &&
          same(jobTemp?.artwork?.ok_when, jobSaved?.artwork?.ok_when, "") &&
          same(jobTemp?.job_info?.start_at, jobSaved?.job_info?.start_at, "") &&
          same(jobTemp?.artwork?.status, jobSaved?.artwork?.status, 0) &&
          same(jobTemp?.job_status, jobSaved?.job_status, 0) &&
          deepEqual(savedOther, tempOther) &&
          deepEqual(savedMach, tempMach) &&
          deepEqual(savedFin, tempFin)
        );
      }
      case 3:
        return (
          same(jobTemp?.job_status, jobSaved?.job_status, 0) &&
          same(jobTemp?.job_info?.finish_at, jobSaved?.job_info?.finish_at, "")
        );
      case 4: {
        const savedLog = jobSaved?.delivery?.log ?? [];
        const tempLog = deliTemp?.log ?? [];

        return (
          deepEqual(savedLog, tempLog) &&
          same(jobTemp?.job_status, jobSaved?.job_status, 0)
        );
      }
      case 5:
        return same(jobTemp?.job_payment?.full, jobSaved?.job_payment?.full, 0);

      default:
        return true;
    }
  };

  const isForm2Filled = () => {
    switch (tab) {
      case 0: {
        const items = sampleTemp?.items ?? [];
        if (!elementz?.samp) return true;
        const last = items[elementz?.samp - 1];
        return Boolean(last?.type && last?.d1);
      }

      case 1: {
        return true;
      }

      case 2: {
        const needDate =
          jobTemp?.job_status >= 2 ? !!jobTemp?.job_info?.start_at : true;
        return needDate;
      }
      case 3: {
        const needDate =
          jobTemp?.job_status >= 2 ? !!jobTemp?.job_info?.finish_at : true;
        return needDate;
      }
      case 4: {
        const logs = deliTemp?.log ?? [];
        if (!elementz?.deli) return true; // keep your current behavior
        const last = logs[elementz?.deli - 1];
        return Boolean(last?.deli_meth && last?.deli_qty && last?.deli_date);
      }

      case 5:
        return true;
      // ...
      // case 7:
      //   return ...;

      default:
        return false;
    }
  };

  const form2Same = isForm2Same();
  const form2Filled = isForm2Filled();

  const passedForm2 =
    !form2Same &&
    form2Filled &&
    Boolean(isSavedJob && user?.loggedIn && user?.level_jobs >= 1);

  function SubmitForm2() {
    setDBLoading(true);

    const tab = Number(tabV) || 0;
    const base = { fileid, jobindex, tabV: tab };
    const fullForm = {
      ...jobTemp,
      sample: sampleTemp,
      delivery: deliTemp,
      ...base,
    };

    axios
      .post(`${JOBS_API_URL}/job/form2`, fullForm)
      .then((res) => {
        const job = res.data.thisJob;
        setSampleTemp(job?.sample || {});
        setDeliTemp(job?.delivery || {});
        setJobSaved(job || {});
        setJobTemp(job || {});
      })
      .catch(handleApiError)
      .finally(() => setDBLoading(false));
  }

  function EstiDeploy() {
    setDBLoading(true);

    const form_ = { fileid, jobindex, job_info: jobSaved?.job_info };

    axios
      .post(`${JOBS_API_URL}/job/estiDeploy`, form_)
      .then((res) => res.data.success && setEstiOk(true))
      .catch(handleApiError)
      .finally(() => setDBLoading(false));
  }

  const CustomerName =
    jobSaved?.customer_id === 1
      ? jobSaved?.unreg_customer || "Unregistered"
      : jobSaved?.cus_name_short || jobSaved?.customer_name || "";

  const sample_types = {
    pp: "Paper/Board",
    pr: "Print",
    sp: "Spiral",
    rm: "Rim",
    lm: "Lamination",
    fl: "Foil",
  };
  const deli_methods = {
    1: "Delivered",
    2: "Collected",
  };

  const jobfileTag = (i) => String(i || 0).padStart(5, "0");
  const jobsByIndex = useMemo(
    () =>
      (theseJobs || []).reduce((acc, job) => {
        acc[job.job_index] = job;
        return acc;
      }, {}),
    [theseJobs],
  );

  const makeItLoad = DBLoading || !isSavedFile;
  return (
    <Box>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box id="example jobs">
        <List component="div" disablePadding>
          <Divider />
          <ListItemButton
            component={Link}
            to={`/jobs/file/${jobSaved?.file_id}`}
          >
            <ListItemAvatar>
              <FolderOutlinedIcon />
            </ListItemAvatar>

            <ListItemText
              primary={
                <>
                  {"#" + jobfileTag(jobSaved?.file_id)}
                  <b>{` - ${CustomerName}`}</b>
                </>
              }
              secondary={
                <Box
                  sx={{ display: "flex", flexWrap: "wrap" }}
                  component="span"
                >
                  {jobSaved?.doc_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      {jobSaved?.doc_name}
                    </Typography>
                  )}

                  {jobSaved?.file_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      ({jobSaved?.file_name})
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
          <Divider />
          {Array.from({ length: jobSaved?.jobs_count || 1 }).map((_, i) => {
            const ii = i + 1;
            const eql = ii === Number(jobindex);
            const job_ = eql ? jobTemp : jobsByIndex[i + 1];
            return (
              <React.Fragment key={i}>
                <ListItemButton
                  component={Link}
                  to={fileid && `/jobs/job/${fileid}/${ii}`}
                  sx={{ ml: 4 }}
                  selected={ii === Number(jobindex)}
                  onClick={() => !eql && setJobTemp([])}
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
                          (job_?.job_code || ii)}
                        <b>{CustomerName && ` - ${CustomerName}`}</b>
                      </>
                    }
                    secondary={
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap" }}
                        component="span"
                      >
                        {jobSaved?.doc_name && (
                          <Typography component="span" sx={{ mx: 0.25 }}>
                            {jobSaved.doc_name}
                          </Typography>
                        )}

                        {jobSaved?.file_name && (
                          <Typography component="span" sx={{ mx: 0.25 }}>
                            ({jobSaved.file_name})
                          </Typography>
                        )}
                        {job_?.job_name && (
                          <Typography component="span" sx={{ mx: 0.25 }}>
                            - {job_.job_name}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
                <Divider sx={{ ml: 4 }} />
              </React.Fragment>
            );
          })}
        </List>
      </Box>
      <MyFormBox
        label={"Job ID"}
        clickable={passedForm1 || !isSavedJob}
        onPress={() => SubmitForm1(jobTemp)}
        buttonType={isSavedJob ? "Save" : "Create"}
        user={user}
      >
        <TextField
          label="Job Code"
          variant="outlined"
          size="small"
          name="job_code"
          value={jobTemp?.job_code || ""}
          onChange={onSTRCode_}
        />
        <TextField
          label="Job Name"
          variant="outlined"
          size="small"
          name="job_name"
          value={jobTemp?.job_name || ""}
          onChange={onSTR_}
        />
      </MyFormBox>
      {isSavedJob && (
        <>
          {/* ////////////////
            DOCS DOCUMENTS
            ///////////////// */}
          <DocUpload
            located_id={"jobfile" + fileid}
            label="File Documents"
            prefix={jobfileTag(fileid)}
            folder_name="jobs/file"
            can_upload={false}
            can_view={user?.loggedIn}
            user={user}
            noBttn
          />
          <DocUpload
            located_id={`job${fileid}_${jobindex}`}
            label="Job Documents"
            prefix={`${jobfileTag(fileid)}_${jobindex}`}
            folder_name="jobs/job"
            can_upload={user?.loggedIn}
            can_view={user?.loggedIn}
            user={user}
          />

          <MyFormBox
            label={"Job Status"}
            clickable={passedForm2}
            onPress={() => SubmitForm2()}
            user={user}
          >
            <Box
              sx={{
                borderColor: "divider",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Tabs
                value={tabV}
                onChange={(_, v) => {
                  setTabV(v);
                  setSampleTemp(jobSaved?.sample || {});
                  setDeliTemp(jobSaved?.delivery || {});
                  setJobTemp(jobSaved || {});

                  setElementz((p) => ({
                    ...p,
                    samp: p.sampInitial,
                    deli: p.deliInitial,
                    bidres: p.bidresInitial,
                  }));
                }}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab
                  value={0}
                  label={
                    jobSaved?.bid_submit?.method > 0
                      ? "Submitted"
                      : "Submitting"
                  }
                  icon={
                    jobSaved?.bid_submit?.method > 0 ? (
                      <CheckCircleOutlineRoundedIcon
                        color="success"
                        fontSize="small"
                      />
                    ) : null
                  }
                  iconPosition="end"
                />

                <Tab
                  label={jobSaved?.job_status ? "Qualified" : "Waiting"}
                  icon={
                    jobSaved?.job_status >= 1 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={1}
                />
                <Tab
                  label={
                    jobSaved?.job_status >= 2 ? "Job Started" : "Job Preparing"
                  }
                  icon={
                    jobSaved?.job_status >= 2 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={2}
                />
                <Tab
                  label={
                    jobSaved?.job_status >= 3
                      ? "Ready to Deliver"
                      : "Not Finished"
                  }
                  icon={
                    jobSaved?.job_status >= 3 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={3}
                />
                <Tab
                  label={
                    jobSaved?.job_status >= 4 ? "Delivered" : "Delivery Pending"
                  }
                  icon={
                    jobSaved?.job_status >= 4 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={4}
                />

                <Tab
                  label={
                    !!jobSaved?.job_payment?.full
                      ? "Fully Paid"
                      : "Payment Pending"
                  }
                  icon={
                    !!jobSaved?.job_payment?.full && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={5}
                />
              </Tabs>
            </Box>
            {tabV === 0 && (
              <>
                <Box sx={{ width: "100%", overflow: "hidden" }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ pb: 3, width: "100%" }}>
                    Estimation
                    <IconButton
                      component={Link}
                      to={`/esti/${jobSaved?.job_id}/jobs_pre`}
                      color="primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <AddLinkRoundedIcon />
                    </IconButton>
                  </Typography>
                </Box>
                {estiOk ? (
                  <TableContainer component={Paper} sx={{ width: 600 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Units</TableCell>
                          <TableCell align="right">NET</TableCell>
                          <TableCell align="right">VAT</TableCell>
                          <TableCell align="right">NET+VAT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            {inf?.unit_count.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(inf?.unit_count * inf?.unit_price)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(inf?.unit_count * inf?.unit_price * 0.18)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(inf?.unit_count * inf?.unit_price * 1.18)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell align="right">
                            {toLKR(inf?.unit_price)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(inf?.unit_price * 0.18)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(inf?.unit_price * 1.18)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      disabled={!(user?.level_jobs >= 3)}
                      onClick={EstiDeploy}
                      color="primary"
                    >
                      <AddCircleOutlineRoundedIcon />
                    </IconButton>
                    <Typography color="error">Pending ...</Typography>
                  </Stack>
                )}
                <Box sx={{ width: "100%", overflow: "hidden" }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ pb: 3 }}>
                    Samples / Materials
                    <IconButton
                      onClick={() =>
                        setElementz((p) => ({
                          ...p,
                          samp: p.samp + 1,
                        }))
                      }
                      disabled={elementz?.samp && !form2Filled}
                      color="primary"
                    >
                      <AddCircleOutlineRoundedIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        const count = elementz?.samp ?? 0;
                        setSampleTemp((p) => ({
                          ...p,
                          items: Object.fromEntries(
                            Object.entries(p?.items ?? {}).filter(
                              ([k]) => k !== String(count - 1),
                            ),
                          ),
                          data: {
                            ...(p?.data ?? {}),
                            status: count <= 1 ? 0 : (p.data?.status ?? 0),
                          },
                        }));

                        setElementz((p) => ({
                          ...p,
                          samp: Math.max((p.samp ?? 0) - 1, 0),
                        }));
                      }}
                      disabled={(elementz?.samp ?? 0) < 1}
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Typography>
                  <List dense>
                    {Array.from({ length: elementz?.samp }).map((_, idx) => {
                      const s = sampleTemp?.items?.[idx] || {};

                      return (
                        <React.Fragment key={idx}>
                          <ListItemButton selected={idx === elementz?.samp - 1}>
                            <ListItemText
                              primary={`${idx + 1} - ${
                                sample_types[s?.type] || "-"
                              }`}
                              secondary={
                                ["d1", "d2", "d3", "d4", "d5", "d6"]
                                  .map((k) => s?.[k])
                                  .filter(Boolean)
                                  .join(" • ") || "-"
                              }
                            />
                          </ListItemButton>
                          <Divider />
                        </React.Fragment>
                      );
                    })}
                  </List>
                  {!!elementz?.samp && (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          name="type"
                          value={
                            sampleTemp?.items?.[elementz?.samp - 1]?.type || ""
                          }
                          onChange={onSTR_NN(
                            setSampleTemp,
                            "items",
                            elementz?.samp - 1,
                          )}
                          MenuProps={{
                            PaperProps: { style: { maxHeight: 300 } },
                          }}
                        >
                          <MenuItem value="">-</MenuItem>

                          {Object.entries(sample_types).map(
                            ([value, label]) => (
                              <MenuItem key={value} value={value}>
                                {label}
                              </MenuItem>
                            ),
                          )}
                        </Select>
                      </FormControl>

                      {["d1", "d2", "d3", "d4", "d5", "d6"].map((name) => (
                        <TextField
                          key={name}
                          size="small"
                          sx={{ width: 100 }}
                          name={name}
                          value={
                            sampleTemp?.items?.[elementz?.samp - 1]?.[name] ||
                            ""
                          }
                          onChange={onSTR_NN(
                            setSampleTemp,
                            "items",
                            elementz?.samp - 1,
                          )}
                        />
                      ))}
                    </Stack>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ pb: 3 }}>Sample Status</Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    <FormControlLabel
                      control={<Checkbox />}
                      label="not Ready"
                      name="status"
                      checked={!sampleTemp?.data?.status}
                      value={0}
                      onChange={onNUMSample}
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Ready"
                      disabled={!elementz?.samp}
                      name="status"
                      checked={sampleTemp?.data?.status === 1}
                      value={1}
                      onChange={onNUMSample}
                    />
                    <FormControlLabel
                      control={<Checkbox color="success" />}
                      label="Approved"
                      disabled={!elementz?.samp}
                      name="status"
                      checked={sampleTemp?.data?.status === 2}
                      value={2}
                      onChange={onNUMSample}
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Not Needed"
                      name="status"
                      checked={sampleTemp?.data?.status === 3}
                      value={3}
                      onChange={onNUMSample}
                    />
                  </Stack>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              </>
            )}
            {tabV === 1 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>Bid Results</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <TextField
                    sx={{ width: 150 }}
                    size="small"
                    label="Name"
                    name="bidres_n"
                    value={extras?.bidres_n || ""}
                    onChange={onSTR(setExtras)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Num
                    label="Price"
                    name="bidres_v"
                    value={extras?.bidres_v || 0}
                    onChange={onNUM(setExtras)}
                    deci={2}
                  />
                  <IconButton
                    color="primary"
                    disabled={!extras?.bidres_n || !extras?.bidres_v}
                    onClick={() => {
                      const neww = {
                        n: extras?.bidres_n?.trim(),
                        v: extras?.bidres_v || 0,
                      };

                      setJobTemp((p) => ({
                        ...p,
                        bid_result: {
                          ...(p.bid_result || {}),
                          log: [...(p.bid_result?.log || []), neww],
                        },
                      }));

                      setExtras((p) => ({
                        ...p,
                        bidres_n: "",
                        bidres_v: 0,
                      }));
                    }}
                  >
                    <AddCircleOutlineRoundedIcon />
                  </IconButton>
                </Stack>

                <List dense sx={{ my: 1, maxWidth: 600 }}>
                  {(jobTemp?.bid_result?.log || []).map((r, i) => (
                    <ListItem
                      key={i}
                      sx={{ "&:hover": { bgcolor: "#f2f8ff" } }}
                    >
                      <ListItemText
                        primary={`${i + 1}. ${r?.n} - ${toLKR(r?.v)}`}
                      />
                      <IconButton
                        onClick={() => {
                          setJobTemp((p) => ({
                            ...p,
                            bid_result: {
                              ...(p.bid_result || {}),
                              log: (p.bid_result?.log || []).filter(
                                (_, idx) => idx !== i,
                              ),
                            },
                          }));
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>Customer Decision</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Waiting"
                    name="job_status"
                    checked={!jobTemp?.job_status}
                    disabled={jobSaved?.job_status}
                    value={0}
                    onChange={onNUM_}
                  />
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Qualified"
                    name="job_status"
                    checked={!!jobTemp?.job_status}
                    disabled={jobSaved?.job_status >= 2 || !isSubmittedBid}
                    value={1}
                    onChange={onNUM_}
                  />
                </Stack>
                {!!jobTemp?.job_status && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography sx={{ pb: 3 }}>Purchase Order</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Waiting"
                        name="status"
                        checked={!jobTemp?.po?.status}
                        disabled={jobSaved?.po?.status === 2}
                        value={0}
                        onChange={onNUMPO}
                      />
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Optional"
                        name="status"
                        checked={jobTemp?.po?.status === 1}
                        disabled={jobSaved?.po?.status === 2}
                        value={1}
                        onChange={onNUMPO}
                      />
                      <FormControlLabel
                        control={<Checkbox color="success" />}
                        label="Received"
                        name="status"
                        checked={jobTemp?.po?.status === 2}
                        value={2}
                        onChange={onNUMPO}
                      />
                      {jobTemp?.po?.status === 2 && (
                        <>
                          <TextField
                            type="date"
                            sx={{ width: 150 }}
                            size="small"
                            label="PO Date"
                            name="when"
                            value={jobTemp?.po?.when || ""}
                            onChange={onSTRPO}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            size="small"
                            label="PO ID"
                            name="code"
                            value={jobTemp?.po?.code || ""}
                            onChange={onSTRPO}
                            InputLabelProps={{ shrink: true }}
                          />
                        </>
                      )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />
                    <Typography sx={{ pb: 3 }}>Delivery Shedule</Typography>

                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Date Type</InputLabel>
                        <Select
                          name="deadline_type"
                          value={deliTemp?.deadline_type || 0}
                          MenuProps={{
                            PaperProps: { style: { maxHeight: 300 } },
                          }}
                          label="Date Type"
                          onChange={onNUM(setDeliTemp)}
                        >
                          <MenuItem value={0}>Pending</MenuItem>
                          <MenuItem value={1}>Fixed</MenuItem>
                          <MenuItem value={2}>Flexible</MenuItem>
                        </Select>
                      </FormControl>
                      {deliTemp?.deadline_type === 1 && (
                        <TextField
                          type="date"
                          sx={{ width: 150 }}
                          size="small"
                          label="Date"
                          name="deadline"
                          value={deliTemp?.deadline || ""}
                          onChange={onSTR(setDeliTemp)}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    </Stack>
                  </>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}
            {tabV === 2 && isSubmittedBid && !!jobSaved?.job_status && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  label="Performance Bond"
                  labelPlacement="start"
                  sx={{ ml: 0, my: 1 }}
                  control={
                    <Switch
                      checked={!!jobTemp?.perfbond?.status}
                      disabled={Number(jobSaved?.perfbond?.status || 0) >= 2}
                      value={jobTemp?.perfbond?.status ? 0 : 1}
                      name="status"
                      onChange={onNUMPerfBond}
                      color="success"
                    />
                  }
                />
                {!!jobTemp?.perfbond?.status && (
                  <IconButton
                    color="primary"
                    sx={{ ml: 2 }}
                    disabled={!jobSaved?.perfbond?.status}
                  >
                    <AddLinkRoundedIcon />
                  </IconButton>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>Proof</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Not Need"
                    name="status"
                    checked={jobTemp?.proof?.status === 2}
                    disabled={jobSaved?.proof?.status >= 3}
                    value={2}
                    onChange={onNUMProof}
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Processing"
                    name="status"
                    checked={!jobTemp?.proof?.status}
                    disabled={jobSaved?.proof?.status >= 1}
                    value={0}
                    onChange={onNUMProof}
                  />

                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Approved"
                    name="status"
                    checked={jobTemp?.proof?.status === 1}
                    disabled={jobSaved?.proof?.status >= 2}
                    value={1}
                    onChange={onNUMProof}
                  />
                  {jobTemp?.proof?.status === 1 && (
                    <TextField
                      type="date"
                      sx={{ width: 150 }}
                      size="small"
                      label="Approved Date"
                      name="ok_when"
                      value={jobTemp?.proof?.ok_when || ""}
                      onChange={onSTRProof}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>Art Work</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="No Print"
                    name="status"
                    checked={jobTemp?.artwork?.status === 2}
                    disabled={jobSaved?.artwork?.status >= 3}
                    value={2}
                    onChange={onNUMAW}
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Processing"
                    name="status"
                    checked={!jobTemp?.artwork?.status}
                    disabled={jobSaved?.artwork?.status >= 1}
                    value={0}
                    onChange={onNUMAW}
                  />
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Approved / Ready"
                    name="status"
                    checked={jobTemp?.artwork?.status === 1}
                    disabled={jobSaved?.artwork?.status >= 2}
                    value={1}
                    onChange={onNUMAW}
                  />
                  {jobTemp?.artwork?.status === 1 && (
                    <TextField
                      type="date"
                      sx={{ width: 150 }}
                      size="small"
                      label="Approved Date"
                      name="ok_when"
                      value={jobTemp?.artwork?.ok_when || ""}
                      onChange={onSTRAW}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>Machine Work</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="machtype"
                      value={extras?.machtype || ""}
                      onChange={onSTR(setExtras)}
                      MenuProps={{
                        PaperProps: { style: { maxHeight: 200 } },
                      }}
                      label="Type"
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="OffsetPrint">Print Offset</MenuItem>
                      <MenuItem value="DigitalPrint">Print Digital</MenuItem>
                      <MenuItem value="Numbering">Numbering</MenuItem>
                      <MenuItem value="Perforation">Perforation</MenuItem>
                      <MenuItem value="Creasing">Creasing</MenuItem>
                      <MenuItem value="DiyCut">DiyCut</MenuItem>
                      <MenuItem value="PerfectBind">PerfectBind</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    sx={{ width: 300 }}
                    size="small"
                    label="Details"
                    name="machdata"
                    value={extras?.machdata || ""}
                    onChange={onSTR(setExtras)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <IconButton
                    color="primary"
                    disabled={!extras?.machtype}
                    onClick={() => {
                      const neww = {
                        ty: extras?.machtype?.trim(),
                        dt: extras?.machdata?.trim(),
                      };

                      setJobTemp((p) => ({
                        ...p,
                        job_info: {
                          ...(p.job_info || {}),
                          machine: [...(p.job_info?.machine || []), neww],
                        },
                      }));

                      setExtras((p) => ({
                        ...p,
                        machtype: "",
                        machdata: "",
                      }));
                    }}
                  >
                    <AddCircleOutlineRoundedIcon />
                  </IconButton>
                </Stack>

                <List dense sx={{ my: 1, maxWidth: 500 }}>
                  {jobTemp?.job_info?.machine?.map((m, i) => (
                    <ListItem
                      key={i}
                      sx={{ "&:hover": { bgcolor: "#f2f8ff" }, p: 0 }}
                    >
                      <ListItemText primary={`${i + 1}. ${m?.ty} - ${m?.dt}`} />
                      <IconButton
                        onClick={() => {
                          setJobTemp((p) => ({
                            ...p,
                            job_info: {
                              ...(p.job_info || {}),
                              machine: (p.job_info?.machine || []).filter(
                                (_, idx) => idx !== i,
                              ),
                            },
                          }));
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>Finishing</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="fintype"
                      value={extras?.fintype || ""}
                      onChange={onSTR(setExtras)}
                      MenuProps={{
                        PaperProps: { style: { maxHeight: 200 } },
                      }}
                      label="Type"
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Binding">Binding</MenuItem>
                      <MenuItem value="Padding">Padding</MenuItem>
                      <MenuItem value="Numbering">Numbering</MenuItem>
                      <MenuItem value="Gathering">Gathering</MenuItem>
                      <MenuItem value="Pasting">Pasting</MenuItem>
                      <MenuItem value="Folding">Folding</MenuItem>
                      <MenuItem value="Packing">Packing</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    sx={{ width: 300 }}
                    size="small"
                    label="Details"
                    name="findata"
                    value={extras?.findata || ""}
                    onChange={onSTR(setExtras)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <IconButton
                    color="primary"
                    disabled={!extras?.findata || !extras?.fintype}
                    onClick={() => {
                      const neww = {
                        ty: extras?.fintype?.trim(),
                        dt: extras?.findata?.trim(),
                      };

                      setJobTemp((p) => ({
                        ...p,
                        job_info: {
                          ...(p.job_info || {}),
                          finishing: [...(p.job_info?.finishing || []), neww],
                        },
                      }));

                      setExtras((p) => ({
                        ...p,
                        findata: "",
                        fintype: "",
                      }));
                    }}
                  >
                    <AddCircleOutlineRoundedIcon />
                  </IconButton>
                </Stack>

                <List dense sx={{ my: 1, maxWidth: 500 }}>
                  {jobTemp?.job_info?.finishing?.map((m, i) => (
                    <ListItem
                      key={i}
                      sx={{ "&:hover": { bgcolor: "#f2f8ff" }, p: 0 }}
                    >
                      <ListItemText primary={`${i + 1}. ${m?.ty} - ${m?.dt}`} />
                      <IconButton
                        onClick={() => {
                          setJobTemp((p) => ({
                            ...p,
                            job_info: {
                              ...(p.job_info || {}),
                              finishing: (p.job_info?.finishing || []).filter(
                                (_, idx) => idx !== i,
                              ),
                            },
                          }));
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>Others</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <TextField
                    sx={{ width: 150 }}
                    size="small"
                    label="Type"
                    name="otherstype"
                    value={extras?.otherstype || ""}
                    onChange={onSTR(setExtras)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    sx={{ width: 300 }}
                    size="small"
                    label="Details"
                    name="othersdata"
                    value={extras?.othersdata || ""}
                    onChange={onSTR(setExtras)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <IconButton
                    color="primary"
                    disabled={!extras?.otherstype || !extras?.othersdata}
                    onClick={() => {
                      const neww = {
                        ty: extras?.otherstype?.trim(),
                        dt: extras?.othersdata?.trim(),
                      };

                      setJobTemp((p) => ({
                        ...p,
                        job_info: {
                          ...(p.job_info || {}),
                          others: [...(p.job_info?.others || []), neww],
                        },
                      }));

                      setExtras((p) => ({
                        ...p,
                        othersdata: "",
                        otherstype: "",
                      }));
                    }}
                  >
                    <AddCircleOutlineRoundedIcon />
                  </IconButton>
                </Stack>

                <List dense sx={{ my: 1, maxWidth: 500 }}>
                  {jobTemp?.job_info?.others?.map((m, i) => (
                    <ListItem
                      key={i}
                      sx={{ "&:hover": { bgcolor: "#f2f8ff" }, p: 0 }}
                    >
                      <ListItemText primary={`${i + 1}. ${m?.ty} - ${m?.dt}`} />
                      <IconButton
                        onClick={() => {
                          setJobTemp((p) => ({
                            ...p,
                            job_info: {
                              ...(p.job_info || {}),
                              others: (p.job_info?.others || []).filter(
                                (_, idx) => idx !== i,
                              ),
                            },
                          }));
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography>Job Ticket</Typography>
                  <IconButton
                    color="primary"
                    component={Link}
                    to={`/records/nim/jticket/${jobSaved?.job_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <AddLinkRoundedIcon />
                  </IconButton>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ py: 2 }}>
                  <FormControlLabel
                    label="JOB Started"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobTemp?.job_status >= 2}
                        disabled={
                          (jobSaved?.job_status || 0) !== 1 ||
                          !jobTemp?.artwork?.status ||
                          !jobTemp?.proof?.status
                        }
                        value={jobTemp?.job_status === 2 ? 1 : 2}
                        name="job_status"
                        onChange={onNUM_}
                        color="success"
                      />
                    }
                  />
                  {jobTemp?.job_status >= 2 && (
                    <TextField
                      type="date"
                      sx={{ width: 150 }}
                      size="small"
                      label="Started Date"
                      name="start_at"
                      value={jobTemp?.job_info?.start_at || ""}
                      onChange={onSTRInfo}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>

                <Divider sx={{ mt: 1 }} />
              </Box>
            )}
            {tabV === 3 && isSubmittedBid && jobSaved?.job_status >= 2 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ py: 2 }}>
                  <FormControlLabel
                    label="JOB Finished"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobTemp?.job_status >= 3}
                        disabled={(jobSaved?.job_status || 0) !== 2}
                        value={jobTemp?.job_status === 3 ? 2 : 3}
                        name="job_status"
                        onChange={onNUM_}
                        color="success"
                      />
                    }
                  />
                  {jobTemp?.job_status >= 3 && (
                    <TextField
                      type="date"
                      sx={{ width: 150 }}
                      size="small"
                      label="Finished Date"
                      name="finish_at"
                      value={jobTemp?.job_info?.finish_at || ""}
                      onChange={onSTRInfo}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>

                <Divider sx={{ mt: 2 }} />
              </Box>
            )}
            {tabV === 4 && isSubmittedBid && jobSaved?.job_status >= 2 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ py: 1 }}>
                  <FormControlLabel
                    label="Fully Delivered"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobTemp?.job_status >= 4}
                        disabled={
                          (jobSaved?.job_status || 0) !== 3 || !elementz?.deli
                        }
                        value={jobTemp?.job_status === 4 ? 3 : 4}
                        name="job_status"
                        onChange={onNUM_}
                        color="success"
                      />
                    }
                  />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ pb: 3 }}>
                  Delivery Log
                  <IconButton
                    onClick={() =>
                      setElementz((p) => ({
                        ...p,
                        deli: p.deli + 1,
                      }))
                    }
                    disabled={elementz?.deli && !form2Filled}
                    color="primary"
                  >
                    <AddCircleOutlineRoundedIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      const count = elementz?.deli ?? 0;
                      setDeliTemp((p) => ({
                        ...p,
                        log: Object.fromEntries(
                          Object.entries(p?.log ?? {}).filter(
                            ([k]) => k !== String(count - 1),
                          ),
                        ),
                      }));

                      setElementz((p) => ({
                        ...p,
                        deli: Math.max((p?.deli ?? 0) - 1, 0),
                      }));
                      jobTemp?.job_status === 4 &&
                        count <= 1 &&
                        setJobTemp((p) => ({ ...p, job_status: 3 }));
                    }}
                    disabled={(elementz?.deli ?? 0) < 1}
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                </Typography>
                <List dense>
                  {Array.from({ length: elementz?.deli }).map((_, idx) => {
                    const s = deliTemp?.log?.[idx] || {};

                    return (
                      <React.Fragment key={idx}>
                        <ListItemButton selected={idx === elementz?.deli - 1}>
                          <ListItemText
                            primary={`${idx + 1} - ${
                              deli_methods[s?.deli_meth] || "-"
                            }`}
                            secondary={
                              [
                                s?.deli_qty != null
                                  ? `${Number(
                                      s.deli_qty,
                                    ).toLocaleString()} Units ( ${(
                                      (s.deli_qty / inf?.unit_count) *
                                      100
                                    ).toFixed(2)} % )`
                                  : null,
                                s?.deli_date,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "-"
                            }
                          />
                        </ListItemButton>
                        <Divider />
                      </React.Fragment>
                    );
                  })}
                </List>
                {!!elementz?.deli && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        name="deli_meth"
                        value={
                          deliTemp?.log?.[elementz?.deli - 1]?.deli_meth || 0
                        }
                        onChange={onNUM_NN(
                          setDeliTemp,
                          "log",
                          elementz?.deli - 1,
                        )}
                        MenuProps={{
                          PaperProps: { style: { maxHeight: 300 } },
                        }}
                      >
                        <MenuItem value={0}>-</MenuItem>

                        {Object.entries(deli_methods).map(([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      type="date"
                      sx={{ width: 150 }}
                      name="deli_date"
                      size="small"
                      value={
                        deliTemp?.log?.[elementz?.deli - 1]?.deli_date || ""
                      }
                      onChange={onSTR_NN(
                        setDeliTemp,
                        "log",
                        elementz?.deli - 1,
                      )}
                    />
                    <Num
                      sx={{ width: 100 }}
                      name="deli_qty"
                      value={deliTemp?.log?.[elementz?.deli - 1]?.deli_qty}
                      onChange={onNUM_NN(
                        setDeliTemp,
                        "log",
                        elementz?.deli - 1,
                      )}
                      label="Units"
                    />
                  </Stack>
                )}

                <Divider sx={{ mt: 2 }} />
              </Box>
            )}
            {tabV === 5 && isSubmittedBid && jobSaved?.job_status >= 2 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ py: 1 }}>
                  <FormControlLabel
                    label="Fully Paid"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobTemp?.job_payment?.full === 1}
                        disabled={
                          (jobSaved?.job_status || 0) <= 3 ||
                          !!jobSaved?.job_payment?.full
                        }
                        value={jobTemp?.job_payment?.full === 1 ? 0 : 1}
                        name="full"
                        onChange={onNUMPay}
                        color="success"
                      />
                    }
                  />
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}
          </MyFormBox>
        </>
      )}
    </Box>
  );
}
