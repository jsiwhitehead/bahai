import { resolve } from "reactivejs";

import { isObject, mapObject, toNumber } from "./utils";

const toTruthy = (v) =>
  [null, undefined, false, ""].includes(v) ? "" : "true";

const reactiveFunc = (func) => {
  Object.assign(func, { reactiveFunc: true });
  return func;
};

const createBlock = (value, other?) => {
  if (Array.isArray(value)) {
    return { type: "block", items: value, values: other || {}, functions: [] };
  }
  return { type: "block", items: other || [], values: value, functions: [] };
};

const testMatch = ($value, pattern) => {
  if (!pattern) return false;
  if (pattern.type === "variable") return { [pattern.value]: $value || "" };
  const value = resolve($value);
  if (pattern.type === "value") return pattern.value === value && {};
  if (!isObject(value)) return false;
  const spreads = pattern.items.filter((p) => p.type === "spread");
  const length = pattern.items.filter((p) => p.type !== "spread").length;
  const matches = [
    ...Array.from({ length }).map((_, i) =>
      testMatch(value.items[i], pattern.items[i])
    ),
    ...Object.keys(pattern.values).map((key) =>
      testMatch(value.values[key], pattern.values[key])
    ),
  ];
  if (spreads.length === 0) {
    return (
      matches.every((x) => x) &&
      matches.reduce((res, x) => ({ ...res, ...x }), {})
    );
  }
  const otherItems = value.items.slice(length);
  const otherValues = Object.keys(value.values).reduce(
    (res, k) => (pattern.values[k] ? res : { ...res, [k]: value.values[k] }),
    {}
  );
  const [primary, partial] = spreads[0].partial ? spreads.reverse() : spreads;
  return (
    matches.every((x) => x) &&
    matches.reduce((res, x) => ({ ...res, ...x }), {
      [primary.value.value]: createBlock(otherItems, !partial && otherValues),
      ...(partial ? { [partial.value.value]: createBlock(otherValues) } : {}),
    })
  );
};
const apply = reactiveFunc(($map, $arg, $optional) => {
  const map = resolve($map);
  if (!toTruthy(map) && resolve($optional)) return "";
  if (typeof map === "function") {
    return map.reactiveFunc ? map($arg) : map(resolve($arg, true));
  }
  if (Array.isArray(map)) {
    const arg = resolve($arg);
    if (typeof arg === "number" && arg >= 1 && arg <= map.length) {
      return map[arg - 1];
    }
  }
  if (typeof map === "object" && map !== null) {
    if (map.type !== "block") {
      const arg = resolve($arg);
      if (
        (typeof arg === "number" || typeof arg === "string") &&
        `${arg}` in map
      ) {
        return map[arg];
      }
    }
    if (Object.keys(map.values).length > 0 || map.items.length > 0) {
      const arg = resolve($arg);
      if (
        (typeof arg === "number" || typeof arg === "string") &&
        `${arg}` in map.values
      ) {
        return map.values[arg];
      }
      if (typeof arg === "number" && arg >= 1 && arg <= map.items.length) {
        return map.items[arg - 1];
      }
    }
    const funcs = resolve(map.functions, true);
    for (const f of funcs) {
      const match = testMatch($arg, f.pattern);
      if (match) return f.run(...f.variables.map((k) => match[k]));
    }
  }
  return "";
});

const mapBlock = (block, func) =>
  createBlock(block.items.map(func), mapObject(block.values, func));

const map = reactiveFunc(($block) =>
  reactiveFunc(($map) => mapBlock(resolve($block), ($v) => apply($map, $v)))
);
const mapi = reactiveFunc(($block) =>
  reactiveFunc(($map) =>
    mapBlock(resolve($block), ($v, k) =>
      apply($map, createBlock([$v, typeof k === "string" ? k : k + 1]))
    )
  )
);
const some = reactiveFunc(($block) =>
  reactiveFunc(($test) => {
    const { items, values } = resolve($block);
    return toTruthy(
      items.some(($v) => resolve(apply($test, $v))) ||
        Object.keys(values).some((k) => resolve(apply($test, values[k])))
    );
  })
);
const every = reactiveFunc(($block) =>
  reactiveFunc(($test) => {
    const { items, values } = resolve($block);
    return toTruthy(
      items.every(($v) => resolve(apply($test, $v))) &&
        Object.keys(values).every((k) => resolve(apply($test, values[k])))
    );
  })
);

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
const operation = reactiveFunc(($op, ...$args) => {
  const op = resolve($op);
  if (["<=", ">=", "<", ">", "+", "-", "*", "/", "%", "^"].includes(op)) {
    const values = $args.map(($a) => toNumber(resolve($a)));
    if (values.some((v) => v === null)) return "";
    if (values.length === 1 && op === "-") return -values[0]!;
    if (["<=", ">=", "<", ">"].includes(op)) {
      return toTruthy(operationMaps[op](...values));
    }
    return operationMaps[op](...values);
  }
  if (["!", "="].includes(op)) {
    const values = $args.map(($a) => resolve($a, true));
    if (values.length === 1 && op === "!") {
      return toTruthy(values[0]) ? "" : "true";
    }
    return toTruthy(operationMaps[op](...values));
  }
  if (op === "?") {
    return toTruthy(resolve($args[0])) ? $args[1] : $args[2];
  }
  if (op === "&") {
    return toTruthy(resolve($args[0])) ? $args[1] : $args[0];
  }
  if (op === "|") {
    return toTruthy(resolve($args[0])) ? $args[0] : $args[1];
  }
});

export default { apply, operation, map, mapi, some, every };
