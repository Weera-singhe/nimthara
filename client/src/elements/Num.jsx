import React, { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
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
  def,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [fixedV, setFixedV] = useState(value_ ?? 0);
  const [userV, setUserV] = useState(value_ ?? 0);
  const [fixedStrV, setFixedStrV] = useState(
    commas ? (value_ || 0).toLocaleString() : String(value_ || 0)
  );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setUserV(fixedV);
  };

  function changedByTyping(e) {
    //console.log("user typed start num");
    const raw = e.target.value;
    const fixed = fixNum(raw, min_, max_, deci);
    const fixedStr = commas
      ? (fixed || 0).toLocaleString()
      : String(fixed || 0);

    setUserV(raw);
    setFixedV(fixed);
    setFixedStrV(fixedStr);

    if (onChange_) {
      onChange_({
        target: { name: name_, value: fixed },
      });
    }

    //console.log("user typed end num");
  }

  useEffect(() => {
    const val_ = value_ === undefined || value_ === null ? def : value_;
    if (val_ !== fixedV) {
      //console.log("val changed num start");
      changedByTyping({ target: { value: val_ } });
      // console.log("val changed num end");
    }
  }, [value_]);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <TextField
        variant="outlined"
        aria-describedby={id}
        onClick={handleClick}
        sx={{ width: wid, backgroundColor: "white" }}
        size="small"
        label={lbl}
        InputProps={{
          readOnly: true,
        }}
        value={fixedStrV}
        name={name_}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <TextField
          type="number"
          autoFocus
          onFocus={(e) => e.target.select()}
          size="small"
          onChange={changedByTyping}
          value={userV || ""}
        />
      </Popover>
    </div>
  );
}
