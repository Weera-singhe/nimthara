import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { fixNum } from "./cal";

export default function Num({
  name: name_,
  onChange: onChange_,
  value: value_,
  min: min_ = 0,
  max: max_ = Infinity,
  width: wid = 100,
  deci = 2,
  label: lbl,
  commas = true,
  color,
  def,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [fixedV, setFixedV] = useState(value_ ?? 0);
  const [userV, setUserV] = useState(value_ ?? 0);
  const [fixedStrV, setFixedStrV] = useState(
    commas ? (value_ || 0).toLocaleString() : String(value_ || 0),
  );

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setUserV(fixedV);
  };

  function changedByTyping(e) {
    const raw = e.target.value;
    const fixed = fixNum(raw, min_, max_, deci);
    const fixedStr = commas
      ? (fixed || 0).toLocaleString()
      : String(fixed || 0);

    setUserV(raw);
    setFixedV(fixed);
    setFixedStrV(fixedStr);

    if (onChange_) {
      onChange_({ target: { name: name_, value: fixed } });
    }
  }

  useEffect(() => {
    const val_ = value_ === undefined || value_ === null ? def : value_;
    if (val_ !== fixedV) {
      changedByTyping({ target: { value: val_ } });
    }
  }, [value_]);

  return (
    <div>
      <TextField
        variant="outlined"
        onMouseDown={handleOpen}
        sx={{ width: wid, backgroundColor: open ? "#f5ffffff" : "white" }}
        size="small"
        label={lbl}
        InputProps={{
          readOnly: true,
          sx: { color },
        }}
        value={fixedStrV}
        name={name_}
      />

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: 1 }}
      >
        <ClickAwayListener mouseEvent="onMouseDown" onClickAway={handleClose}>
          <Paper>
            <TextField
              type="number"
              autoFocus
              onFocus={(e) => requestAnimationFrame(() => e.target.select())}
              size="small"
              onChange={changedByTyping}
              value={userV || ""}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
}
