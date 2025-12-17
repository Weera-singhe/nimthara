import { JOBS_JOB } from "../../api/urls";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { SumsOfQuot, toLKR } from "../../elements/cal";

import axios from "axios";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DocUpload from "../../elements/DocUpload";
import MyFormBox from "../../elements/MyFormBox";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import deepEqual from "fast-deep-equal";

import {
  onNUM,
  onSTR,
  onNUM_N,
  onSTR_N,
  onSTR_NN,
  onSTRCode,
  handleApiError,
} from "../../elements/HandleChange";
import {
  Button,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItem,
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

  const [jobsSaved, setJobsSaved] = useState([]);
  const [jobsTemp, setJobsTemp] = useState([]);
  const [sampleTemp, setTempSample] = useState([]);
  const [sampleSaved, setSavedSample] = useState([]);
  const [tabV, setTabV] = useState(0);
  const [sampleItemCount, setSampleItemCount] = useState(0);
  const [quotVals, setQuotVals] = useState();

  const onSTR_ = onSTR(setJobsTemp);
  const onSTRCode_ = onSTRCode(setJobsTemp);
  const onNUM_ = onNUM(setJobsTemp);
  const onNUMSample = onNUM_N(setTempSample, "data");
  const onNUMPO = onNUM_N(setJobsTemp, "po");
  const onSTRPO = onSTR_N(setJobsTemp, "po");
  const onNUMDeli = onNUM_N(setJobsTemp, "delivery");
  const onSTRDeli = onSTR_N(setJobsTemp, "delivery");
  const onNUMPerfBond = onNUM_N(setJobsTemp, "perfbond");

  const onNUMProof = onNUM_N(setJobsTemp, "proof");
  const onSTRProof = onSTR_N(setJobsTemp, "proof");

  const onNUMAW = onNUM_N(setJobsTemp, "artwork");
  const onSTRAW = onSTR_N(setJobsTemp, "artwork");

  const onNUMPay = onNUM_N(setJobsTemp, "job_payment");

  const onSTRInfo = onSTR_N(setJobsTemp, "job_info");

  useEffect(() => {
    setDBLoading(true);
    axios
      .get(`${JOBS_JOB}/${fileid}/${jobindex}`)
      .then((res) => {
        const job = res.data.thisJob || {};

        setJobsSaved(job);
        setJobsTemp(job);
        setTabV(job?.bid_submit?.method ? (job?.job_status || 0) + 1 : 0);

        setSavedSample(job.sample || {});
        setTempSample(job.sample || {});

        const keys = Object.keys(job?.sample?.items || {}).map(Number);
        setSampleItemCount(keys.length ? Math.max(...keys) + 1 : 0);

        console.log("db loaded", res.data);
        setQuotVals(() => SumsOfQuot(res.data.qtsComps, job));
      })
      .catch((err) => {
        console.error("Error loading job file data:", err);
      })
      .finally(() => {
        setDBLoading(false);
      });
  }, [fileid]);
  useEffect(() => {
    console.log("temp", jobsTemp);
    console.log("saved", jobsSaved);
  }, [jobsTemp]);

  useEffect(() => {
    console.log("quotVals", quotVals);
  }, [quotVals]);
  useEffect(() => {
    console.log("sampleItems", sampleItemCount);
  }, [sampleItemCount]);

  const isSavedJob = jobsSaved?.job_index;
  const isSavedFile = jobsSaved?.file_id;
  const isSubmittedBid = [1, 2, 3, 4].includes(
    Number(jobsSaved?.bid_submit?.method)
  );

  const same = (a, b, e) => (a || e) === (b || e);

  const form1Same =
    same(jobsSaved?.job_name, jobsTemp.job_name, "") &&
    same(jobsSaved?.job_code, jobsTemp.job_code, "");

  const form1Acess = isSavedJob ? user?.level_jobs >= 2 : user?.level_jobs;

  const passedForm1 = !form1Same && user?.loggedIn && form1Acess;

  function SubmitForm1(form) {
    setDBLoading(true);
    const fullForm = { ...form, ...{ fileid }, ...{ jobindex } };

    axios
      .post(`${JOBS_JOB}/form1`, fullForm)
      .then((res) => setJobsSaved(res.data.thisJob || {}))
      .catch((err) => console.error("Error saving job data:", err))
      .finally(() => setDBLoading(false));
  }
  /////////////////////////////////////////////

  const tab = tabV ?? 0; // treat null/undefined as 0

  const isForm2Same = () => {
    switch (tabV) {
      case 0: {
        const savedItems = sampleSaved?.items ?? [];
        const tempItems = sampleTemp?.items ?? [];

        return (
          deepEqual(savedItems, tempItems) &&
          same(sampleSaved?.data?.status, sampleTemp?.data?.status, 0)
        );
      }
      case 1:
        return (
          same(jobsTemp?.po?.status, jobsSaved?.po?.status, "") &&
          same(jobsTemp?.po?.when, jobsSaved?.po?.when, 0) &&
          same(
            jobsTemp?.delivery?.when_type,
            jobsSaved?.delivery?.when_type,
            0
          ) &&
          same(jobsTemp?.delivery?.when, jobsSaved?.delivery?.when, "") &&
          same(jobsTemp?.job_status, jobsSaved?.job_status, 0)
        );
      case 2:
        return (
          same(jobsTemp?.perfbond?.status, jobsSaved?.perfbond?.status, 0) &&
          same(jobsTemp?.proof?.status, jobsSaved?.proof?.status, 0) &&
          same(jobsTemp?.proof?.ok_when, jobsSaved?.proof?.ok_when, "") &&
          same(jobsTemp?.artwork?.ok_when, jobsSaved?.artwork?.ok_when, "") &&
          same(
            jobsTemp?.job_info?.start_at,
            jobsSaved?.job_info?.start_at,
            ""
          ) &&
          same(jobsTemp?.artwork?.status, jobsSaved?.artwork?.status, 0) &&
          same(jobsTemp?.job_status, jobsSaved?.job_status, 0)
        );
      case 3:
        return (
          same(jobsTemp?.job_status, jobsSaved?.job_status, 0) &&
          same(
            jobsTemp?.job_info?.finish_at,
            jobsSaved?.job_info?.finish_at,
            ""
          )
        );
      case 4:
        return same(jobsTemp?.job_status, jobsSaved?.job_status, 0);
      case 5:
        return same(
          jobsTemp?.job_payment?.full,
          jobsSaved?.job_payment?.full,
          0
        );

      default:
        return true;
    }
  };

  const isForm2Filled = () => {
    switch (tab) {
      case 0: {
        const items = sampleTemp?.items ?? [];
        if (!sampleItemCount) return true; // keep your current behavior
        const last = items[sampleItemCount - 1];
        return Boolean(last?.type && last?.d1);
      }

      case 1:
        return true;
      case 2: {
        const needDate =
          jobsTemp?.job_status >= 2 ? !!jobsTemp?.job_info?.start_at : true;
        return needDate;
      }
      case 3: {
        const needDate =
          jobsTemp?.job_status >= 2 ? !!jobsTemp?.job_info?.finish_at : true;
        return needDate;
      }
      case 4:
        return true;
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
    Boolean(isSavedJob && user?.loggedIn && user?.level_jobs);

  function SubmitForm2() {
    setDBLoading(true);

    const tab = Number(tabV) || 0;
    const base = { fileid, jobindex, tabV: tab };
    const fullForm =
      tab === 0
        ? { sampleTemp, ...base, job_status: jobsTemp?.job_status || 0 }
        : { ...jobsTemp, ...base };

    axios
      .post(`${JOBS_JOB}/form2`, fullForm)
      .then((res) => {
        if (!tabV) {
          const samp = res.data.thisJob?.sample || {};
          setSavedSample(samp);
          setTempSample(samp);
        } else {
          setJobsSaved(res.data.thisJob || {});
        }
      })
      .catch(handleApiError)

      .finally(() => setDBLoading(false));
  }

  const CustomerName =
    jobsSaved?.customer_id === 1
      ? jobsSaved?.unreg_customer || "Unregistered"
      : jobsSaved?.cus_name_short || jobsSaved?.customer_name || "";

  const sample_types = {
    pp: "Paper/Board",
    pr: "Print",
    sp: "Spiral",
    rm: "Rim",
    lm: "Lamination",
    fl: "Foil",
  };

  const jobfileTag = (i) => String(i || 0).padStart(5, "0");

  const makeItLoad = DBLoading || !isSavedFile;
  return (
    <Box sx={{ mt: 2, mx: 1 }}>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box id="example jobs">
        <List component="div" disablePadding>
          <Divider />
          <ListItemButton
            component={Link}
            to={`/jobs/file/${jobsSaved?.file_id}`}
          >
            <ListItemAvatar>
              <FolderOutlinedIcon />
            </ListItemAvatar>

            <ListItemText
              primary={
                <>
                  {"#" + jobfileTag(jobsSaved?.file_id)}
                  <b>{` - ${CustomerName}`}</b>
                </>
              }
              secondary={
                <Box
                  sx={{ display: "flex", flexWrap: "wrap" }}
                  component="span"
                >
                  {jobsSaved?.doc_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      {jobsSaved?.doc_name}
                    </Typography>
                  )}

                  {jobsSaved?.file_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      ({jobsSaved?.file_name})
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton sx={{ ml: 4 }} selected>
            <ListItemAvatar>
              <WorkOutlineRoundedIcon />
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  {"#" +
                    jobfileTag(jobsSaved?.file_id) +
                    "_" +
                    (jobsTemp?.job_code || jobindex)}
                  <b>{` - ${CustomerName}`}</b>
                </>
              }
              secondary={
                <Box
                  sx={{ display: "flex", flexWrap: "wrap" }}
                  component="span"
                >
                  {jobsSaved?.doc_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      {jobsSaved.doc_name}
                    </Typography>
                  )}

                  {jobsSaved?.file_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      ({jobsSaved.file_name})
                    </Typography>
                  )}
                  {jobsTemp?.job_name && (
                    <Typography component="span" sx={{ mx: 0.25 }}>
                      - {jobsTemp.job_name}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
          <Divider sx={{ ml: 4 }} />
        </List>
      </Box>
      <MyFormBox
        label={"Job ID"}
        clickable={passedForm1 || !isSavedJob}
        onPress={() => SubmitForm1(jobsTemp)}
        buttonType={isSavedJob ? "Save" : "Create"}
      >
        <TextField
          label="Job Code"
          variant="outlined"
          size="small"
          name="job_code"
          value={jobsTemp?.job_code || ""}
          onChange={onSTRCode_}
        />
        <TextField
          label="Job Name"
          variant="outlined"
          size="small"
          name="job_name"
          value={jobsTemp?.job_name || ""}
          onChange={onSTR_}
        />
      </MyFormBox>
      {isSavedJob && (
        <>
          {/* ////////////////
            DOCS DOCUMENTS
            ///////////////// */}
          <DocUpload
            located_id={`job${fileid}_${jobindex}`}
            label="Documents"
            prefix={`${jobfileTag(fileid)}_${jobindex}`}
            folder_name="jobs/job"
            can_upload={user?.loggedIn}
            can_delete={user?.level > 2 && user?.loggedIn}
            can_view={user?.loggedIn}
          />

          <MyFormBox
            label={"Job Status"}
            clickable={passedForm2}
            onPress={() => SubmitForm2()}
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
                  setTempSample(sampleSaved);
                  setJobsTemp(jobsSaved);
                }}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab
                  value={0}
                  label={
                    jobsSaved?.bid_submit?.method > 0
                      ? "Submitted"
                      : "Submitting"
                  }
                  icon={
                    jobsSaved?.bid_submit?.method > 0 ? (
                      <CheckCircleOutlineRoundedIcon
                        color="success"
                        fontSize="small"
                      />
                    ) : null
                  }
                  iconPosition="end"
                />

                <Tab
                  label={jobsSaved?.job_status ? "Qualified" : "Waiting"}
                  icon={
                    jobsSaved?.job_status >= 1 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={1}
                />
                <Tab
                  label={
                    jobsSaved?.job_status >= 2 ? "Job Started" : "Job Preparing"
                  }
                  icon={
                    jobsSaved?.job_status >= 2 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={2}
                />
                <Tab
                  label={
                    jobsSaved?.job_status >= 3
                      ? "Ready to Deliver"
                      : "Not Finished"
                  }
                  icon={
                    jobsSaved?.job_status >= 3 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={3}
                />
                <Tab
                  label={
                    jobsSaved?.job_status >= 4
                      ? "Delivered"
                      : "Delivery Pending"
                  }
                  icon={
                    jobsSaved?.job_status >= 4 && (
                      <CheckCircleOutlineRoundedIcon color="success" />
                    )
                  }
                  iconPosition="end"
                  value={4}
                />

                <Tab
                  label={
                    !!jobsSaved?.job_payment?.full
                      ? "Fully Paid"
                      : "Payment Pending"
                  }
                  icon={
                    !!jobsSaved?.job_payment?.full && (
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
                <Typography sx={{ pt: 2, width: "100%" }}>
                  Estimation
                  <IconButton
                    component={Link}
                    to={`/esti/${fileid}_${jobindex}_pre`}
                    color="primary"
                  >
                    <AddLinkRoundedIcon />
                  </IconButton>
                </Typography>
                {jobsSaved?.esti_data?.deployed ? (
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
                          <TableCell>{quotVals.unit_count}</TableCell>
                          <TableCell align="right">
                            {toLKR(quotVals.total_price)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(quotVals.total_vat)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(quotVals.total_vat_)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell align="right">
                            {toLKR(quotVals.unit_price)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(quotVals.unit_vat)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(quotVals.unit_vat_)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <>
                    <PendingActionsIcon />
                    <Typography color="error">Pending ...</Typography>
                  </>
                )}
                <Box sx={{ width: "100%", overflow: "hidden" }}>
                  <Typography sx={{ mt: 2 }}>
                    Samples / Materials
                    <IconButton
                      onClick={() => setSampleItemCount((p) => p + 1)}
                      disabled={sampleItemCount && !form2Filled}
                      color="primary"
                    >
                      <AddCircleOutlineRoundedIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        const count = sampleItemCount ?? 0;
                        setTempSample((p) => ({
                          ...p,
                          items: Object.fromEntries(
                            Object.entries(p.items || {}).filter(
                              ([k]) => k != count - 1
                            )
                          ),
                          data: {
                            ...(p.data || {}),
                            status: count <= 1 ? 0 : p.data?.status ?? 0,
                          },
                        }));

                        setSampleItemCount((p) => Math.max(p - 1, 0));
                      }}
                      disabled={(sampleItemCount ?? 0) < 1}
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Typography>
                  <List dense>
                    {Array.from({ length: sampleItemCount }).map((_, idx) => {
                      const s = sampleTemp?.items?.[idx] || {};

                      return (
                        <React.Fragment key={idx}>
                          <ListItemButton
                            selected={idx === sampleItemCount - 1}
                          >
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
                  {sampleItemCount ? (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          name="type"
                          value={
                            sampleTemp?.items?.[sampleItemCount - 1]?.type || ""
                          }
                          onChange={onSTR_NN(
                            setTempSample,
                            "items",
                            sampleItemCount - 1
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
                            )
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
                            sampleTemp?.items?.[sampleItemCount - 1]?.[name] ||
                            ""
                          }
                          onChange={onSTR_NN(
                            setTempSample,
                            "items",
                            sampleItemCount - 1
                          )}
                        />
                      ))}
                    </Stack>
                  ) : null}
                  <Typography sx={{ mt: 4 }}>Sample Status</Typography>

                  <Stack direction="row" flexWrap="wrap" columnGap={1}>
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
                      disabled={!sampleItemCount}
                      name="status"
                      checked={sampleTemp?.data?.status === 1}
                      value={1}
                      onChange={onNUMSample}
                    />
                    <FormControlLabel
                      control={<Checkbox color="success" />}
                      label="Approved"
                      disabled={!sampleItemCount}
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
                </Box>
              </>
            )}
            {tabV === 1 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Typography sx={{ pt: 2 }}>Customr Decision</Typography>
                <Stack direction="row" flexWrap="wrap" columnGap={1}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Waiting"
                    name="job_status"
                    checked={!jobsTemp?.job_status}
                    disabled={jobsSaved?.job_status}
                    value={0}
                    onChange={onNUM_}
                  />
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Qualified"
                    name="job_status"
                    checked={!!jobsTemp?.job_status}
                    disabled={jobsSaved?.job_status >= 2 || !isSubmittedBid}
                    value={1}
                    onChange={onNUM_}
                  />
                </Stack>
                {!!jobsTemp?.job_status && (
                  <>
                    <Typography sx={{ pt: 2 }}>Purchase Order</Typography>
                    <Stack direction="row" flexWrap="wrap" columnGap={1}>
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Waiting"
                        name="status"
                        checked={!jobsTemp?.po?.status}
                        disabled={jobsSaved?.po?.status === 2}
                        value={0}
                        onChange={onNUMPO}
                      />
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Optional"
                        name="status"
                        checked={jobsTemp?.po?.status === 1}
                        disabled={jobsSaved?.po?.status === 2}
                        value={1}
                        onChange={onNUMPO}
                      />
                      <FormControlLabel
                        control={<Checkbox color="success" />}
                        label="Received"
                        name="status"
                        checked={jobsTemp?.po?.status === 2}
                        value={2}
                        onChange={onNUMPO}
                      />
                      {jobsTemp?.po?.status === 2 && (
                        <TextField
                          type="date"
                          size="small"
                          label="PO Date"
                          name="when"
                          value={jobsTemp?.po?.when || ""}
                          onChange={onSTRPO}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    </Stack>

                    <Typography sx={{ py: 2 }}>Delivery Shedule</Typography>

                    <Stack direction="row" flexWrap="wrap" columnGap={1}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Date Type</InputLabel>
                        <Select
                          name="when_type"
                          value={jobsTemp?.delivery?.when_type || 0}
                          MenuProps={{
                            PaperProps: { style: { maxHeight: 300 } },
                          }}
                          label="Date Type"
                          onChange={onNUMDeli}
                        >
                          <MenuItem value={0}>Pending</MenuItem>
                          <MenuItem value={1}>Fixed</MenuItem>
                          <MenuItem value={2}>Flexible</MenuItem>
                        </Select>
                      </FormControl>
                      {jobsTemp?.delivery?.when_type === 1 && (
                        <TextField
                          type="date"
                          size="small"
                          label="Date"
                          name="when"
                          value={jobsTemp?.delivery?.when || ""}
                          onChange={onSTRDeli}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    </Stack>
                  </>
                )}
              </Box>
            )}
            {tabV === 2 && isSubmittedBid && !!jobsSaved?.job_status && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <FormControlLabel
                  label="Performance Bond"
                  labelPlacement="start"
                  sx={{ ml: 0, my: 1 }}
                  control={
                    <Switch
                      checked={!!jobsTemp?.perfbond?.status}
                      disabled={Number(jobsSaved?.perfbond?.status || 0) >= 2}
                      value={jobsTemp?.perfbond?.status ? 0 : 1}
                      name="status"
                      onChange={onNUMPerfBond}
                      color="success"
                    />
                  }
                />
                {!!jobsTemp?.perfbond?.status && (
                  <IconButton
                    color="primary"
                    sx={{ ml: 2 }}
                    disabled={!jobsSaved?.perfbond?.status}
                  >
                    <AddLinkRoundedIcon />
                  </IconButton>
                )}
                <Typography sx={{ pt: 2 }}>Proof</Typography>
                <Stack direction="row" flexWrap="wrap" columnGap={1}>
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Not Need"
                    name="status"
                    checked={jobsTemp?.proof?.status === 2}
                    disabled={jobsSaved?.proof?.status >= 3}
                    value={2}
                    onChange={onNUMProof}
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Processing"
                    name="status"
                    checked={!jobsTemp?.proof?.status}
                    disabled={jobsSaved?.proof?.status >= 1}
                    value={0}
                    onChange={onNUMProof}
                  />
                  {/* <FormControlLabel
                    control={<Checkbox />}
                    label="Submitted"
                    name="status"
                    checked={jobsTemp?.proof?.status === 1}
                    disabled={jobsSaved?.proof?.status >= 2}
                    value={1}
                    onChange={onNUMProof}
                  /> */}
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Approved"
                    name="status"
                    checked={jobsTemp?.proof?.status === 1}
                    disabled={jobsSaved?.proof?.status >= 2}
                    value={1}
                    onChange={onNUMProof}
                  />
                  {jobsTemp?.proof?.status === 1 && (
                    <TextField
                      type="date"
                      size="small"
                      label="Approved Date"
                      name="ok_when"
                      value={jobsTemp?.proof?.ok_when || ""}
                      onChange={onSTRProof}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>
                <Typography sx={{ pt: 2 }}>Art Work</Typography>
                <Stack direction="row" flexWrap="wrap" columnGap={1}>
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="No Print"
                    name="status"
                    checked={jobsTemp?.artwork?.status === 2}
                    disabled={jobsSaved?.artwork?.status >= 3}
                    value={2}
                    onChange={onNUMAW}
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Processing"
                    name="status"
                    checked={!jobsTemp?.artwork?.status}
                    disabled={jobsSaved?.artwork?.status >= 1}
                    value={0}
                    onChange={onNUMAW}
                  />
                  {/* <FormControlLabel
                    control={<Checkbox />}
                    label="Submitted"
                    name="status"
                    checked={jobsTemp?.artwork?.status === 1}
                    disabled={jobsSaved?.artwork?.status >= 2}
                    value={1}
                    onChange={onNUMAW}
                  /> */}
                  <FormControlLabel
                    control={<Checkbox color="success" />}
                    label="Approved / Ready"
                    name="status"
                    checked={jobsTemp?.artwork?.status === 1}
                    disabled={jobsSaved?.artwork?.status >= 2}
                    value={1}
                    onChange={onNUMAW}
                  />
                  {jobsTemp?.artwork?.status === 1 && (
                    <TextField
                      type="date"
                      size="small"
                      label="Approved Date"
                      name="ok_when"
                      value={jobsTemp?.artwork?.ok_when || ""}
                      onChange={onSTRAW}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  columnGap={1}
                  sx={{ mt: 3 }}
                >
                  <FormControlLabel
                    label="JOB Started"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobsTemp?.job_status >= 2}
                        disabled={
                          (jobsSaved?.job_status || 0) !== 1 ||
                          !jobsTemp?.artwork?.status ||
                          !jobsTemp?.proof?.status
                        }
                        value={jobsTemp?.job_status === 2 ? 1 : 2}
                        name="job_status"
                        onChange={onNUM_}
                        color="success"
                      />
                    }
                  />
                  {jobsTemp?.job_status >= 2 && (
                    <TextField
                      type="date"
                      size="small"
                      label="Started Date"
                      name="start_at"
                      value={jobsTemp?.job_info?.start_at || ""}
                      onChange={onSTRInfo}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>
              </Box>
            )}
            {tabV === 3 && isSubmittedBid && jobsSaved?.job_status >= 2 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  columnGap={1}
                  sx={{ mt: 1 }}
                >
                  <FormControlLabel
                    label="JOB Finished"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobsTemp?.job_status >= 3}
                        disabled={(jobsSaved?.job_status || 0) !== 2}
                        value={jobsTemp?.job_status === 3 ? 2 : 3}
                        name="job_status"
                        onChange={onNUM_}
                        color="success"
                      />
                    }
                  />
                  {jobsTemp?.job_status >= 3 && (
                    <TextField
                      type="date"
                      size="small"
                      label="Finished Date"
                      name="finish_at"
                      value={jobsTemp?.job_info?.finish_at || ""}
                      onChange={onSTRInfo}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>
              </Box>
            )}
            {tabV === 4 && isSubmittedBid && jobsSaved?.job_status >= 2 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  columnGap={1}
                  sx={{ mt: 1 }}
                >
                  <FormControlLabel
                    label="Fully Delivered"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobsTemp?.job_status >= 4}
                        disabled={(jobsSaved?.job_status || 0) !== 3}
                        value={jobsTemp?.job_status === 4 ? 3 : 4}
                        name="job_status"
                        onChange={onNUM_}
                        color="success"
                      />
                    }
                  />
                </Stack>
              </Box>
            )}{" "}
            {tabV === 5 && isSubmittedBid && jobsSaved?.job_status >= 2 && (
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  columnGap={1}
                  sx={{ mt: 1 }}
                >
                  <FormControlLabel
                    label="Fully Paid"
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobsTemp?.job_payment?.full === 1}
                        disabled={
                          (jobsSaved?.job_status || 0) <= 3 ||
                          !!jobsSaved?.job_payment?.full
                        }
                        value={jobsTemp?.job_payment?.full === 1 ? 0 : 1}
                        name="full"
                        onChange={onNUMPay}
                        color="success"
                      />
                    }
                  />
                </Stack>
              </Box>
            )}
          </MyFormBox>
        </>
      )}
    </Box>
  );
}
