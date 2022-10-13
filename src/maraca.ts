import ohm from "ohm-js";
import { resolve } from "reactivejs";

const grammar = String.raw`Maraca {

  start
    = space* value? space*

  value
    = ternary

  ternary
    = ternary space* "?" space* or space* ":" space* or -- ternary
    | or

  or
    = or space* "|" space* and -- or
    | and

  and
    = and space* "&" space* equal -- and
    | equal

  equal
    = equal space* ("!" | "=") space* compare -- equal
    | compare

  compare
    = compare space* ("<=" | ">=" | "<" | ">") space* sum -- compare
    | sum

  sum
    = sum space* ("+" | "-") space* product -- sum
    | product

  product
    = product space* ("*" | "/" | "%") space* power -- product
    | power

  power
    = power space* "^" space* unary -- power
    | unary

  unary
    = ("!" | "-") space* apply -- unary
    | apply

  apply
    = apply space* ("." | "->") space* atom -- apply
    | atom
  
  atom
    = block | scope | xstring | ystring | number | variable | brackets

  block
    = "[" space* items space* "]"

  scope
    = "{" space* items space* "}"

  items
    = listOf<(merge | assign | spread | tag | function | value), join> space* ","?

  join
    = space* "," space*

  merge
    = "~"? space* string space* "::" space* value?

  assign
    = "*"? space* string space* ":" space* value

  spread
    = "..." ":"? space* value

  tag
    = ":" space* string

  function
    = (block | variable) space* ":" space* value

  xstring
    = "'" (xvalue | xchunk)* "'"

  xvalue
    = "{" space* value space* "}"

  xchunk
    = (xchar | escape)+

  xchar
    = ~("'" | "\\" | "{") any

  ystring
    = "\"" (yvalue | ychunk)* "\""

  yvalue
    = "{" space* value space* "}"

  ychunk
    = (ychar | escape)+

  ychar
    = ~("\"" | "\\" | "{") any

  string
    = "'" (char | escape)* "'"

  char
    = ~("'" | "\\") any

  escape
    = "\\" any

  number
    = digit+

  variable
    = alnum+

  brackets
    = "(" space* value space* ")"
}`;

const g = ohm.grammar(grammar);
const s = g.createSemantics();

const binary = (a, _1, b, _2, c) =>
  ({
    type: "operation",
    operation: b.sourceString,
    values: [a.ast, c.ast],
  } as any);

s.addAttribute("ast", {
  start: (_1, a, _2) => a.ast[0],

  value: (a) => a.ast,

  ternary_ternary: (a, _1, _2, _3, b, _4, _5, _6, c) => ({
    type: "ternary",
    test: a.ast,
    pass: b.ast,
    fail: c.ast,
  }),
  ternary: (a) => a.ast,

  or_or: binary,
  or: (a) => a.ast,

  and_and: binary,
  and: (a) => a.ast,

  equal_equal: binary,
  equal: (a) => a.ast,

  compare_compare: binary,
  compare: (a) => a.ast,

  sum_sum: binary,
  sum: (a) => a.ast,

  product_product: binary,
  product: (a) => a.ast,

  power_power: binary,
  power: (a) => a.ast,

  unary_unary: (a, _1, b) => ({
    type: "operation",
    operation: a.sourceString,
    values: [b.ast],
  }),
  unary: (a) => a.ast,

  apply_apply: (a, _1, b, _2, c) =>
    b.sourceString === "."
      ? { type: "apply", map: a.ast, input: c.ast }
      : { type: "apply", map: c.ast, input: a.ast },
  apply: (a) => a.ast,

  atom: (a) => a.ast,

  block: (_1, _2, a, _3, _4) => ({ type: "block", items: a.ast }),

  scope: (_1, _2, a, _3, _4) => ({ type: "scope", items: a.ast }),

  items: (a, _1, _2) => a.ast,

  join: (_1, _2, _3) => null,

  merge: (a, _1, b, _2, _3, _4, c) => ({
    type: "merge",
    source: a.sourceString === "~",
    key: b.ast.value,
    value: c.ast[0],
  }),

  assign: (a, _1, b, _2, _3, _4, c) => ({
    type: "assign",
    recursive: a.sourceString === "*",
    key: b.ast.value,
    value: c.ast,
  }),

  spread: (_1, a, _2, b) => ({
    type: "spread",
    partial: a.sourceString === ":",
    value: b.ast,
  }),

  tag: (_1, _2, a) => ({
    type: "tag",
    value: a.ast,
  }),

  function: (a, _1, _2, _3, b) => ({
    type: "function",
    arg: a.ast,
    value: b.ast,
  }),

  variable: (a) => ({ type: "variable", value: a.sourceString }),

  xstring: (_1, a, _2) => ({ type: "string", parts: a.ast }),

  xvalue: (_1, _2, a, _3, _4) => a.ast,

  xchunk: (a) => a.sourceString,

  xchar: (_) => null,

  ystring: (_1, a, _2) => ({ type: "multistring", parts: a.ast }),

  yvalue: (_1, _2, a, _3, _4) => a.ast,

  ychunk: (a) => a.sourceString,

  ychar: (_) => null,

  string: (_1, a, _2) => ({ type: "value", value: a.sourceString }),

  char: (_) => null,

  escape: (_1, _2) => null,

  number: (a) => ({ type: "value", value: parseInt(a.sourceString, 10) }),

  brackets: (_1, _2, a, _3, _4) => ({ type: "brackets", value: a.ast }),

  listOf: (a) => a.ast,
  nonemptyListOf: (a, _1, b) => [a.ast, ...b.ast],
  emptyListOf: () => [],

  _iter: (...children) => children.map((c) => c.ast),
  _terminal: () => null,
});

