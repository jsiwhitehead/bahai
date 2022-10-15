import { resolve } from "reactivejs";

const reactiveFunc = (func) => {
  Object.assign(func, { reactiveFunc: true });
  return func;
};

const testMatch = (value, pattern) => {
  if (!pattern) return false;
  if (pattern.type === "variable") return { [pattern.value]: value || "" };
  const value1 = resolve(value);
  if (pattern.type === "value") return pattern.value === value1 && {};
  if (value1 == null || typeof value1 !== "object") return false;
  const last = pattern.items[pattern.items.length - 1];
  const secondLast = pattern.items[pattern.items.length - 2];
  const length = pattern.items.filter((p) => p.type !== "spread").length;
  const matches = [
    ...Array.from({ length }).map((_, i) =>
      testMatch(value1.items[i], pattern.items[i])
    ),
    ...Object.keys(pattern.values).map((key) =>
      testMatch(value1.values[key], pattern.values[key])
    ),
  ];
  if (last.type !== "spread") {
    return (
      matches.every((x) => x) &&
      matches.reduce((res, x) => ({ ...res, ...x }), {})
    );
  }
  const otherItems = value1.items.slice(length);
  const otherValues = Object.keys(value1.values).reduce(
    (res, k) => (pattern.values[k] ? res : { ...res, [k]: value1.values[k] }),
    {}
  );
  return (
    matches.every((x) => x) &&
    matches.reduce((res, x) => ({ ...res, ...x }), {
      [last.value.value]: {
        type: "block",
        items: secondLast?.type !== "spread" || !last.partial ? otherItems : [],
        values:
          secondLast?.type !== "spread" || last.partial ? otherValues : {},
      },
      ...(secondLast?.type === "spread"
        ? {
            [secondLast.value.value]: {
              type: "block",
              items: !secondLast.partial ? otherItems : [],
              values: secondLast.partial ? otherValues : {},
            },
          }
        : {}),
    })
  );
};
const apply = reactiveFunc((map, input) => {
  const map1 = resolve(map);
  if (typeof map1 === "function") {
    return map1.reactiveFunc ? map1(input) : map1(resolve(input, true));
  }
  if (Object.keys(map1.values).length > 0 || map1.items.length > 0) {
    const input1 = resolve(input);
    if (
      (typeof input1 === "number" || typeof input1 === "string") &&
      `${input1}` in map1.values
    ) {
      return map1.values[input1];
    }
    if (
      typeof input1 === "number" &&
      input1 >= 1 &&
      input1 <= map1.items.length
    ) {
      return map1.items[input1 - 1];
    }
  }
  const funcs = resolve(map1.functions, true);
  if (funcs?.length > 0) {
    for (const f of funcs) {
      const match = testMatch(input, f.pattern);
      if (match) return f.run(...f.variables.map((k) => match[k]));
    }
  }
  return "";
});
const map = reactiveFunc((x) =>
  reactiveFunc((y) => {
    const x1 = resolve(x);
    return {
      type: "block",
      items: x1.items.map((v) => apply(y, v)),
      values: Object.keys(x1.values).reduce(
        (res, k) => ({ ...res, [k]: apply(y, x1.values[k]) }),
        {}
      ),
      functions: [],
    };
  })
);
const mapi = reactiveFunc((x) =>
  reactiveFunc((y) => {
    const x1 = resolve(x);
    return {
      type: "block",
      items: x1.items.map((v, i) =>
        apply(y, {
          type: "block",
          items: [v, i + 1],
          values: {},
          functions: [],
        })
      ),
      values: Object.keys(x1.values).reduce(
        (res, k) => ({
          ...res,
          [k]: apply(y, {
            type: "block",
            items: [x1.values[k], k],
            values: {},
            functions: [],
          }),
        }),
        {}
      ),
      functions: [],
    };
  })
);
const some = reactiveFunc((x) =>
  reactiveFunc((y) => {
    const x1 = resolve(x);
    return (
      x1.items.some((v) => resolve(apply(y, v))) ||
      Object.keys(x1.values).some((k) => resolve(apply(y, x1.values[k])))
    );
  })
);

const toTruthy = (v) => ([null, undefined, false, ""].includes(v) ? "" : true);
const toNumber = (v: string) => {
  const n = parseFloat(v);
  return !isNaN(v as any) && !isNaN(n) ? n : null;
};
const operationMaps = {
  "<=": (a, b) => a <= b,
  ">=": (a, b) => a >= b,
  "<": (a, b) => a < b,
  ">": (a, b) => a > b,
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => ((((a - 1) % b) + b) % b) + 1,
  "^": (a, b) => a ** b,
  "!": (a, b) => a !== b,
  "=": (a, b) => a === b,
};
const operation = reactiveFunc((operation, ...args) => {
  const op = resolve(operation);
  if (["<=", ">=", "<", ">", "+", "-", "*", "/", "%", "^"].includes(op)) {
    const values = args.map((a) => toNumber(resolve(a)));
    if (values.some((v) => v === null)) return "";
    if (values.length === 1 && op === "-") return -values[0]!;
    if (["<=", ">=", "<", ">"].includes(op)) {
      return toTruthy(operationMaps[op](...values));
    }
    return operationMaps[op](...values);
  }
  if (["!", "="].includes(op)) {
    const values = args.map((a) => resolve(a, true));
    if (values.length === 1 && op === "!") {
      return toTruthy(!toTruthy(values[0]));
    }
    return toTruthy(operationMaps[op](...values));
  }
  if (op === "?") {
    const test = resolve(args[0]);
    return toTruthy(test) ? args[1] : args[2];
  }
  if (op === "&") {
    const test = resolve(args[0]);
    return toTruthy(test) ? args[1] : args[0];
  }
  if (op === "|") {
    const test = resolve(args[0]);
    return toTruthy(test) ? args[0] : args[1];
  }
});

export default { apply, map, mapi, some, operation };
