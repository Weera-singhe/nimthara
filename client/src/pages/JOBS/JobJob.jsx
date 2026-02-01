import { JOBS_API_URL } from "../../api/urls";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { toLKR } from "../../helpers/cal";

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
import ApprovalIcon from "@mui/icons-material/Approval";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DocUpload from "../../helpers/DocUpload";
import MyFormBox from "../../helpers/MyFormBox";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import deepEqual from "fast-deep-equal";
import Num from "../../helpers/Num";
//import CheckIcon from "@mui/icons-material/Check";
//import EditIcon from "@mui/icons-material/Edit";
//import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

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

  const [extras, setExtras] = useState([]);

  const [tabV, setTabV] = useState(0);

  const [stockForm, setStockForm] = useState([]);
  const [allPapers, setAllPapers] = useState([]);

  const onSTR_ = onSTR(setJobTemp);
  const onSTRCode_ = onSTRCode(setJobTemp);
  const onNUM_ = onNUM(setJobTemp);
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

        setTheseJobs(res.data.theseJobs || []);
        setAllPapers(res.data.allPapers || []);
      })
      .catch(handleApiError)
      .finally(() => {
        setDBLoading(false);
      });
  }, [fileid, jobindex]);

  const infTmp = jobTemp?.job_info;
  const infSvd = jobSaved?.job_info;

  useEffect(() => {
    console.log("temp", jobTemp);
  }, [jobTemp]);
  useEffect(() => {
    console.log("infTmp", infTmp);
  }, [infTmp]);

  const isSavedJob = jobSaved?.job_index;
  const isSavedFile = jobSaved?.file_id;
  const isSubmittedBid = [1, 2, 3, 4].includes(
    Number(jobSaved?.bid_submit?.method),
  );

  const same = (a, b, e) => (a || e) === (b || e);

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

  const tab = tabV ?? 0;

  const isForm2Same = () => {
    switch (tabV) {
      case 0: {
        const savedItems = infSvd?.mate ?? [];
        const tempItems = infTmp?.mate ?? [];

        return (
          deepEqual(savedItems, tempItems) &&
          same(infTmp?.esti_ok, infSvd?.esti_ok, false)
        );
      }
      case 1: {
        const savedLog = jobSaved?.bid_result?.log ?? [];
        const tempLog = jobTemp?.bid_result?.log ?? [];
        return (
          same(jobTemp?.po?.status, jobSaved?.po?.status, "") &&
          same(jobTemp?.po?.when, jobSaved?.po?.when, 0) &&
          same(jobTemp?.po?.code, jobSaved?.po?.code, 0) &&
          same(
            jobTemp?.delivery?.deadline_type,
            jobSaved?.delivery?.deadline_type,
            0,
          ) &&
          same(jobTemp?.delivery?.deadline, jobSaved?.delivery?.deadline, "") &&
          same(jobTemp?.job_status, jobSaved?.job_status, 0) &&
          deepEqual(savedLog, tempLog)
        );
      }
      case 2: {
        const savedOther = infSvd?.other ?? [];
        const tempOther = infTmp?.other ?? [];
        const savedFin = infSvd?.finishing ?? [];
        const tempFin = infTmp?.finishing ?? [];
        const savedMach = infSvd?.machine ?? [];
        const tempMach = infTmp?.machine ?? [];
        return (
          same(jobTemp?.perfbond?.status, jobSaved?.perfbond?.status, 0) &&
          same(jobTemp?.proof?.status, jobSaved?.proof?.status, 0) &&
          same(jobTemp?.proof?.ok_when, jobSaved?.proof?.ok_when, "") &&
          same(jobTemp?.artwork?.ok_when, jobSaved?.artwork?.ok_when, "") &&
          same(infTmp?.start_at, infSvd?.start_at, "") &&
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
          same(infTmp?.finish_at, infSvd?.finish_at, "")
        );
      case 4: {
        const savedLog = jobSaved?.delivery?.log ?? [];
        const tempLog = jobTemp?.delivery?.log ?? [];

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
        return true;
      }

      case 1: {
        return true;
      }

      case 2: {
        const needDate = jobTemp?.job_status >= 2 ? !!infTmp?.start_at : true;
        return needDate;
      }
      case 3: {
        const needDate = jobTemp?.job_status >= 2 ? !!infTmp?.finish_at : true;
        return needDate;
      }
      case 4: {
        return true;
      }

      case 5:
        return true;

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
      ...base,
    };

    axios
      .post(`${JOBS_API_URL}/job/form2`, fullForm)
      .then((res) => {
        const job = res.data.thisJob;
        setJobSaved(job || {});
        setJobTemp(job || {});
      })
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
                  setJobTemp(jobSaved || {});
                  setExtras([]);
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
                    </IconButton>{" "}
                    <IconButton
                      disabled={user?.level_jobs < 3}
                      onClick={() =>
                        setJobTemp((p) => ({
                          ...p,
                          job_info: {
                            ...(p.job_info || {}),
                            esti_ok: !(p.job_info?.esti_ok ?? false),
                          },
                        }))
                      }
                      color="primary"
                    >
                      {infTmp?.esti_ok ? (
                        <RemoveCircleOutlineRoundedIcon />
                      ) : (
                        <AddCircleOutlineRoundedIcon />
                      )}
                    </IconButton>
                  </Typography>
                </Box>
                {!!infTmp?.esti_ok && (
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
                            {infTmp?.unit_count.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(infTmp?.unit_count * infTmp?.unit_price)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(
                              infTmp?.unit_count * infTmp?.unit_price * 0.18,
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(
                              infTmp?.unit_count * infTmp?.unit_price * 1.18,
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell align="right">
                            {toLKR(infTmp?.unit_price)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(infTmp?.unit_price * 0.18)}
                          </TableCell>
                          <TableCell align="right">
                            {toLKR(infTmp?.unit_price * 1.18)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Box sx={{ width: "100%", overflow: "hidden" }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ pb: 3 }}>Materials</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    <TextField
                      sx={{ width: 150 }}
                      size="small"
                      label="Item/Part"
                      placeholder="top/mid/cover.."
                      name="mateitem"
                      value={extras?.mateitem || ""}
                      onChange={onSTR(setExtras)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        name="matetype"
                        value={extras?.matetype || ""}
                        onChange={onSTR(setExtras)}
                        label="Type"
                      >
                        <MenuItem value="">{"\u00A0"}</MenuItem>
                        <MenuItem value="Paper">Paper/Board</MenuItem>
                        <MenuItem value="Metal">Metal</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      sx={{ width: 300 }}
                      size="small"
                      label="Details"
                      name="matedata"
                      value={extras?.matedata || ""}
                      onChange={onSTR(setExtras)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      sx={{ width: 150 }}
                      size="small"
                      label="Supplier"
                      name="matesup"
                      value={extras?.matesup || ""}
                      onChange={onSTR(setExtras)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <IconButton
                      color="primary"
                      disabled={!extras?.matetype || !extras?.matedata}
                      onClick={() => {
                        const neww = {
                          ty: extras?.matetype?.trim(),
                          dt: extras?.matedata?.trim(),
                          item: extras?.mateitem?.trim(),
                          sup: extras?.matesup?.trim(),
                        };

                        setJobTemp((p) => ({
                          ...p,
                          job_info: {
                            ...(p.job_info || {}),
                            mate: [...(p.job_info?.mate || []), neww],
                          },
                        }));

                        setExtras((p) => ({
                          ...p,
                          matetype: "",
                          matedata: "",
                          matesup: "",
                          mateitem: "",
                        }));
                      }}
                    >
                      <AddCircleOutlineRoundedIcon />
                    </IconButton>
                  </Stack>

                  <List dense sx={{ my: 1, maxWidth: 835 }}>
                    {(infTmp?.mate || []).map((r, i) => (
                      <ListItem
                        key={i}
                        sx={{ "&:hover": { bgcolor: "#f2f8ff" } }}
                      >
                        <ListItemText
                          primary={[r.item, r?.ty, r?.dt, r.sup]
                            .filter(Boolean)
                            .join(" - ")}
                        />
                        <IconButton
                          onClick={() => {
                            setJobTemp((p) => ({
                              ...p,
                              job_info: {
                                ...(p.job_info || {}),
                                mate: (p.job_info?.mate || []).map((m, idx) =>
                                  idx === i ? { ...m, done: !m?.done } : m,
                                ),
                              },
                            }));
                          }}
                        >
                          <ApprovalIcon
                            fontSize="small"
                            color={r?.done ? "primary" : "action"}
                          />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setJobTemp((p) => ({
                              ...p,
                              job_info: {
                                ...(p.job_info || {}),
                                mate: (p.job_info?.mate || []).filter(
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
                  {(jobTemp?.bid_result?.log || [])
                    .sort((a, b) => (a?.v || 0) - (b?.v || 0))
                    .map((r, i) => (
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
                          value={jobTemp?.delivery?.deadline_type || 0}
                          MenuProps={{
                            PaperProps: { style: { maxHeight: 300 } },
                          }}
                          label="Date Type"
                          onChange={onNUM_N(setJobTemp, "delivery")}
                        >
                          <MenuItem value={0}>Pending</MenuItem>
                          <MenuItem value={1}>Fixed</MenuItem>
                          <MenuItem value={2}>Flexible</MenuItem>
                        </Select>
                      </FormControl>
                      {jobTemp?.delivery?.deadline_type === 1 && (
                        <TextField
                          type="date"
                          sx={{ width: 150 }}
                          size="small"
                          label="Date"
                          name="deadline"
                          value={jobTemp?.delivery?.deadline || ""}
                          onChange={onSTR_N(setJobTemp, "delivery")}
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
                  {infTmp?.machine?.map((m, i) => (
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
                  {infTmp?.finishing?.map((m, i) => (
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
                  {infTmp?.others?.map((m, i) => (
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
                      value={infTmp?.start_at || ""}
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
                      value={infTmp?.finish_at || ""}
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
                    label="Fully Delivered "
                    labelPlacement="start"
                    sx={{ ml: 0, mr: 1 }}
                    control={
                      <Switch
                        checked={jobTemp?.job_status >= 4}
                        disabled={
                          (jobSaved?.job_status || 0) !== 3 ||
                          !jobSaved?.delivery?.log?.length
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
                <Typography sx={{ pb: 3 }}>Delivery Log</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      name="deli_meth"
                      value={extras?.deli_meth || 0}
                      onChange={onNUM(setExtras)}
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
                    value={extras?.deli_date || ""}
                    onChange={onSTR(setExtras)}
                  />
                  <Num
                    sx={{ width: 100 }}
                    name="deli_qty"
                    value={extras?.deli_qty || 0}
                    onChange={onNUM(setExtras)}
                    label={`Units ${infTmp?.unit_count ? Math.round(((extras?.deli_qty || 0) / jobSaved.job_info.unit_count) * 100) : 0}%`}
                    max={infTmp?.unit_count}
                  />

                  <IconButton
                    color="primary"
                    disabled={
                      !extras?.deli_date ||
                      !extras?.deli_meth ||
                      !extras?.deli_qty
                    }
                    onClick={() => {
                      const neww = {
                        deli_meth: extras?.deli_meth,
                        deli_date: extras?.deli_date,
                        deli_qty: extras?.deli_qty,
                      };

                      setJobTemp((p) => ({
                        ...p,
                        delivery: {
                          ...(p.delivery || {}),
                          log: [...(p.delivery?.log || []), neww],
                        },
                      }));

                      setExtras((p) => ({
                        ...p,
                        deli_meth: 0,
                        deli_date: "",
                        deli_qty: 0,
                      }));
                    }}
                  >
                    <AddCircleOutlineRoundedIcon />
                  </IconButton>
                </Stack>
                <List dense sx={{ my: 1, maxWidth: 835 }}>
                  {(jobTemp?.delivery?.log || []).map((s, i) => (
                    <ListItem
                      key={i}
                      sx={{ "&:hover": { bgcolor: "#f2f8ff" } }}
                    >
                      <ListItemText
                        primary={`${i + 1} - ${
                          deli_methods[s?.deli_meth] || "-"
                        }`}
                        secondary={
                          [
                            s?.deli_qty != null
                              ? `${Number(
                                  s.deli_qty,
                                ).toLocaleString()} Units ( ${(
                                  (s.deli_qty / infTmp?.unit_count) *
                                  100
                                ).toFixed(2)} % )`
                              : null,
                            s?.deli_date,
                          ]
                            .filter(Boolean)
                            .join(" • ") || "-"
                        }
                      />

                      <IconButton
                        onClick={() => {
                          setJobTemp((p) => ({
                            ...p,
                            delivery: {
                              ...(p.delivery || {}),
                              log: (p.delivery?.log || []).filter(
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

          <MyFormBox
            label={"Stock Log"}
            //clickable={passedForm3}
            //onPress={() => SubmitForm3(jobTemp)}
            user={user}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={stockForm?.type || ""}
                onChange={onSTR(setStockForm)}
                label="Type"
              >
                <MenuItem value="">{"\u00A0"}</MenuItem>
                <MenuItem value="Paper">Paper/Board</MenuItem>
                <MenuItem value="Metal">Metal</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Paper</InputLabel>
              <Select
                name="paper"
                value={stockForm?.paper || ""}
                onChange={onNUM(setStockForm)}
                label="Paper"
                MenuProps={{
                  PaperProps: { style: { maxHeight: 300 } },
                }}
              >
                <MenuItem value={0}>-</MenuItem>
                {allPapers.map((pp) => (
                  <MenuItem value={pp?.id} key={pp?.id}>
                    {pp?.display_as}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Num
              name="change"
              value={stockForm?.change ?? 0}
              onChange={onNUM(setStockForm)}
              label="Sheets"
              deci={0}
            />
          </MyFormBox>
        </>
      )}
    </Box>
  );
}
