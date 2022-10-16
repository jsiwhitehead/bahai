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
    return { type: "block", items: value, values: other || {} };
  }
  return { type: "block", items: other || [], values: value };
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
        return f.run(...(f.variables || []).map((k) => match[k]));
      }
    }
    const arg = resolve($arg);
    if (arg === "" && map.values[""]) return map.values[""];
  }
  return "";
};

const apply = reactiveFunc(($map, $complete, $optional, ...$args) => {
  if (resolve($complete)) {
    const funcs = resolve(resolve($map).functions) || [];
    if (funcs.length > 0) {
      const count = resolve(resolve(funcs[0]).count);
      const $fullArgs = Array.from({ length: count }).map(
        (_, i) => $args[i] || ""
      );
      return [$map, ...$fullArgs].reduce(($a, $b) =>
        applyOne($a, $b, $optional)
      );
    }
  }
  return [$map, ...$args].reduce(($a, $b) => applyOne($a, $b, $optional));
});

const mapBlock = (block, func) =>
  createBlock(block.items.map(func), mapObject(block.values, func));
const map = reactiveFunc(($block) =>
  reactiveFunc(($map) =>
    mapBlock(resolve($block), ($v, k) =>
      apply($map, true, false, $v, typeof k === "string" ? k : k + 1)
    )
  )
);

const some = reactiveFunc(($block) =>
  reactiveFunc(($test) => {
    const { items, values } = resolve($block);
    return toTruthy(
      items.some(($v, i) => resolve(apply($test, true, false, $v, i + 1))) ||
        Object.keys(values).some((k) =>
          resolve(apply($test, true, false, values[k], k))
        )
    );
  })
);
const every = reactiveFunc(($block) =>
  reactiveFunc(($test) => {
    const { items, values } = resolve($block);
    return toTruthy(
      items.every(($v, i) => resolve(apply($test, true, false, $v, i + 1))) &&
        Object.keys(values).every((k) =>
          resolve(apply($test, true, false, values[k], k))
        )
    );
  })
);

const numericOperators = {
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

export default { apply, operation, map, some, every };
