import ohm from "ohm-js";

const grammar = String.raw`Maraca {

  start
    = space* value? space*

  value
    = or

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
    = ("!" | "-" | "+") space* apply -- unary
    | apply

  apply
    = apply space* ("." | "?." | "->") space* atom -- apply
    | apply "(" space* arguments space* ")" -- brackets
    | atom

  arguments
    = listOf<value, join> space* ","?

  atom
    = block | scope | xstring | ystring | number | variable | brackets

  block
    = "[" space* items space* "]"

  scope
    = "{" space* items space* "}"

  items
    = listOf<(merge | assign | copy | spread | function | value), join> space* ","?

  join
    = space* "," space*

  merge
    = "~"? space* string space* "::" space* value?

  assign
    = "*"? space* string? space* ":" space* value

  copy
    = string space* ":="

  spread
    = "..." ":"? space* value

  function
    = (parameters | pattern)? space* ("?" space* value)? space* ":" space* value

  parameters
    = "(" space* parametersitems space* ")"

  parametersitems
    = listOf<pattern, join> space* ","?

  pattern
    = block | variable

  xstring
    = "'" (xvalue | xchunk)* "'"

  xvalue
    = "{" space* value space* "}"

  xchunk
    = (xchar | escape)+

  xchar
    = ~("'" | "\\" | "{") any

  ystring
    = "\"" (block | yvalue | ychunk)* "\""

  yvalue
    = "{" space* value space* "}"

  ychunk
    = (ychar | escape)+

  ychar
    = ~("\"" | "\\" | "{" | "[") any

  string
    = "'" (char | escape)* "'"

  char
    = ~("'" | "\\") any

  escape
    = "\\" any

  number
    = digit+ ("." digit+)?

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
    b.sourceString === "->"
      ? { type: "apply", map: c.ast, inputs: [a.ast] }
      : {
          type: "apply",
          optional: b.sourceString === "?.",
          map: a.ast,
          inputs: [c.ast],
        },
  apply_brackets: (a, _1, _2, b, _3, _4) => ({
    type: "apply",
    complete: true,
    map: a.ast,
    inputs: b.ast,
  }),
  apply: (a) => a.ast,

  arguments: (a, _1, _2) => a.ast,

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
    key: b.ast[0]?.value || "",
    value: c.ast,
  }),

  copy: (a, _1, _2) => ({
    type: "assign",
    key: a.ast.value,
    value: { type: "variable", value: a.ast.value },
  }),

  spread: (_1, a, _2, b) => ({
    type: "spread",
    partial: a.sourceString === ":",
    value: b.ast,
  }),

  function: (a, _1, _2, _3, b, _4, _5, _6, c) => {
    if (a.ast[0]?.type === "parameters") {
      const args = a.ast[0].items;
      return args.reduceRight(
        (value, arg, i) => ({
          type: "block",
          items: [{ type: "function", arg, count: args.length - i, value }],
        }),
        c.ast
      ).items[0];
    }
    return {
      type: "function",
      arg: a.ast[0],
      test: b.ast[0],
      count: 1,
      value: c.ast,
    };
  },

  parameters: (_1, _2, a, _3, _4) => ({ type: "parameters", items: a.ast }),

  parametersitems: (a, _1, _2) => a.ast,

  pattern: (a) => a.ast,

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

  number: (a, b, c) => ({
    type: "value",
    value: parseFloat([a, b, c].map((x) => x.sourceString).join("")),
  }),

  variable: (a) => ({ type: "variable", value: a.sourceString }),

  brackets: (_1, _2, a, _3, _4) => ({ type: "brackets", value: a.ast }),

  listOf: (a) => a.ast,
  nonemptyListOf: (a, _1, b) => [a.ast, ...b.ast],
  emptyListOf: () => [],

  _iter: (...children) => children.map((c) => c.ast),
  _terminal: () => null,
});

const getVariables = (node) => {
  if (!node) return [];
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

const compileBlock = (node) => {
  const values = node.items
    .filter((n) => ["merge", "assign"].includes(n.type))
    .map((n) => compile(n, true))
    .join(" ");
  const items = node.items
    .filter((n) => !["merge", "assign", "function"].includes(n.type))
    .map((n) => `{${compile(n, true)}}`)
    .join(" ");
  const functionNodes = node.items.filter((n) => ["function"].includes(n.type));
  const functions =
    functionNodes.length > 0 &&
    `&functions={[${functionNodes.map((n) => compile(n)).join(", ")}]}`;
  return `<\\ ${[items, values, functions].filter((x) => x).join(" ")} />`;
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
  if (node.type === "operation") {
    const compiled = node.values.map((v) => compile(v));
    return `operation("${node.operation}", ${compiled.join(", ")})`;
  }
  if (node.type === "apply") {
    return `apply(${compile(node.map)}, ${node.complete ? "true" : "false"}, ${
      node.optional ? "true" : "false"
    }, ${node.inputs.map((n) => compile(n)).join(", ")})`;
  }
  if (node.type === "block") {
    return compileBlock(node);
  }
  if (node.type === "scope") {
    return `apply(${compileBlock(node)}, false, false, "")`;
  }
  if (node.type === "merge") {
    const source = node.source ? "~" : "";
    if (!node.value) return `${source}${node.key}::`;
    if (block) return `${source}${node.key}::{${compile(node.value)}}`;
    return `${source}${node.key}:: ${compile(node.value)}`;
  }
  if (node.type === "assign") {
    const recursive = node.recursive ? "*" : "";
    if (block) return `${recursive}"${node.key}"={${compile(node.value)}}`;
    return `${recursive}"${node.key}": ${compile(node.value)}`;
  }
  if (node.type === "spread") {
    if (block) return `...${compile(node.value)}`;
    return `...${compile(node.value)}.values`;
  }
  if (node.type === "function") {
    const variables = getVariables(node.arg);
    return `{ ${[
      node.arg && `pattern: ${JSON.stringify(getPattern(node.arg))}`,
      variables.length > 0 && `variables: ${JSON.stringify(variables)}`,
      node.test && `test: (${variables.join(", ")})=> ${compile(node.test)}`,
      node.count && `count: ${node.count}`,
      `run: (${variables.join(", ")})=> ${compile(node.value)}`,
    ]
      .filter((x) => x)
      .join(", ")} }`;
  }
  if (node.type === "variable") {
    return node.value;
  }
  if (node.type === "brackets") {
    return `(${compile(node.value)})`;
  }
};

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
