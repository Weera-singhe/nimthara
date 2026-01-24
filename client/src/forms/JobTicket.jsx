import React, { useMemo } from "react";
import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { toDeci, toLKR } from "../helpers/cal";

export default function JobTicket({}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        // border: "1px solid black",
      }}
    >
      <Box
        sx={{
          flex: "0 0 5%",
          border: "1px solid black",
          mx: 3,
          mt: 3,
          display: "flex",
        }}
      >
        <Box sx={{ flex: "0 0 30%" }} />
        <Box
          sx={{
            flex: "0 0 40%",
            bgcolor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" color="white">
            JOB TICKET
          </Typography>
        </Box>
        <Box sx={{ flex: "0 0 30%" }} />
      </Box>

      <Box sx={{ flex: 1, border: "1px solid black", mx: 3, mb: 3 }} />
    </Box>
  );
}
