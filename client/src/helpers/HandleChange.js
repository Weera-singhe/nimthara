export const cleanStr = (v = "") =>
  v.replace(/^\s+/, "").replace(/\s{2,}/g, " ");

export const onSTR = (set) => (e) => {
  const { name, value } = e.target;
  set((prev) => ({ ...prev, [name]: cleanStr(value) }));
};
export const onSTRCode = (set) => (e) => {
  const { name, value } = e.target;

  const cleaned = (value || "")
    .replace(/^\s+/, "")
    .replace(/[^a-zA-Z0-9_]/g, "");

  const val = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  set((prev) => ({ ...prev, [name]: val }));
};

export const onSTR_N = (set, parentKey) => (e) => {
  const { name, value } = e.target;
  set((prev) => ({
    ...prev,
    [parentKey]: {
      ...(prev[parentKey] || {}),
      [name]: cleanStr(value),
    },
  }));
};

export const onSTR_NN = (set, parentKey, i) => (e) => {
  const { name, value } = e.target;
  const key = String(i);
  const cleaned = cleanStr(value);

  set((prev) => {
    const safePrev = prev ?? {}; // ✅ handle null
    const parent = safePrev[parentKey] ?? {}; // ✅ handle null/undefined
    const row = { ...(parent[key] ?? {}) };

    if (!cleaned) {
      delete row[name];
    } else {
      row[name] = cleaned;
    }

    return {
      ...prev,
      [parentKey]: {
        ...parent,
        [key]: row,
      },
    };
  });
};

export const onNUM = (set) => (e) => {
  const { name, value } = e.target;
  set((prev) => ({ ...prev, [name]: Number(value) }));
};

export const onNUM_N = (set, parentKey) => (e) => {
  const { name, value } = e.target;
  set((prev) => ({
    ...prev,
    [parentKey]: {
      ...(prev[parentKey] || {}),
      [name]: Number(value),
    },
  }));
};
export const onNUM_NN = (set, parentKey, i) => (e) => {
  const { name, value } = e.target;
  const key = String(i);
  const cleaned = Number(value);

  set((prev) => {
    const safePrev = prev ?? {}; // ✅ handle null
    const parent = safePrev[parentKey] ?? {}; // ✅ handle null/undefined
    const row = { ...(parent[key] ?? {}) };

    if (!cleaned) {
      delete row[name];
    } else {
      row[name] = cleaned;
    }

    return {
      ...prev,
      [parentKey]: {
        ...parent,
        [key]: row,
      },
    };
  });
};

export const handleApiError = (err) => {
  const msg =
    err?.response?.data?.message || err?.message || "Something went wrong";

  console.error("Error:", msg);
  alert(msg);
};
