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
import { handleApiError, onNUM, onSTR } from "../../helpers/HandleChange";
import MyFormBox from "../../helpers/MyFormBox";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import PrintOut from "../../helpers/PrintOut";
import VatInvoice from "../../forms/VatInvoice";

export default function PaperLog({ user }) {
  const today_ = new Date()
    .toLocaleString("sv-SE", { timeZone: "Asia/Colombo" })
    .slice(0, 10);

  const { bsns, id } = useParams();
  const navigate = useNavigate();
  const defForm = {
    rec_at: today_,
    direction: -1,
    storage: 1,
    storageTo: 2,
    type: "",
    type_data: null,
  };
  const [form, setForm] = useState(defForm);
  const [paperList, setPaperList] = useState([]);
  const [stockLog, setStockLog] = useState([]);
  const [DBLoading, SetDBLoading] = useState(true);

  useEffect(() => {
    SetDBLoading(true);
    setForm(defForm);

    const validBsns = ["nim", "gts"];
    if (!bsns || !validBsns.includes(bsns)) {
      navigate("/papers/gts/log", { replace: true });
      return;
    }

    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        const paperList_ = res.data.papers;
        setPaperList(paperList_);

        const routeId = Number(id || 0);
        paperList_.some((p) => p.id === routeId) &&
          setForm((p) => ({ ...p, id: routeId }));

        res.data.success && SetDBLoading(false);
        //console.log(res.data);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  useEffect(() => {
    console.log(form);
  }, [form]);
  useEffect(() => {
    console.log(stockLog);
  }, [stockLog]);

  const getPaper = (id) => {
    if (id == null) return undefined;
    return paperList.find((p) => p.id === Number(id));
  };

  const selectedPaper = getPaper(form?.id);

  const isGts = bsns === "gts";

  useEffect(() => {
    SetDBLoading(true);
    const safeFormID = Number(id || 0);
    axios
      .get(`${PAPERS_API_URL}/${bsns}/stockLog/${safeFormID}`)
      .then((res) => {
        if (res.data.success) {
          console.log(res.data);
          setStockLog(res.data.stockLog || []);
          SetDBLoading(false);
        }
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, [id, navigate, bsns]);

  const unitVal = selectedPaper?.unit_val;

  const changePaper = (e) => {
    const nextId = Number(e.target.value);
    setForm((p) => ({ ...p, id: nextId }));
    navigate(`/papers/${bsns}/log/${nextId}`);
  };

  function SubmitLog() {
    SetDBLoading(true);

    axios
      .post(`${PAPERS_API_URL}/${bsns}/log/rec`, form)
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
  const plus_types = {
    lby: "Buy Local",
    shp: "Shipment",
    fix: "Correction",
  };

  const min_types = {
    vsl: "Sell VAT",
    nsl: "Sell noVAT",
    fix: "Correction",
  };
  const isTrans = !form?.direction;
  const isPlus = form?.direction === 1;

  const typeOk = isTrans ? true : form?.type;
  const formIsFilled =
    form?.rec_at <= today_ &&
    form?.id &&
    form?.change &&
    form?.rec_at &&
    typeOk;
  const transferSame = isTrans && form?.storage === form?.storageTo;

  const reducingStock = !isGts
    ? (selectedPaper?.stock_nim ?? 0)
    : form?.storage === 1
      ? (selectedPaper?.stock_a ?? 0)
      : (selectedPaper?.stock_b ?? 0);

  const moreThan = !isPlus && reducingStock < form?.change;

  const lvl1Ok = isGts
    ? user?.level_paper >= 1 && user?.loggedIn
    : user?.level_stock >= 1 && user?.loggedIn;

  const makeItLoad = DBLoading || !user?.loggedIn;
  return (
    <Box sx={{ mt: 2, mx: 1 }}>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <ToggleButtonGroup
        value={bsns}
        exclusive
        onChange={(e, v) => {
          if (v === null) return;
          navigate(`/papers/${v}/log${id ? "/" + id : ""}`);
          setForm((p) => ({ ...p, type: "", type_data: null, direction: -1 }));
        }}
        size="small"
        color="primary"
        sx={{ mb: 1 }}
      >
        <ToggleButton value={"gts"}>gts papers</ToggleButton>
        <ToggleButton value={"nim"}>nimthara</ToggleButton>
      </ToggleButtonGroup>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          sx={{ width: 85 }}
          component={Link}
          to={`/papers/${bsns}`}
        >
          list
        </Button>
        {bsns === "gts" && (
          <Button
            startIcon={<AttachMoneyRoundedIcon />}
            variant="outlined"
            component={Link}
            to={`/papers/gts/price${id ? "/" + id : ""}`}
          >
            price
          </Button>
        )}
        <Button startIcon={<NotesRoundedIcon />} variant="contained">
          stock
        </Button>
      </Stack>
      <MyFormBox
        clickable={formIsFilled && !transferSame && lvl1Ok && !moreThan}
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

        <ToggleButtonGroup
          value={form?.direction}
          exclusive
          onChange={(e, v) => {
            v !== null &&
              setForm((p) => ({
                ...p,
                type: "",
                type_data: null,
                direction: v,
              }));
          }}
          size="small"
          color="primary"
        >
          <ToggleButton value={-1}>
            <RemoveRoundedIcon />
          </ToggleButton>
          {isGts && (
            <ToggleButton value={0}>
              <SwapHorizRoundedIcon />
            </ToggleButton>
          )}
          <ToggleButton value={1}>
            <AddRoundedIcon />
          </ToggleButton>
        </ToggleButtonGroup>
        {isGts && (
          <FormControl sx={{ minWidth: 100, maxWidth: "80%" }} size="small">
            <InputLabel>{`Warehouse [ ${isPlus ? "+" : "-"} ]`}</InputLabel>
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
        )}
        {isTrans && (
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
        <Stack direction="row" alignItems="center" gap={2}>
          <Num
            name="change"
            value={form?.change ?? 0}
            onChange={onNUM(setForm)}
            label="Quantity"
            deci={0}
            color={moreThan && "red"}
          />
          <Stack direction="row">
            <Num
              name="packets"
              value={Math.floor(Number(form?.change ?? 0) / unitVal)}
              deci={0}
              width={65}
              onChange={(v) =>
                setForm((p) => {
                  const n = Number(v?.target?.value ?? v ?? 0);
                  const total = Number(p?.change ?? 0);
                  return {
                    ...p,
                    change: Math.max(0, n) * unitVal + (total % unitVal),
                  };
                })
              }
            />
            <Num
              name="loose"
              value={Number(form?.change ?? 0) % unitVal}
              deci={0}
              width={70}
              max={unitVal - 1}
              onChange={(v) =>
                setForm((p) => {
                  const n = Number(v?.target?.value ?? v ?? 0);
                  const total = Number(p?.change ?? 0);
                  const loose = Math.min(unitVal - 1, Math.max(0, n));
                  return {
                    ...p,
                    change: Math.floor(total / unitVal) * unitVal + loose,
                  };
                })
              }
            />
          </Stack>
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
        {!isTrans && (
          <FormControl sx={{ minWidth: 80, maxWidth: "80%" }} size="small">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={form?.type || ""}
              label="Type"
              onChange={onSTR(setForm)}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300 } },
              }}
            >
              <MenuItem value="">-</MenuItem>
              {Object.entries(isPlus ? plus_types : min_types).map(
                ([code, label]) => (
                  <MenuItem key={code} value={code}>
                    {label}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        )}
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
          {isGts ? (
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
                {`${selectedPaper?.stock_gts < 0 ? "- " : ""}${
                  Math.floor(Math.abs(selectedPaper?.stock_gts) / unitVal) || 0
                } | ${Math.abs(selectedPaper?.stock_gts) % unitVal || 0}`}
              </Button>
            </Stack>
          ) : (
            <Button size="small" variant="outlined">
              {`${selectedPaper?.stock_nim < 0 ? "- " : ""}${
                Math.floor(Math.abs(selectedPaper?.stock_nim) / unitVal) || 0
              } | ${Math.abs(selectedPaper?.stock_nim) % unitVal || 0}`}
            </Button>
          )}
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
                <Typography component="span">{pl?.rec_at}</Typography>
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
              {/* <PrintOut paperSize="A5">
                <VatInvoice
                  data={{
                    number: `#${String(pl?.stock_rec).padStart(6, "0")}`,
                    date: pl?.rec_at_,
                    company: {
                      name: "My Shop",
                      address: "No 12, Main Road\nKandy, Sri Lanka",
                      phone: "077 123 4567",
                    },
                    vendor: {
                      name: "ABC Suppliers",
                      address: "45, Station Rd\nColombo, Sri Lanka",
                      phone: "011 234 5678",
                    },
                    notes: "Deliver between 9AM - 5PM.\nCall before delivery.",
                    authorizedBy: "Manager",
                  }}
                  items={[
                    {
                      name: getPaper(pl.paper_id)?.display_as,
                      id: "PPR-A4-80",
                      qty: Math.abs(pl?.change),
                      unitPrice: 2200,
                    },
                  ]}
                />
              </PrintOut> */}
              <Typography> Note : {pl?.note}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </List>
    </Box>
  );
}
