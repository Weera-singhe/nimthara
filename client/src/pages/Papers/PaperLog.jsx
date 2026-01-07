import React, { useEffect, useState } from "react";
import Num from "../../helpers/Num";
import axios from "axios";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PAPERS_API_URL } from "../../api/urls";
import {
  handleApiError,
  onNUM,
  onNUM_N,
  onSTR,
} from "../../helpers/HandleChange";
import MyFormBox from "../../helpers/MyFormBox";
import { toLKR } from "../../helpers/cal";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";

export default function PaperLog({ user }) {
  const today_ = new Date()
    .toLocaleString("sv-SE", { timeZone: "Asia/Colombo" })
    .slice(0, 10);

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rec_at: today_,
    direction: -1,
    storage: 1,
    storageTo: 2,
  });
  const [paperList, setPaperList] = useState([]);
  const [stockLog, setStockLog] = useState([]);
  const [DBLoading, SetDBLoading] = useState(true);

  useEffect(() => {
    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        const paperList_ = res.data.papers;
        setPaperList(paperList_);

        const routeId = Number(id || 0);
        paperList_.some((p) => p.id === routeId) &&
          setForm((p) => ({ ...p, id: routeId }));

        console.log(res.data);
        res.data.success && SetDBLoading(false);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, [id]);

  useEffect(() => {
    console.log(form);
  }, [form]);

  useEffect(() => {
    SetDBLoading(true);

    const safeFormID = Number(id || 0);
    axios
      .get(`${PAPERS_API_URL}/stockLog/${safeFormID}`)
      .then((res) => {
        if (res.data.success) {
          console.log(res.data);
          setStockLog(res.data.stockLog || []);
          SetDBLoading(false);
        }
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, [id]);

  const selectedPaper = paperList.find((p) => p.id === Number(form.id));
  const unitVal = selectedPaper?.unit_val;

  const changePaper = (e) => {
    const nextId = Number(e.target.value);
    setForm((p) => ({ ...p, id: nextId }));
    navigate(`/papers/log/${nextId}`, { replace: false });
  };

  function SubmitLog() {
    SetDBLoading(true);

    axios
      .post(`${PAPERS_API_URL}/log/rec`, form)
      .then((res) => {
        if (res.data.success) {
          setStockLog(res.data.stockLog || []);
          setForm((p) => ({ ...p, change: 0 }));
          setPaperList(res.data.papers || []);
        }
      })
      .catch(handleApiError)
      .finally(() => SetDBLoading(false));
  }

  const formIsFilled =
    new Date(form.rec_at) <= new Date(today_) && form?.id && form?.change;
  const transferSame = !form?.direction && form?.storage === form?.storageTo;

  const minusStock =
    form?.storage === 1
      ? selectedPaper?.stock_a ?? 0
      : selectedPaper?.stock_b ?? 0;
  const moreThan = form?.direction < 1 && minusStock < form?.change;

  const makeItLoad = DBLoading || !user?.loggedIn;
  return (
    <Box sx={{ mt: 2, mx: 1 }}>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          sx={{ width: 85 }}
          component={Link}
          to="/papers"
        >
          list
        </Button>
        <Button
          startIcon={<AttachMoneyRoundedIcon />}
          variant="outlined"
          disabled={!user?.level_paper}
          component={Link}
          to={`/papers/price${id ? "/" + id : ""}`}
        >
          Price
        </Button>
        <Button startIcon={<NotesRoundedIcon />} variant="outlined" disabled>
          log
        </Button>
      </Stack>
      <MyFormBox
        clickable={
          formIsFilled && !transferSame && user?.level_paper >= 1 && !moreThan
        }
        user={user}
        onPress={SubmitLog}
      >
        <FormControl sx={{ minWidth: 230, maxWidth: "80%" }} size="small">
          <InputLabel>Paper</InputLabel>
          <Select
            name="id"
            value={form?.id || 0}
            label="Paper"
            onChange={changePaper}
            MenuProps={{
              PaperProps: { style: { maxHeight: 300 } },
            }}
          >
            <MenuItem value={0}>-</MenuItem>
            {paperList?.map((pp) => (
              <MenuItem key={pp?.id} value={pp?.id}>
                {pp?.display_as}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {form?.direction !== 0 && (
          <TextField
            name="dealer"
            size="small"
            label="Dealer"
            value={form?.dealer || ""}
            onChange={onSTR(setForm)}
          />
        )}
        <ToggleButtonGroup
          value={form.direction}
          exclusive
          onChange={(e, v) => {
            v !== null && setForm((p) => ({ ...p, direction: v }));
          }}
          size="small"
          color="primary"
        >
          <ToggleButton value={-1}>
            <RemoveRoundedIcon />
          </ToggleButton>
          <ToggleButton value={0}>
            <SwapHorizRoundedIcon />
          </ToggleButton>
          <ToggleButton value={1}>
            <AddRoundedIcon />
          </ToggleButton>
        </ToggleButtonGroup>
        <FormControl sx={{ minWidth: 100, maxWidth: "80%" }} size="small">
          <InputLabel>{`Warehouse [ ${
            form.direction === 1 ? "+" : "-"
          } ]`}</InputLabel>
          <Select
            name="storage"
            value={form?.storage}
            label="Warehouse [ + ]"
            onChange={onNUM(setForm)}
          >
            <MenuItem value={1}>A - StationRoad</MenuItem>
            <MenuItem value={2}>B - TempleRoad</MenuItem>
          </Select>
        </FormControl>
        {form?.direction === 0 && (
          <FormControl sx={{ minWidth: 100, maxWidth: "80%" }} size="small">
            <InputLabel> Warehouse [ + ]</InputLabel>
            <Select
              name="storageTo"
              value={form?.storageTo}
              label="Warehouse [ + ]"
              onChange={onNUM(setForm)}
            >
              <MenuItem value={1}>A - StationRoad</MenuItem>
              <MenuItem value={2}>B - TempleRoad</MenuItem>
            </Select>
          </FormControl>
        )}

        <Stack direction="row" alignItems="center">
          <Num
            name="change"
            value={form?.change}
            onChange={onNUM(setForm)}
            label="Quantity"
            deci={0}
            color={moreThan && "red"}
          />
          {!!form?.change && (
            <Box
              color="error"
              sx={{ border: "1px solid #b9b9b9ff", p: 1.2, borderRadius: 1 }}
            >
              {Math.floor(form?.change / unitVal)}
              {" | "}
              {form?.change % unitVal}
            </Box>
          )}
        </Stack>
        <TextField
          type="date"
          name="rec_at"
          value={form?.rec_at || ""}
          size="small"
          onChange={onSTR(setForm)}
        />
        <TextField
          name="note"
          size="small"
          label="Note"
          value={form?.note || ""}
          onChange={onSTR(setForm)}
          sx={{ width: 300 }}
        />
      </MyFormBox>
      <List>
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{
            p: 2,
            border: "1px solid grey",
            borderRadius: 1,
            backgroundColor: "#e0f2f1",
          }}
        >
          <Typography component="span" fontWeight={450} sx={{ mr: 5 }}>
            {selectedPaper?.display_as || "Select Paper"}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" variant="outlined">
              <small style={{ marginRight: 8 }}>A</small>
              {`${selectedPaper?.stock_a < 0 ? "- " : ""}${
                Math.floor(Math.abs(selectedPaper?.stock_a) / unitVal) || 0
              } | ${Math.abs(selectedPaper?.stock_a) % unitVal || 0}`}
            </Button>
            <Button size="small" variant="outlined">
              <small style={{ marginRight: 8 }}>B</small>
              {`${selectedPaper?.stock_b < 0 ? "- " : ""}${
                Math.floor(Math.abs(selectedPaper?.stock_b) / unitVal) || 0
              } | ${Math.abs(selectedPaper?.stock_b) % unitVal || 0}`}
            </Button>
            <Button size="small" variant="outlined">
              {`${selectedPaper?.stock_all < 0 ? "- " : ""}${
                Math.floor(Math.abs(selectedPaper?.stock_all) / unitVal) || 0
              } | ${Math.abs(selectedPaper?.stock_all) % unitVal || 0}`}
            </Button>
          </Stack>
        </Stack>

        {stockLog?.map((pl) => (
          <Accordion key={pl.stock_rec}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 0.5, sm: 2 },
                  pt: 1,
                }}
              >
                <Typography component="span" fontWeight={450}>
                  #{String(pl?.stock_rec).padStart(6, "0")}
                </Typography>
                <Typography component="span">{pl?.rec_at_}</Typography>
              </Box>
              <Box
                sx={{
                  ml: "auto",
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <TaskAltRoundedIcon color="success" fontSize="small" />
                <Button sx={{ minWidth: 30, width: 30 }} component="span">
                  {pl?.storage === 1 ? "A" : "B"}
                </Button>
                <Button
                  variant="outlined"
                  color={pl?.change < 0 ? "error" : "primary"}
                  component="span"
                >
                  {pl?.change < 0 && "- "}
                  {Math.floor(Math.abs(pl?.change) / unitVal) || 0}
                  {" | "}
                  {Math.abs(pl?.change) % unitVal || 0}
                </Button>
              </Box>
            </AccordionSummary>
            <Divider sx={{ mx: 2 }} />
            <AccordionDetails>
              <Typography>Dealer : {pl?.dealer}</Typography>
              <Typography> Note : {pl?.note}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </List>
    </Box>
  );
}
