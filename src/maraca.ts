import ohm from "ohm-js";
import { resolve } from "reactivejs";

const grammar = String.raw`Maraca {

  start
    = space* value? space*

  value
    = compare

  compare
    = compare space* ("<=" | ">=" | "<" | ">" | "!" | "=") space* sum -- compare
    | sum

  sum
    = sum space* ("+" | "-") space* product -- sum
    | product

  product
    = product space* ("*" | "/" | "%") space* power -- product
    | power

  power
    = power space* "^" space* apply -- power
    | apply

  apply
    = apply "." pipe -- apply
    | pipe

  pipe
    = pipe "->" atom -- pipe
    | atom
  
  atom
    = block | scope | string | number | variable | brackets

  block
    = "[" space* items space* "]"

  scope
    = "{" space* items space* "}"

  items
    = listOf<(merge | assign | tag | function | value), join> space* ","?

  join
    = space* "," space*

  merge
    = string space* "::" space* value?

  assign
    = string space* ":" space* value

  tag
    = ":" space* value

  function
    = (block | variable) space* ":" space* value

  string
    = "\"" (char | escape)* "\""

  char
    = ~("\"" | "\\") any

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

s.addAttribute("ast", {
  start: (_1, a, _2) => a.ast[0],

  value: (a) => a.ast,

  compare_compare: (a, _1, b, _2, c) => ({
    type: "operation",
    operation: b.sourceString,
    values: [a.ast, c.ast],
  }),
  compare: (a) => a.ast,

  sum_sum: (a, _1, b, _2, c) => ({
    type: "operation",
    operation: b.sourceString,
    values: [a.ast, c.ast],
  }),
  sum: (a) => a.ast,

  product_product: (a, _1, b, _2, c) => ({
    type: "operation",
    operation: b.sourceString,
    values: [a.ast, c.ast],
  }),
  product: (a) => a.ast,

  power_power: (a, _1, b, _2, c) => ({
    type: "operation",
    operation: b.sourceString,
    values: [a.ast, c.ast],
  }),
  power: (a) => a.ast,

  apply_apply: (a, _1, b) => ({ type: "apply", map: a.ast, input: b.ast }),
  apply: (a) => a.ast,

  pipe_pipe: (a, _1, b) => ({ type: "pipe", map: b.ast, input: a.ast }),
  pipe: (a) => a.ast,

  atom: (a) => a.ast,

  block: (_1, _2, a, _3, _4) => ({ type: "block", items: a.ast }),

  scope: (_1, _2, a, _3, _4) => ({ type: "scope", items: a.ast }),

  items: (a, _1, _2) => a.ast,

  join: (_1, _2, _3) => null,

  merge: (a, _1, _2, _3, b) => ({
    type: "merge",
    key: a.ast.value,
    value: b.ast[0],
  }),

  assign: (a, _1, _2, _3, b) => ({
    type: "assign",
    key: a.ast.value,
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

  string: (_1, a, _2) => ({ type: "value", value: a.sourceString }),

  char: (_) => null,

  escape: (_1, _2) => null,

  number: (a) => ({ type: "value", value: parseInt(a.sourceString, 10) }),

  brackets: (_1, _2, a, _3, _4) => ({ type: "brackets", value: a.ast }),

  listOf: (a) => a.ast,
  nonemptyListOf: (a, _1, b) => [a.ast, ...b.ast],
  emptyListOf: () => [],

  _iter: (...children) => children.map((c) => c.ast),
});

const getVariables = (node) => {
  if (node.type === "block") return node.items.flatMap((n) => getVariables(n));
  if (node.type === "assign") return getVariables(node.value);
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

const compile = (node) => {
  if (node.type === "value") {
    return `${JSON.stringify(node.value)}`;
  }
  if (node.type === "operation") {
    const compiled = node.values.map((v) => compile(v));
    return `${compiled[0]} ${node.operation} ${compiled[1]}`;
  }
  if (node.type === "pipe") {
    return `apply(${compile(node.map)}, ${compile(node.input)})`;
  }
  if (node.type === "apply") {
    return `apply(${compile(node.map)}, ${compile(node.input)})`;
  }
  if (node.type === "block") {
    const values = node.items.filter((n) =>
      ["merge", "assign"].includes(n.type)
    );
    const tag = node.items.find((n) => ["tag"].includes(n.type));
    const functions = node.items.filter((n) => ["function"].includes(n.type));
    const items = node.items.filter(
      (n) => !["merge", "assign", "tag", "function"].includes(n.type)
    );
    return `{ ${[
      ...(tag ? [`tag: ${compile(tag.value)}`] : []),
      `items: [${items.map((n) => compile(n)).join(", ")}]`,
      `values: { ${values.map((n) => compile(n)).join(", ")} }`,
      `functions: [${functions.map((n) => compile(n)).join(", ")}]`,
    ].join(", ")} }`;
  }
  if (node.type === "scope") {
    const items = node.items.map((n) => compile(n));
    return `(${items.join(", ")})`;
  }
  if (node.type === "merge") {
    if (!node.value) return `${node.key}::`;
    return `${node.key}:: ${compile(node.value)}`;
  }
  if (node.type === "assign") {
    return `${node.key}: ${compile(node.value)}`;
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
    typeof input1 === "number" &&
    input1 >= 1 &&
    input1 <= map1.items.length
  ) {
    return map1.items[input1 - 1];
  }
  if (typeof input1 === "string" && input1 in map1.values) {
    return map1.values[input1];
  }
  if (map1.functions.length > 0) {
    for (const f of map1.functions) {
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
