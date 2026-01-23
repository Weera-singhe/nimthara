import React, { useEffect, useState } from "react";
import Num from "../../helpers/Num";
import axios from "axios";
import {
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
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PAPERS_API_URL } from "../../api/urls";
import { handleApiError, onNUM, onSTR } from "../../helpers/HandleChange";
import MyFormBox from "../../helpers/MyFormBox";
import { toLKR } from "../../helpers/cal";

import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";

export default function PaperPrice({ user }) {
  const today_ = new Date()
    .toLocaleString("sv-SE", { timeZone: "Asia/Colombo" })
    .slice(0, 10);

  const navigate = useNavigate();

  const [form, setForm] = useState({ rec_at: today_ });
  const [paperList, setPaperList] = useState([]);
  const [priceLog, setPriceLog] = useState([]);
  const [DBLoading, SetDBLoading] = useState(true);

  const { bsns, id } = useParams();
  useEffect(() => {
    SetDBLoading(true);
    setForm({ rec_at: today_ });

    if (bsns !== "gts") {
      navigate("/papers/gts/price", { replace: true });
      return;
    }
    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        const paperList_ = res.data.papers;
        setPaperList(paperList_);

        const routeId = Number(id);
        paperList_.some((p) => p.id === routeId) &&
          setForm((p) => ({ ...p, id: routeId, rec_at: today_ }));

        res.data.success && SetDBLoading(false);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  useEffect(() => {
    console.log(priceLog);
  }, [priceLog]);

  const getPaper = (id) => {
    if (id == null) return undefined;
    return paperList.find((p) => p.id === Number(id));
  };

  const selectedPaper = getPaper(form?.id);

  useEffect(() => {
    SetDBLoading(true);
    const safeID = Number(id || 0);
    axios
      .get(`${PAPERS_API_URL}/gts/priceLog/${safeID}`)
      .then((res) => {
        if (res.data.success) {
          setPriceLog(res.data.priceLog || []);
          SetDBLoading(false);
        }
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, [id, navigate, bsns]);

  const changeSelect = (e) => {
    const nextId = Number(e.target.value);
    setForm((p) => ({ ...p, id: nextId }));
    navigate(`/papers/${bsns}/price/${nextId}`);
  };

  function SubmitLog() {
    SetDBLoading(true);

    axios
      .post(`${PAPERS_API_URL}/gts/price/rec`, form)
      .then((res) => {
        if (res.data.success) {
          setPriceLog(res.data.priceLog || []);
          setForm((p) => ({ ...p, price: 0 }));
        }
      })
      .catch(handleApiError)
      .finally(() => SetDBLoading(false));
  }

  const formIsFilled = form.rec_at <= today_ && form?.id && form?.price;

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
          navigate(`/papers/${v}/price${id ? "/" + id : ""}`);
        }}
        size="small"
        color="primary"
        sx={{ mb: 1 }}
      >
        <ToggleButton value={"gts"}>gts papers</ToggleButton>
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
        <Button startIcon={<AttachMoneyRoundedIcon />} variant="contained">
          Price
        </Button>
        <Button
          startIcon={<NotesRoundedIcon />}
          variant="outlined"
          component={Link}
          to={`/papers/${bsns}/log${id ? "/" + id : ""}`}
        >
          stock
        </Button>
      </Stack>
      <MyFormBox
        clickable={formIsFilled && user?.level_paper >= 1}
        user={user}
        onPress={SubmitLog}
      >
        <FormControl sx={{ minWidth: 230, maxWidth: "80%" }} size="small">
          <InputLabel>Paper</InputLabel>
          <Select
            name="id"
            value={form?.id || 0}
            label="Paper"
            onChange={changeSelect}
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
        <Num
          name="price"
          value={form?.price}
          onChange={onNUM(setForm)}
          label={`Price of ${selectedPaper?.unit_val || 1}`}
        />
        <TextField
          type="date"
          name="rec_at"
          value={form?.rec_at || ""}
          size="small"
          onChange={onSTR(setForm)}
        />
      </MyFormBox>
      <List>
        <ListSubheader
          sx={{
            border: "1px solid grey",
            borderRadius: 1,
            backgroundColor: "#e0f2e0ff",
            color: "black",
          }}
        >
          {selectedPaper?.display_as || "Select Paper"}
        </ListSubheader>

        {priceLog?.map((pl) => (
          <React.Fragment key={pl.price_rec}>
            <ListItem alignItems="center">
              <ListItemText primary={pl?.rec_at} />

              <Button>{toLKR(pl?.price)}</Button>
            </ListItem>

            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
