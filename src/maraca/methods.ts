import { reactiveFunc, resolve } from "reactivejs";

import { mapObject, toNumber } from "./utils";

const toTruthy = reactiveFunc((v) =>
  [null, undefined, false, ""].includes(resolve(v)) ? "" : "true"
);

export const createBlock = (value, other?) => {
  if (Array.isArray(value)) {
    return { type: "block", items: value, values: other || {} };
  }
  if (value.type === "block") return value;
  return { type: "block", items: other || [], values: value };
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const testMatch = ($value, pattern) => {
  if (!pattern) return false;
  if (pattern.type === "variable") return { [pattern.value]: $value || "" };
  const value = resolve($value);
  if (pattern.type === "value") return pattern.value === value && {};
  if (pattern.type === "string") {
    if (pattern.parts.length === 1) return pattern.parts[0] === value && {};
    const match = value.match(
      new RegExp(
        `^${pattern.parts
          .map((p) => (typeof p === "string" ? escapeRegex(p) : "(.*)"))
          .join("")}$`
      )
    );
    if (!match) return false;
    const matches = pattern.parts
      .filter((p) => typeof p !== "string")
      .map((p, i) => testMatch(match[i + 1], p));
    return (
      matches.every((x) => x) &&
      matches.reduce((res, x) => ({ ...res, ...x }), {})
    );
  }
  if (value === null || typeof value !== "object") return false;
  const spreads = pattern.items.filter((p) => p.type === "spread");
  const length = pattern.items.filter((p) => p.type !== "spread").length;
  const { items, values } = createBlock(value);
  if (spreads.length === 0) {
    if (items.length !== pattern.items.length) return false;
  }
  const matches = [
    ...new Array(length)
      .fill(0)
      .map((_, i) => testMatch(items[i], pattern.items[i])),
    ...Object.keys(pattern.values).map((key) =>
      testMatch(values[key], pattern.values[key])
    ),
  ];
  if (spreads.length === 0) {
    return (
      matches.every((x) => x) &&
      matches.reduce((res, x) => ({ ...res, ...x }), {})
    );
  }
  const otherItems = items.slice(length);
  const otherValues = Object.keys(values).reduce(
    (res, k) => (pattern.values[k] ? res : { ...res, [k]: values[k] }),
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

const argInArray = (map, arg) =>
  typeof arg === "number" && arg >= 1 && arg <= map.length;
const argInObject = (map, arg) =>
  (typeof arg === "number" || typeof arg === "string") && `${arg}` in map;

const applyOne = ($map, $arg, $optional = false) => {
  const map = resolve($map);
  if (!toTruthy(map) && resolve($optional)) return "";
  if (typeof map === "function") {
    return map.reactiveFunc ? map($arg) : map(resolve($arg, true));
  }
  if (Array.isArray(map)) {
    const arg = resolve($arg);
    return argInArray(map, arg) ? map[arg - 1] : "";
  }
  if (typeof map === "object" && map !== null) {
    if (map.type !== "block") {
      const arg = resolve($arg);
      return argInObject(map, arg) ? map[arg] : "";
    }
    if (Object.keys(map.values).length > 0 || map.items.length > 0) {
      const arg = resolve($arg);
      if (arg !== "") {
        if (argInObject(map.values, arg)) return map.values[arg];
        if (argInArray(map.items, arg)) return map.items[arg - 1];
      }
    }
    const funcs = resolve(map.functions || [], true);
    for (const f of funcs) {
      const match = f.pattern ? testMatch($arg, f.pattern) : {};
      if (
        match &&
        (!f.test ||
          toTruthy(
            resolve(f.test(...(f.variables || []).map((k) => match[k])))
          ))
      ) {
        return f.run(
          ...(f.variables || []).map((k) =>
            f.run.reactiveFunc ? match[k] : resolve(match[k], true)
          )
        );
      }
    }
    const arg = resolve($arg);
    if (arg === "" && map.values[""]) return map.values[""];
  }
  return "";
};

const getArgs = ($map, $complete, $args) => {
  if (resolve($complete)) {
    const funcs = resolve(resolve($map).functions) || [];
    if (funcs.length > 0) {
      const count = resolve(resolve(funcs[0]).count);
      return new Array(count).fill(0).map((_, i) => $args[i] || "");
    }
  }
  return $args;
};
const apply = reactiveFunc(($map, $complete, $optional, ...$args) => {
  const map = resolve($map);
  if (typeof map === "function") {
    const args = map.reactiveFunc
      ? $args
      : $args.map(($arg) => resolve($arg, true));
    if (resolve($complete) || args.length >= map.length) return map(...args);
    const result = Object.assign((...otherArgs) => map(...args, ...otherArgs), {
      reactiveFunc: map.reactiveFunc,
    });
    Object.defineProperty(result, "length", {
      value: map.length - args.length,
    });
    return result;
  }
  return [$map, ...getArgs($map, $complete, $args)].reduce(($a, $b) =>
    applyOne($a, $b, $optional)
  );
});

const mapBlock = (block, func) =>
  createBlock(
    block.items.map((v, i) => func(v, i + 1)),
    mapObject(block.values, func)
  );
const map = reactiveFunc(($block, $map) =>
  mapBlock(createBlock(resolve($block)), ($v, k) =>
    apply($map, true, false, $v, k)
  )
);

const filterObject = (obj, map) =>
  Object.keys(obj).reduce(
    (res, k) => (map(obj[k], k) ? { ...res, [k]: obj[k] } : res),
    {}
  );
const filterBlock = (block, func) =>
  createBlock(
    block.items.filter((v, i) => func(v, i)),
    filterObject(block.values, func)
  );
const filter = reactiveFunc(($block, $map = reactiveFunc((x) => x)) =>
  filterBlock(createBlock(resolve($block)), ($v, k) =>
    toTruthy(resolve(apply($map, true, false, $v, k)))
  )
);

const includes = reactiveFunc(($block, $value) => {
  const { items, values } = createBlock(resolve($block, true));
  const value = resolve($value, true);
  return toTruthy(
    items.includes(value) ||
      Object.keys(values).find((k) => values[k] === value)
  );
});

const some = reactiveFunc(($block, $test) => {
  const { items, values } = createBlock(resolve($block));
  return toTruthy(
    items.some(($v, i) => resolve(apply($test, true, false, $v, i + 1))) ||
      Object.keys(values).some((k) =>
        resolve(apply($test, true, false, values[k], k))
      )
  );
});
const every = reactiveFunc(($block, $test) => {
  const { items, values } = createBlock(resolve($block));
  return toTruthy(
    items.every(($v, i) => resolve(apply($test, true, false, $v, i + 1))) &&
      Object.keys(values).every((k) =>
        resolve(apply($test, true, false, values[k], k))
      )
  );
});

const numericOperators = {
  "<=": (a, b) => a <= b,
  ">=": (a, b) => a >= b,
  "<": (a, b) => a < b,
  ">": (a, b) => a > b,
  "..": (a, b) => ({
    type: "block",
    items: new Array(b - a + 1).fill(0).map((_, i) => i + a),
    values: {},
  }),
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => ((((a - 1) % b) + b) % b) + 1,
  "^": (a, b) => a ** b,
};
const otherOperators = {
  "!": (a, b) => a !== b,
  "=": (a, b) => a === b,
};
const operation = reactiveFunc(($op, ...$args) => {
  const op = resolve($op);
  if (numericOperators[op]) {
    const values = $args.map(($a) => toNumber(resolve($a)));
    if (values.some((v) => v === null)) return "";
    if (values.length === 1) {
      return op === "-" ? -values[0]! : values[0];
    }
    if (["<=", ">=", "<", ">"].includes(op)) {
      return toTruthy(numericOperators[op](...values));
    }
    return numericOperators[op](...values);
  }
  if (otherOperators[op]) {
    const values = $args.map(($a) => resolve($a, true));
    if (values.length === 1 && op === "!") {
      return toTruthy(values[0]) ? "" : "true";
    }
    return toTruthy(otherOperators[op](...values));
  }
  if (op === "&") {
    return toTruthy(resolve($args[0])) ? $args[1] : $args[0];
  }
  if (op === "|") {
    return toTruthy(resolve($args[0])) ? $args[0] : $args[1];
  }
});

export default {
  apply,
  operation,
  toTruthy,
  map,
  filter,
  includes,
  some,
  every,
};