const getVariables = (node) => {
  if (node.type === "block") return node.items.flatMap((n) => getVariables(n));
  if (node.type === "assign") return getVariables(node.value);
  if (node.type === "spread") return getVariables(node.value);
  if (node.type === "variable") return [node.value];
  return [];
};
const getPattern = (node) => {
  if (node.type === "block") {
    const values = node.items.filter((n) => ["assign"].includes(n.type));
    const items = node.items.filter((n) => !["assign"].includes(n.type));
    return {
      items,
      values: values.reduce((res, n) => ({ ...res, [n.key]: n.value }), {}),
    };
  }
  return node;
};

const operationMap = {
  "|": "||",
  "&": "&&",
  "!": "!==",
  "=": "===",
  "^": "**",
};

const compile = (node, block = false) => {
  if (node.type === "value") {
    return `${JSON.stringify(node.value)}`;
  }
  if (node.type === "string") {
    return (
      "`" +
      node.parts
        .map((p) => (typeof p === "string" ? p : "${" + compile(p) + "}"))
        .join("") +
      "`"
    );
  }
  if (node.type === "multistring") {
    return `[${node.parts
      .map((p) => (typeof p === "string" ? `"${p}"` : compile(p)))
      .join(", ")}]`;
  }
  if (node.type === "ternary") {
    return `${compile(node.test)} ? ${compile(node.pass)} : ${compile(
      node.fail
    )}`;
  }
  if (node.type === "operation") {
    const compiled = node.values.map((v) => compile(v));
    const operation = operationMap[node.operation] || node.operation;
    if (node.values.length === 1) `${compiled[0]}${operation}`;
    return `${compiled[0]} ${operation} ${compiled[1]}`;
  }
  if (node.type === "apply") {
    return `apply(${compile(node.map)}, ${compile(node.input)})`;
  }
  if (node.type === "block") {
    const values = node.items
      .filter((n) => ["merge", "assign"].includes(n.type))
      .map((n) => compile(n, true))
      .join(" ");
    const items = node.items
      .filter((n) => !["merge", "assign", "tag", "function"].includes(n.type))
      .map((n) => `{${compile(n)}}`)
      .join(" ");
    const tag =
      node.items.find((n) => ["tag"].includes(n.type))?.value.value || "\\";
    const functions = node.items
      .filter((n) => ["function"].includes(n.type))
      .map((n) => compile(n))
      .join(", ");
    if (functions.length === 0) return `<${tag} ${items} ${values} />`;
    return `<${tag} ${items} ${values} &functions={[${functions}]} />`;
  }
  if (node.type === "scope") {
    const items = node.items.map((n) => compile(n));
    return `(${items.join(", ")})`;
  }
  if (node.type === "merge") {
    const source = node.source ? "~" : "";
    if (!node.value) return `${source}${node.key}::`;
    if (block) return `${source}${node.key}::{${compile(node.value)}}`;
    return `${source}${node.key}:: ${compile(node.value)}`;
  }
  if (node.type === "assign") {
    const recursive = node.recursive ? "*" : "";
    if (block) return `${recursive}${node.key}={${compile(node.value)}}`;
    return `${recursive}${node.key}: ${compile(node.value)}`;
  }
  if (node.type === "spread") {
    return `...${compile(node.value)}`;
  }
  if (node.type === "function") {
    const variables = getVariables(node.arg);
    return `{ ${[
      `pattern: ${JSON.stringify(getPattern(node.arg))}`,
      `variables: ${JSON.stringify(variables)}`,
      `run: (${variables.join(", ")})=> ${compile(node.value)}`,
    ].join(", ")} }`;
  }
  if (node.type === "variable") {
    return node.value;
  }
  if (node.type === "brackets") {
    return `(${compile(node.value)})`;
  }
};

