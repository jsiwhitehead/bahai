export const isObject = (x) =>
  Object.prototype.toString.call(x) === "[object Object]";

export const mapObject = (obj, map) =>
  Object.keys(obj).reduce((res, k) => ({ ...res, [k]: map(obj[k], k) }), {});

export const toNumber = (v) => {
  const n = parseFloat(v);
  return !isNaN(v as any) && !isNaN(n) ? n : null;
};
