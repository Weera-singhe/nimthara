import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Num from "../../helpers/Num";
import { toDeci, toLKR } from "../../helpers/cal";
import { PAPERS_API_URL } from "../../api/urls";
import { Link, useParams, useNavigate, replace } from "react-router-dom";
import PrintIcon from "@mui/icons-material/Print";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  Fab,
  FormControl,
  Grow,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import MyFormBox from "../../helpers/MyFormBox";
import { handleApiError, onNUM, onSTRCode } from "../../helpers/HandleChange";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
export default function PapersHome({ user }) {
  const { bsns } = useParams();
  const navigate = useNavigate();
  const defForm = {
    color: 1,
    den_unit: 1,
    brand: 1,
    unit_type: 1,
  };
  const [DBLoading, SetDBLoading] = useState(true);
  const [paperList, setPaperList] = useState([]);
  const [form, setForm] = useState(defForm);
  const [addPanel, setAddPanel] = useState(false);
  const printRef = useRef(null);

  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    SetDBLoading(true);
    setForm(defForm);
    setAddPanel(false);
    const validBsns = ["nimthara", "gts"];
    console.log("bsns", bsns);

    if (!bsns || !validBsns.includes(bsns)) {
      navigate("/papers/gts", { replace: true });
    }
    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        setPaperList(res.data.papers);
        setSpecs(res.data.specs);
        //console.log(res.data);
        res.data.success && SetDBLoading(false);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, [bsns, navigate]);

  useEffect(() => {
    console.log("form", form);
  }, [form]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Paper Price List",
  });

  function SubmitNewPaper() {
    SetDBLoading(true);

    axios
      .post(`${PAPERS_API_URL}/${bsns}/add/`, form)
      .then((res) => {
        if (res.data.success) {
          setPaperList(res.data.papers || {});
          setForm((p) => ({
            ...p,
            size_h: 0,
            size_w: 0,
            den: 0,
            brand: 1,
          }));
        }
      })
      .catch(handleApiError)
      .finally(() => SetDBLoading(false));
  }

  function SubmitNewSpec() {
    SetDBLoading(true);

    axios
      .post(`${PAPERS_API_URL}/${bsns}/addspec/`, form)
      .then((res) => {
        if (res.data.success) {
          setSpecs(res.data.specs || {});
          setForm(defForm);
        }
      })
      .catch(handleApiError)
      .finally(() => SetDBLoading(false));
  }
  const isGts = bsns === "gts";
  const form1Filled = form?.type && form?.den && form?.size_w && form?.unit_val;
  const lvl1Ok = isGts
    ? user?.level_paper >= 1 && user?.loggedIn
    : user?.level_stock >= 1 && user?.loggedIn;

  const makeItLoad = DBLoading;
  return (
    <Box sx={{ mt: 2, mx: 1 }}>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Fab
        color="primary"
        size="small"
        onClick={handlePrint}
        disabled={makeItLoad}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1200,
          "@media print": {
            display: "none",
          },
        }}
      >
        {makeItLoad ? (
          <CircularProgress size={20} sx={{ color: "white" }} />
        ) : (
          <PrintIcon />
        )}
      </Fab>
      {user?.loggedIn && (
        <>
          <ToggleButtonGroup
            value={bsns}
            exclusive
            onChange={(e, v) => {
              navigate(`/papers/${v}`);
            }}
            size="small"
            color="primary"
            sx={{ mb: 1 }}
          >
            <ToggleButton value={"gts"}>gts papers</ToggleButton>
            <ToggleButton value={"nimthara"}>nimthara</ToggleButton>
          </ToggleButtonGroup>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            <Button
              startIcon={<NoteAddOutlinedIcon />}
              onClick={() => {
                setAddPanel((p) => !p);
                setForm(defForm);
              }}
              disabled={!user?.level_paper}
              variant={!addPanel ? "outlined" : "contained"}
              sx={{ width: 85 }}
            >
              add
            </Button>
            {isGts && (
              <Button
                startIcon={<AttachMoneyRoundedIcon />}
                variant="outlined"
                disabled={!user?.level_paper}
                component={Link}
                to={`/papers/gts/price`}
              >
                Price
              </Button>
            )}
            <Button
              startIcon={<NotesRoundedIcon />}
              variant="outlined"
              disabled={!user?.level_paper}
              component={Link}
              to={`/papers/${bsns}/log`}
            >
              STOCK
            </Button>
          </Stack>
        </>
      )}
      <Collapse in={addPanel} unmountOnExit>
        <MyFormBox
          label={"New Paper"}
          clickable={form1Filled && lvl1Ok}
          onPress={() => SubmitNewPaper()}
          user={user}
          sx={{ mt: 1 }}
        >
          <FormControl sx={{ minWidth: 150, maxWidth: "80%" }} size="small">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={form?.type || 0}
              label="Type"
              onChange={onNUM(setForm)}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300 } },
              }}
            >
              <MenuItem value={0}>
                <em>-</em>
              </MenuItem>

              {specs?.types?.map((ty) => (
                <MenuItem key={ty?.id} value={ty?.id}>
                  {ty?.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={form?.den_unit}
            exclusive
            onChange={(e, v) => {
              v !== null && setForm((p) => ({ ...p, den_unit: v }));
            }}
            size="small"
            color="primary"
          >
            {specs?.den_units?.map((du) => (
              <ToggleButton key={du?.id} value={du?.id}>
                {du?.denunit}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Num
            label={form?.den_unit === 1 ? "gsm" : "mm"}
            onChange={onNUM(setForm)}
            value={form?.den}
            name="den"
          />
          <Num
            label="Length"
            onChange={onNUM(setForm)}
            value={form?.size_h}
            name="size_h"
          />
          <Num
            label="Width"
            onChange={onNUM(setForm)}
            value={form?.size_w}
            name="size_w"
          />
          <FormControl sx={{ minWidth: 130, maxWidth: "80%" }} size="small">
            <InputLabel>Brand</InputLabel>
            <Select
              name="brand"
              value={form?.brand}
              label="brand"
              onChange={onNUM(setForm)}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300 } },
              }}
            >
              {specs?.brands?.map((br) => (
                <MenuItem key={br?.id} value={br?.id}>
                  {br?.brand || "\u00A0"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 110, maxWidth: "80%" }} size="small">
            <InputLabel>Color</InputLabel>
            <Select
              name="color"
              value={form?.color || 0}
              label="Color"
              onChange={onNUM(setForm)}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300 } },
              }}
            >
              {specs?.colors?.map((cl) => (
                <MenuItem key={cl?.id} value={cl?.id}>
                  {cl?.color || "\u00A0"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={form?.unit_type}
            exclusive
            onChange={(e, v) => {
              v !== null && setForm((p) => ({ ...p, unit_type: v }));
            }}
            size="small"
            color="primary"
          >
            {specs?.unit_types?.map((ut) => (
              <ToggleButton key={ut?.id} value={ut?.id}>
                {ut?.unit_type}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Num
            label={form?.unit_type === 1 ? "sheets" : "KG"}
            onChange={onNUM(setForm)}
            value={form?.unit_val}
            name="unit_val"
          />
        </MyFormBox>
      </Collapse>

      <Box ref={printRef}>
        {specs?.types?.map((ty) => (
          <Accordion defaultExpanded key={ty?.id}>
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              sx={{ backgroundColor: "#e0f2f1" }}
            >
              <Typography component="span" fontWeight={450}>
                {ty?.type}
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  mx: 1.5,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 1,
                  backgroundColor: "#9cb6b6ff",
                  fontWeight: 450,
                }}
              >
                {paperList?.reduce(
                  (n, pp) => n + (pp?.type_ === ty?.id ? 1 : 0),
                  0,
                )}
              </Box>
            </AccordionSummary>
            <Divider />
            {paperList
              .filter((pp) => pp?.type_ === ty?.id)
              .map((pp) => (
                <Box key={pp?.id}>
                  <AccordionDetails
                    sx={{
                      py: 1,
                    }}
                  >
                    <Stack direction="row" alignItems="center" width="100%">
                      {/* LEFT: text grows */}
                      <Typography sx={{ flexGrow: 1, mr: 0.5 }}>
                        {pp?.display_as}
                      </Typography>

                      {/* RIGHT: buttons stay together */}
                      <Stack direction="row" gap={1}>
                        {isGts && (
                          <Button
                            size="small"
                            sx={{ whiteSpace: "nowrap", fontWeight: 500 }}
                            component={user?.loggedIn && Link}
                            to={`/papers/${bsns}/price/${pp?.id}`}
                          >
                            {toDeci(pp?.last_price)}
                            <small>&nbsp;/{pp?.unit_val}</small>
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 80 }}
                          component={user?.loggedIn && Link}
                          to={`/papers/${bsns}/log/${pp?.id}`}
                        >
                          {`${
                            (isGts ? pp?.stock_gts : pp?.stock_nim) < 0
                              ? "- "
                              : ""
                          }${
                            Math.floor(
                              Math.abs(isGts ? pp?.stock_gts : pp?.stock_nim) /
                                pp?.unit_val,
                            ) || 0
                          } | ${
                            Math.abs(isGts ? pp?.stock_gts : pp?.stock_nim) %
                              pp?.unit_val || 0
                          }`}
                        </Button>
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                  <Divider sx={{ mx: 1 }} />
                </Box>
              ))}
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
