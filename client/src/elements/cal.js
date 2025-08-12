export function SumEachRow(name, v, compID, min_cal_res) {
  const val0 = (key) => Number(v?.[`${name}_${key}`]) || 0; ////unlikely of use ||0
  const val1 = (key) => Number(v?.[`${name}_${key}`]) || 1; ////unlikely of use ||1
  let calResult = 0;

  switch (compID) {
    case "Artwork":
    case "Delivery":
      calResult = val0(0);
      break;

    case "Plates":
      calResult = val0(0) * val1(1) * val1(2) * val1(3);
      break;

    case "Paper":
      const p_price = val0(1) / val1(2);
      const p_qty = Math.ceil((val0(3) * val1(7)) / val1(4));
      const p_qtyExta = Math.ceil(val0(5) / val1(6));
      calResult = p_price * (p_qty + p_qtyExta);
      break;

    case "Print":
      const imp = (val0(0) / val1(1)) * val1(2) * val1(4);
      calResult = imp < min_cal_res ? min_cal_res * val1(3) : imp * val1(3);
      break;

    case "Cutting":
    case "Padding":
      calResult = val0(0) * val1(1);
      break;

    case "Perforation":
    case "Numbering":
      calResult = val0(0) + val0(1) * val1(2);
      break;

    case "Other":
      calResult = (val0(0) * val1(2) * val1(4) * val1(5)) / val1(1) / val1(3);
      break;

    default:
      calResult = 0;
  }

  const isBelowMin =
    compID === "Print"
      ? calResult <= min_cal_res * val1(3)
      : calResult <= min_cal_res;
  return { calResult, isBelowMin };
}

export function SumsEachQuot(components, data) {
  let total = 0;

  for (const comp of components) {
    const count = data.loop_count?.[comp.name] || 0;

    for (let i = 0; i < count; i++) {
      const name = `${comp.name}_${i}`;
      const { calResult } = SumEachRow(
        name,
        data.v,
        comp.name,
        comp.min_cal_res
      );
      total += calResult;
    }
  }

  const unitCount = data.unit_count || 1;
  const profit = data.profit || 0;
  const base = total + profit;

  const unit_price = +(base / unitCount).toFixed(2);
  const safe_total = +(unit_price * unitCount).toFixed(2);
  const vatRate = 1.18;

  return {
    id_each: data.id_each,
    the_sum: total,
    unit_price: unit_price,
    total_price: safe_total,
    unit_vat: +(unit_price * vatRate).toFixed(2),
    total_vat: +(safe_total * vatRate).toFixed(2),
  };
}

export function toLKR(value) {
  return (value || 0).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  });
}
export function toDeci(value) {
  return (value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