const reactiveFunc = (func) => {
  Object.assign(func, { reactiveFunc: true });
  return func;
};

const testMatch = (value, pattern) => {
  const value1 = resolve(value);
  if (!value1 || !pattern) return false;
  if (pattern.type === "variable") return { [pattern.value]: value1 };
  if (pattern.type === "value") return pattern.value === value1 && {};
  if (typeof value1 !== "object") return false;
  const last = pattern.items[pattern.items.length - 1];
  if (last.type === "spread") {
    const secondLast = pattern.items[pattern.items.length - 2];
    const matches = [
      ...Array.from({
        length: pattern.items.length - (secondLast?.type === "spread" ? 2 : 1),
      }).map((_, i) => testMatch(value1.items[i], pattern.items[i])),
      ...Object.keys(pattern.values).map((key) =>
        testMatch(value1.values[key], pattern.values[key])
      ),
    ];
    const otherItems = value1.items.slice(
      pattern.items.length - (secondLast?.type === "spread" ? 2 : 1)
    );
    const otherValues = Object.keys(value1.values).reduce(
      (res, k) => (pattern.values[k] ? res : { ...res, [k]: value1.values[k] }),
      {}
    );
    return (
      matches.every((x) => x) &&
      matches.reduce((res, x) => ({ ...res, ...x }), {
        [last.value.value]: {
          type: "block",
          items:
            secondLast?.type !== "spread" || !last.partial ? otherItems : [],
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
  }
  const matches = [
    ...Array.from({
      length: Math.max(value1.items.length, pattern.items.length),
    }).map((_, i) => testMatch(value1.items[i], pattern.items[i])),
    ...[
      ...new Set([
        ...Object.keys(value1.values),
        ...Object.keys(pattern.values),
      ]),
    ].map((key) => testMatch(value1.values[key], pattern.values[key])),
  ];
  return (
    matches.every((x) => x) &&
    matches.reduce((res, x) => ({ ...res, ...x }), {})
  );
};
const apply = reactiveFunc((map, input) => {
  const map1 = resolve(map);
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
  const funcs = resolve(map1.functions, true);
  if (funcs?.length > 0) {
    for (const f of funcs) {
      const match = testMatch(input1, f.pattern);
      if (match) return f.run(...f.variables.map((k) => match[k]));
    }
  }
  return "";
});
const buildFunc = (func) => ({
  items: [],
  values: {},
  functions: [
    { variables: ["x"], pattern: { type: "variable", value: "x" }, run: func },
  ],
});
const map = buildFunc(
  reactiveFunc((x) =>
    buildFunc(
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
    )
  )
);

export const maracaLibrary = { apply, map };

export default (script) => {
  const m = g.match(script);
  if (m.failed()) {
    console.error(m.message);
    throw new Error("Parser error");
  }
  const source = s(m).ast;
  // console.log(JSON.stringify(source, null, 2));
  const result = compile(source);
  // console.log(result);
  return result;
};
