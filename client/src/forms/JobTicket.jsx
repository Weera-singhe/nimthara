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

export default function JobTicket({ j }) {
  const jobfileTag = (i) => String(i || 0).padStart(5, "0");
  const inf = j?.job_info;
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
        <Box sx={{ flex: "0 0 30%", display: "flex", alignItems: "center" }}>
          <Typography variant="h4" sx={{ mx: 2 }}>
            Qty
          </Typography>
          <Typography variant="h6">
            {inf?.unit_count.toLocaleString()}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: "0 0 40%",
            bgcolor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" color="white" fontWeight="bold">
            JOB TICKET
          </Typography>
        </Box>
        <Box
          sx={{ flex: "0 0 30%", display: "flex", alignItems: "center", px: 5 }}
        >
          <Typography
            sx={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
            }}
          >
            {!!j?.file_id &&
              `#${jobfileTag(j?.file_id)}_${j?.job_code || j?.job_index}`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, border: "1px solid black", mx: 3, mb: 3 }} />
    </Box>
  );
}
