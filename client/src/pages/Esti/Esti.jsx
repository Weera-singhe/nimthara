import { ESTI_API_URL } from "../../api/urls";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toLKR, SumsOfQuot, SumEachRow, toDeci } from "../../helpers/cal";

import { onNUM_N, handleApiError, onSTR_N } from "../../helpers/HandleChange";

import Num from "../../helpers/Num";
import MyFormBox from "../../helpers/MyFormBox";
import {
  Backdrop,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EstiMid from "./EstiMid";

import deepEqual from "fast-deep-equal";

export default function Esti({ user }) {
  const navigate = useNavigate();
  const { linkid, linkat } = useParams();
  const [estiTemp, setEstiTemp] = useState([]);
  const [estiSaved, setEstiSaved] = useState([]);
  const [dbLoading, setDbloading] = useState(true);
  const [qtsComp, setQtsComp] = useState([]);

  const [allPapers, setAllPapers] = useState([]);
  const [profitMeth, setProfitMeth] = useState(1);

  const [calEsti, CalculatEsti] = useState();
  const [SavinglinkAt, setSavingLinkAt] = useState();

  useEffect(() => {
    axios
      .get(`${ESTI_API_URL}/${linkid}/${linkat}`)
      .then((res) => {
        // console.log(res.data);
        setEstiTemp(res.data.esti);
        setEstiSaved(res.data.esti);
        setQtsComp(res.data.qtsComps);
        setAllPapers(res.data.allPapers);
        //        console.log("resdata", res.data);
      })
      .catch(handleApiError)
      .finally(() => setDbloading(false));
  }, []);

  useEffect(() => {
    setSavingLinkAt(linkat);
  }, [linkat]);

  const onNUMData = onNUM_N(setEstiTemp, "data");
  const onNUMLoops = onNUM_N(setEstiTemp, "loops");
  const onNUMV = onNUM_N(setEstiTemp, "vals");
  const onStrRename = onSTR_N(setEstiTemp, "renames");

  const isSame = deepEqual(estiTemp, estiSaved) && linkat === SavinglinkAt;

  function SubmitSave() {
    setDbloading(true);

    axios
      .post(`${ESTI_API_URL}/${linkid}/${SavinglinkAt}`, estiTemp)
      .then((res) => {
        if (res.data.success) {
          setEstiSaved(res.data?.esti || {});
          setEstiTemp(res.data?.esti || {});
          navigate(`/esti/${linkid}/${SavinglinkAt}`);
        }
      })
      .catch(handleApiError)
      .finally(() => setDbloading(false));
  }

  useEffect(() => {
    // console.log("temp", estiTemp);

    CalculatEsti(() => SumsOfQuot(qtsComp, estiTemp));
  }, [estiTemp]);

  return (
    <>
      <Backdrop sx={{ color: "#fff", zIndex: 10 }} open={dbLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyFormBox
        label={linkid}
        clickable={!isSame}
        onPress={SubmitSave}
        user={user}
      >
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <Num
            width={120}
            label="Unit Count"
            min={1}
            onChange={onNUMData}
            name="units"
            value={estiTemp?.data?.units}
          />{" "}
          <Num
            width={120}
            label="Item Count"
            min={1}
            onChange={onNUMData}
            name="items"
            value={estiTemp?.data?.items}
          />
        </Stack>
        <Box sx={{ width: "100%" }}></Box>

        <Stack direction="row" flexWrap="wrap" gap={2}>
          {qtsComp.map((c) => (
            <Num
              key={c?.id}
              label={c?.name}
              name={c?.name}
              value={estiTemp?.loops?.[c?.name]}
              onChange={onNUMLoops}
              width={100}
              deci={0}
              max={c?.max}
              def={c?.def_loop_count}
            />
          ))}
        </Stack>
        <Box sx={{ width: "100%" }}></Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {qtsComp.map((c) => {
                const count = estiTemp?.loops?.[c?.name] ?? 0;

                return Array.from({ length: count }).map((_, i) => {
                  const name = `${c?.name}_${i}`;
                  const { calResult, isBelowMin } = SumEachRow(
                    name,
                    estiTemp?.vals,
                    c?.name,
                    c?.min_cal_res
                  );

                  return (
                    <TableRow key={`${c.id}-${i}`}>
                      {c?.name === "Other" ? (
                        <TableCell sx={{ p: 0, width: 60 }}>
                          <TextField
                            size="small"
                            sx={{ width: "100%" }}
                            name={c?.name + "_" + i}
                            value={estiTemp?.renames?.[c?.name + "_" + i]}
                            onChange={onStrRename}
                          />
                        </TableCell>
                      ) : (
                        <TableCell sx={{ width: 60 }}> {c?.name}</TableCell>
                      )}

                      <TableCell sx={{ backgroundColor: "#f1f8e9" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EstiMid
                            name={`${c?.name}_${i}`}
                            changed={onNUMV}
                            v={estiTemp?.vals}
                            compID={c?.name}
                            allPapers={allPapers}
                          />
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <span style={{ color: isBelowMin ? "red" : "black" }}>
                          {toLKR(calResult)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ width: "100%" }}></Box>

        <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
          <Typography>
            Total Cost: {toLKR(calEsti?.the_sum)} <b> + </b>
          </Typography>
          <Stack direction="row" alignItems="center">
            {profitMeth ? (
              <Num
                label="Profit"
                onChange={onNUMData}
                name="profit"
                value={estiTemp?.data?.profit}
              />
            ) : (
              <Typography sx={{ width: 100 }} color="success">
                {toDeci(estiTemp?.data?.profit)}
              </Typography>
            )}

            <Switch
              color="default"
              onChange={() => setProfitMeth((p) => (p === 1 ? 0 : 1))}
            />
            {profitMeth ? (
              <Typography sx={{ width: 100 }} color="success">
                {toDeci((estiTemp?.data?.profit / calEsti?.the_sum) * 100)}
              </Typography>
            ) : (
              <Num
                label="%"
                value={(estiTemp?.data?.profit / calEsti?.the_sum) * 100}
                onChange={(e) => {
                  const percent = Number(e.target.value);
                  const profit = (calEsti?.the_sum / 100) * percent;
                  onNUMData({
                    target: {
                      name: "profit",
                      value: profit,
                    },
                  });
                }}
              />
            )}
          </Stack>
          <Typography>
            <b>=</b> {toLKR(calEsti?.total_price)}
          </Typography>
        </Stack>

        <Box sx={{ width: "100%" }}></Box>
        <Box sx={{ width: "100%" }}></Box>
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
                <TableCell>{calEsti?.unit_count || 1}</TableCell>
                <TableCell align="right">
                  {toLKR(calEsti?.total_price)}
                </TableCell>
                <TableCell align="right">{toLKR(calEsti?.total_vat)}</TableCell>
                <TableCell align="right">
                  {toLKR(calEsti?.total_vat_)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell align="right">
                  {toLKR(calEsti?.unit_price)}
                </TableCell>
                <TableCell align="right">{toLKR(calEsti?.unit_vat)}</TableCell>
                <TableCell align="right">{toLKR(calEsti?.unit_vat_)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ width: "100%" }}></Box>
        <select
          defaultValue={linkat}
          onChange={(e) => setSavingLinkAt(e.target.value)}
        >
          <option value="jobs_pre">jobs_pre</option>
          <option value="jobs_past">jobs_past</option>
          <option value="jobs_ext">jobs_ext</option>
        </select>
      </MyFormBox>
    </>
  );
}
