export function SumEachRow(name, v, compID, min_cal_res) {
  const val = (key) => Number(v?.[`${name}_${key}`]) || 0;
  let calResult = 0;

  switch (compID) {
    case "Artwork":
    case "Delivery":
      calResult = val(0);
      break;

    case "Plates":
      calResult = val(0) * val(1) * val(2) * val(3);
      break;

    case "Paper":
      const p_price = val(1) / val(2);
      const p_qty = Math.ceil((val(3) * val(7)) / val(4));
      const p_qtyExta = Math.ceil(val(5) / val(6));
      calResult = p_price * (p_qty + p_qtyExta);
      break;

    case "Print":
      const imp = (val(0) / val(1)) * val(2) * val(4);
      calResult = imp < min_cal_res ? min_cal_res * val(3) : imp * val(3);
      break;

    case "Cutting":
    case "Padding":
      calResult = val(0) * val(1);
      break;

    case "Perforation":
    case "Numbering":
      calResult = val(0) + val(1) * val(2);
      break;

    case "Other":
      calResult = (val(0) * val(2) * val(4) * val(5)) / val(1) / val(3);
      break;

    default:
      calResult = 0;
  }

  const isBelowMin =
    compID === "Print"
      ? calResult <= min_cal_res * val(3)
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
  const vatRate = 0.18;
  const ssclRate = 0.025;

  return {
    id_each: data.id_each,
    the_sum: total,
    unit_price: unit_price,
    total_price: safe_total,
    unit_vat: +(unit_price * vatRate).toFixed(2),
    total_vat: +(safe_total * vatRate).toFixed(2),
    unit_sscl: +(unit_price * ssclRate).toFixed(2),
    total_sscl: +(safe_total * ssclRate).toFixed(2),
    unit_vat_: +(unit_price * (1 + vatRate)).toFixed(2),
    total_vat_: +(safe_total * (1 + vatRate)).toFixed(2),
    unit_ssclvat_: +(unit_price * (1 + ssclRate + vatRate)).toFixed(2),
    total_ssclvat_: +(safe_total * (1 + ssclRate + vatRate)).toFixed(2),
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

export function fixNum(val, min, max, deci) {
  const num = Number(val) || 0;
  const limited = Math.min(Math.max(num, min), max);
  const decii = 10 ** deci;
  return Math.round(limited * decii) / decii;
}

//////////////////////////////////

export function SumsOfQuot(components, data) {
  let total = 0;

  for (const comp of components) {
    const count = data.esti_loops?.[comp.name] || 0;

    for (let i = 0; i < count; i++) {
      const name = `${comp.name}_${i}`;
      const { calResult } = SumEachRow(
        name,
        data.esti_vals,
        comp.name,
        comp.min_cal_res
      );
      total += calResult;
    }
  }

  const unitCount = data?.esti_data?.units || 1;
  const profit = data?.esti_data?.profit || 0;
  const base = total + profit;

  const unit_price = +(base / unitCount).toFixed(2);
  const safe_total = +(unit_price * unitCount).toFixed(2);
  const vatRate = 0.18;
  //const ssclRate = 0.025;

  return {
    //id_each: data.id_each,
    unit_count: unitCount,
    the_sum: total,
    unit_price: unit_price,
    total_price: safe_total,
    unit_vat: +(unit_price * vatRate).toFixed(2),
    total_vat: +(safe_total * vatRate).toFixed(2),
    // unit_sscl: +(unit_price * ssclRate).toFixed(2),
    // total_sscl: +(safe_total * ssclRate).toFixed(2),
    unit_vat_: +(unit_price * (1 + vatRate)).toFixed(2),
    total_vat_: +(safe_total * (1 + vatRate)).toFixed(2),
    //unit_ssclvat_: +(unit_price * (1 + ssclRate + vatRate)).toFixed(2),
    //total_ssclvat_: +(safe_total * (1 + ssclRate + vatRate)).toFixed(2),
  };
}
