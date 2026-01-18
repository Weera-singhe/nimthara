// PurchaseOrder.jsx
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

export default function PurchaseOrder({ po, items = [] }) {
  const totals = useMemo(() => {
    const subTotal = items.reduce(
      (sum, item) =>
        sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0),
      0
    );
    const vat = Math.round(subTotal * 0.18 * 100) / 100;
    return { subTotal, vatAmount: vat, grandTotal: subTotal + vat };
  }, [items]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "white",
        color: "black",
        p: 1.5,
        boxSizing: "border-box",
        fontSize: 11,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16, lineHeight: 1.1 }}>
            PURCHASE ORDER
          </Typography>
          <Typography sx={{ fontSize: 11 }}>
            PO No: <b>{po?.number ?? "—"}</b>
          </Typography>
          <Typography sx={{ fontSize: 11 }}>
            Date: <b>{po?.date ?? "—"}</b>
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right", minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
            {po?.company?.name ?? "Company Name"}
          </Typography>
          <Typography sx={{ fontSize: 10, whiteSpace: "pre-line" }}>
            {po?.company?.address ?? ""}
          </Typography>
          {po?.company?.phone && (
            <Typography sx={{ fontSize: 10 }}>
              Tel: {po.company.phone}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Vendor / Ship To */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
        }}
      >
        <InfoBlock
          title="Vendor"
          lines={[
            po?.vendor?.name,
            po?.vendor?.address,
            po?.vendor?.phone ? `Tel: ${po.vendor.phone}` : null,
          ]}
        />
        <InfoBlock
          title="Ship To"
          lines={[
            po?.shipTo?.name ?? po?.company?.name,
            po?.shipTo?.address ?? po?.company?.address,
            po?.shipTo?.phone
              ? `Tel: ${po.shipTo.phone}`
              : po?.company?.phone
              ? `Tel: ${po.company.phone}`
              : null,
          ]}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Items */}
      <Box
        sx={{
          border: "1px solid #00000022",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Table size="small" sx={{ "& td, & th": { px: 0.75, py: 0.5 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#00000008" }}>
              <TableCell sx={{ fontWeight: 800, width: 28 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 800, width: 44 }} align="right">
                Qty
              </TableCell>
              <TableCell sx={{ fontWeight: 800, width: 76 }} align="right">
                Price
              </TableCell>
              <TableCell sx={{ fontWeight: 800, width: 86 }} align="right">
                Total
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography sx={{ fontSize: 11, opacity: 0.7 }}>
                    No items.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => {
                const qty = Number(item.qty) || 0;
                const unit = Number(item.unitPrice) || 0;
                const lineTotal = qty * unit;

                return (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell sx={{ pr: 0.5 }}>
                      <Typography
                        sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {item.name ?? "—"}
                      </Typography>
                      {(item.id || item.note) && (
                        <Typography sx={{ fontSize: 9.5, opacity: 0.75 }}>
                          {item.id ? `ID: ${item.id}` : ""}
                          {item.id && item.note ? " • " : ""}
                          {item.note ?? ""}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{qty}</TableCell>
                    <TableCell align="right">{toDeci(unit)}</TableCell>
                    <TableCell align="right">{toDeci(lineTotal)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Totals */}
      <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ width: 220 }}>
          <KV label="Sub Total" value={toLKR(totals.subTotal)} />
          <Divider sx={{ my: 0.5 }} />
          <KV label="+VAT" value={toLKR(totals.vatAmount)} />
          <Divider sx={{ my: 0.5 }} />
          <KV label="Grand Total" value={toLKR(totals.grandTotal)} bold />
        </Box>
      </Box>

      {/* Notes + Signature */}
      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 800 }}>Notes</Typography>
          <Typography sx={{ fontSize: 10.5, whiteSpace: "pre-line" }}>
            {po?.notes ?? "—"}
          </Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 800 }}>
            Authorized
          </Typography>
          <Typography sx={{ fontSize: 10.5 }}>
            By: <b>{po?.authorizedBy ?? "—"}</b>
          </Typography>

          <Typography sx={{ fontSize: 10.5, mt: 2, opacity: 0.8 }}>
            Signature
          </Typography>
          <Box sx={{ height: 34, borderBottom: "1px solid #000" }} />
          <Typography sx={{ fontSize: 10.5, mt: 1 }}>
            Date: ____________
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ fontSize: 9.5, mt: 1.2, opacity: 0.7 }}>
        This PO is valid only with authorized signature.
      </Typography>
    </Box>
  );
}

function InfoBlock({ title, lines = [] }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{title}</Typography>
      {lines.filter(Boolean).map((l, i) => (
        <Typography key={i} sx={{ fontSize: 10.5, whiteSpace: "pre-line" }}>
          {l}
        </Typography>
      ))}
    </Box>
  );
}

function KV({ label, value, bold }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.2 }}>
      <Typography sx={{ fontSize: 11, fontWeight: bold ? 900 : 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11, fontWeight: bold ? 900 : 700 }}>
        {value}
      </Typography>
    </Box>
  );
}
