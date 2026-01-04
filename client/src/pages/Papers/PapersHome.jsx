import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Num from "../../helpers/Num";
import { toLKR } from "../../helpers/cal";
import { PAPERS_API_URL } from "../../api/urls";
import { Link } from "react-router-dom";
import PrintIcon from "@mui/icons-material/Print";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fab,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import MyFormBox from "../../helpers/MyFormBox";
import { handleApiError, onNUM } from "../../helpers/HandleChange";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
export default function PapersHome({ user }) {
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
    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        setPaperList(res.data.papers);
        setSpecs(res.data.specs);
        //console.log(res.data);
        res.data.success && SetDBLoading(false);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  // useEffect(() => {
  //   console.log("form", form);
  // }, [form]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Paper Price List",
  });

  function SubmitNewPaper() {
    SetDBLoading(true);

    axios
      .post(`${PAPERS_API_URL}/add/`, form)
      .then((res) => {
        if (res.data.success) {
          setPaperList(res.data.papers || {});
          setForm((p) => ({ ...p, size_h: 0, size_w: 0, den: 0 }));
        }
      })
      .catch(handleApiError)
      .finally(() => SetDBLoading(false));
  }

  const formIsFilled =
    form?.type && form?.den && form?.size_w && form?.unit_val;

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
      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
        <Button
          startIcon={
            addPanel ? (
              <HighlightOffRoundedIcon color="error" />
            ) : (
              <NoteAddOutlinedIcon />
            )
          }
          onClick={() => {
            setAddPanel((p) => !p);
            setForm(defForm);
          }}
          disabled={!user?.level_paper}
          variant={!addPanel && "outlined"}
          sx={{ width: 85 }}
        >
          {!addPanel && "add"}
        </Button>
        <Button
          startIcon={<NotesRoundedIcon />}
          variant="outlined"
          disabled={!user?.level_paper}
          component={Link}
          to="/papers/log"
        >
          LOG
        </Button>
      </Stack>
      {addPanel && (
        <MyFormBox
          label={"Add New Paper"}
          clickable={formIsFilled}
          onPress={() => SubmitNewPaper()}
          user={user}
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
      )}
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
                  0
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
                    <Stack
                      direction="row"
                      alignItems="center"
                      width="100%"
                      gap={1}
                    >
                      {/* LEFT: text grows */}
                      <Typography sx={{ flexGrow: 1 }}>
                        {pp?.display_as}
                      </Typography>

                      {/* RIGHT: buttons stay together */}
                      <Stack direction="row" gap={1}>
                        <Button
                          size="small"
                          sx={{ whiteSpace: "nowrap", fontWeight: 500 }}
                          component={user?.loggedIn && Link}
                          to={`/papers/price/${pp?.id}`}
                        >
                          {toLKR(pp?.last_price)}
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ width: 60 }}
                          component={user?.loggedIn && Link}
                          to={`/papers/log/${pp?.id}`}
                        >
                          0/0
                          {/* {Math.floor(Math.random() * 1001) +
                              "/" +
                              Math.floor(Math.random() * 501)} */}
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
