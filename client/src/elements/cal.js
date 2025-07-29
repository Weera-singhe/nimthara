export function EachRowTotal(name, v, compID, min_cal_res) {
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
      const div1 = val(1) / (val(2) || 1);
      const inner = Math.ceil(
        (val(3) * val(7)) / (val(4) || 1) + val(5) / (val(6) || 1)
      );
      calResult = div1 * inner;
      break;

    case "Print":
      const imp = (val(0) / (val(1) || 1)) * val(2) * val(4);
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
      calResult =
        (val(0) * val(2) * val(4) * val(5)) / (val(1) || 1) / (val(3) || 1);
      break;

    default:
      calResult = 0;
  }

  const isBelowMin = calResult <= min_cal_res;
  return { calResult, isBelowMin };
}

export function SumEachRowTotal(components, v, loop_count) {
  let total = 0;

  for (const comp of components) {
    const count = loop_count?.[comp.name] || 0;

    for (let i = 0; i < count; i++) {
      const name = `${comp.name}_${i}`;
      const { calResult } = EachRowTotal(name, v, comp.name, comp.min_cal_res);
      total += calResult;
    }
  }

  return total;
}
export function toLKR(value) {
  return (value || 0).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  });
}
