import { ESTI_API_URL } from "../../api/urls";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toLKR, SumsOfQuot, SumEachRow, toDeci } from "../../elements/cal";

import { onNUM_N, handleApiError } from "../../elements/HandleChange";

import Num from "../../elements/Num";
import MyFormBox from "../../elements/MyFormBox";
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
  Typography,
} from "@mui/material";
import EstiMid from "./EstiMid";

import deepEqual from "fast-deep-equal";

export default function Esti({ user }) {
  const { linkid } = useParams();
  const navigate = useNavigate();
  const [estiTemp, setEstiTemp] = useState([]);
  const [estiSaved, setEstiSaved] = useState([]);
  const [dbLoading, setDbloading] = useState(true);
  const [qtsComp, setQtsComp] = useState([]);

  const [allPapers, setAllPapers] = useState([]);
  const [profitMeth, setProfitMeth] = useState(1);

  const [calEsti, CalculatEsti] = useState();
  const [current_linkid_End, setCurrentLinkidEnd] = useState();

  const linkid_End = linkid.slice(-3);
  const linkid_Face = linkid.slice(0, -3);

  useEffect(() => {
    axios
      .get(`${ESTI_API_URL}/${linkid}`)
      .then((res) => {
        console.log(res.data);
        setEstiTemp(res.data.esti);
        setEstiSaved(res.data.esti);
        setQtsComp(res.data.qtsComps);
        setAllPapers(res.data.allPapers);
        setCurrentLinkidEnd(linkid_End);
        //        console.log("resdata", res.data);
      })
      .catch(handleApiError)
      .finally(() => setDbloading(false));
  }, []);

  const onNUMData = onNUM_N(setEstiTemp, "data");
  const onNUMLoops = onNUM_N(setEstiTemp, "loops");
  const onNUMV = onNUM_N(setEstiTemp, "vals");

  const isSame =
    deepEqual(estiTemp, estiSaved) && linkid_End === current_linkid_End;

  function SubmitSave() {
    setDbloading(true);
    const savingLinkId = linkid_Face + current_linkid_End;
    const fullForm = { ...estiTemp, savingLinkId };

    axios
      .post(`${ESTI_API_URL}/save`, fullForm)
      .then((res) => {
        if (res.data.success) {
          setEstiSaved(res.data.esti);
          setEstiTemp(res.data.esti);
          navigate(`/esti/${savingLinkId}`);
        }
      })
      .catch(handleApiError)
      .finally(() => setDbloading(false));
  }

  useEffect(() => {
    //console.log("temp", estiTemp);

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
                      <TableCell>{c?.name}</TableCell>

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

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>
            Total Cost: {toLKR(calEsti?.the_sum)} <b> + </b>
          </Typography>
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
          defaultValue={linkid_End}
          onChange={(e) => setCurrentLinkidEnd(e.target.value)}
        >
          <option value="pre">pre</option>
          <option value="pst">pst</option>
          <option value="ext">ext</option>
        </select>
      </MyFormBox>
    </>
  );
}
