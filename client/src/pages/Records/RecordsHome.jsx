import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Num from "../../helpers/Num";
import { toDeci, toLKR } from "../../helpers/cal";
import { RECORDS_API_URL } from "../../api/urls";
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
  List,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import MyFormBox from "../../helpers/MyFormBox";
import { handleApiError, onNUM, onSTRCode } from "../../helpers/HandleChange";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
export default function RecordsHome({ user }) {
  const navigate = useNavigate();

  const [DBLoading, SetDBLoading] = useState(true);
  const [tabV, setTabV] = useState(0);

  useEffect(() => {
    SetDBLoading(true);

    axios
      .get(RECORDS_API_URL)
      .then((res) => {
        res.data.success && SetDBLoading(false);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  // useEffect(() => {
  //   console.log("form", form);
  // }, [form]);

  const makeItLoad = DBLoading;
  return (
    <Box sx={{ mt: 2, mx: 1 }}>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={makeItLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Tabs
        value={tabV}
        onChange={(_, v) => setTabV(v)}
        textColor="secondary"
        indicatorColor="secondary"
        sx={{ mb: 2 }}
      >
        <Tab
          value={0}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Nimthara
              {DBLoading && <CircularProgress size={16} color="inherit" />}
            </Box>
          }
        />
        <Tab
          value={1}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              GTS
              {DBLoading && <CircularProgress size={16} color="inherit" />}
            </Box>
          }
        />
      </Tabs>
      {!tabV ? (
        <Box>
          <List
            sx={{
              "& .MuiListItemButton-root": {
                border: "1px solid #c9a3c4",
                borderLeft: "4px solid #9c27b0",
                borderRadius: 1,
                mb: 1,
                p: 2,
                "&:hover": {
                  bgcolor: "#ead1e6",
                },
              },
            }}
          >
            <ListItemButton>Job Tickets</ListItemButton>
            <Divider />
            <ListItemButton>Paper Voucher</ListItemButton>
            <Divider />
            <ListItemButton>PattyCash Voucher</ListItemButton>
            <Divider />
            <ListItemButton>Vat Invoice</ListItemButton>
            <Divider />
            <ListItemButton>Performa Invoice</ListItemButton>
            <Divider />
            <ListItemButton>Delivery Note</ListItemButton>
          </List>
        </Box>
      ) : (
        <Box>
          <List
            sx={{
              "& .MuiListItemButton-root": {
                border: "1px solid #c9a3c4",
                borderLeft: "4px solid #9c27b0",
                borderRadius: 1,
                mb: 1,
                p: 2,
                "&:hover": {
                  bgcolor: "#ead1e6",
                },
              },
            }}
          >
            <ListItemButton>Vat Invoice</ListItemButton>
            <ListItemButton>Performa Invoice</ListItemButton>
            <ListItemButton>Return Document</ListItemButton>
          </List>
        </Box>
      )}
    </Box>
  );
}
