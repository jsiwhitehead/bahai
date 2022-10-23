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
    = compare space* ("<=" | ">=" | "<" | ">") space* range -- compare
    | range

  range
  = range space* ".." space* sum -- range
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
    = listOf<(merge | assign | copy | spread | value), join> space* ","?

  join
    = space* "," space*

  merge
    = string space* ("::" | ":?") space* value?

  assign
    = "*"? space* (parameters | pattern)? space* ("?" space* value)? space* ":" space* value

  parameters
    = "(" space* parametersitems space* ")"

  parametersitems
    = listOf<pattern, join> space* ","?

  pattern
    = block | xstring | variable

  copy
    = string space* ":="

  spread
    = "..." ":"? space* value

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

  range_range: binary,
  range: (a) => a.ast,

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

  merge: (a, _1, b, _2, c) => ({
    type: "merge",
    source: b.sourceString === ":~",
    key: a.ast.value,
    value: c.ast[0],
  }),

  assign: (a, _1, b, _2, _3, _4, c, _5, _6, _7, d) => {
    if (b.ast[0]?.type === "string" || (!b.ast[0] && !c.ast[0])) {
      const parts = b.ast[0]?.parts || [""];
      if (parts.length === 1 && typeof parts[0] === "string") {
        return {
          type: "assign",
          recursive: a.sourceString === "*",
          key: parts[0],
          value: d.ast,
        };
      }
    }
    return {
      type: "function",
      arg: b.ast[0],
      test: c.ast[0],
      count: 1,
      value: d.ast,
    };
  },

  parameters: (_1, _2, a, _3, _4) => ({ type: "parameters", items: a.ast }),

  parametersitems: (a, _1, _2) => a.ast,

  pattern: (a) => a.ast,

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
  if (node.type === "string") {
    return node.parts
      .filter((p) => typeof p !== "string")
      .flatMap((n) => getVariables(n));
  }
  if (node.type === "parameters") {
    return node.items.flatMap((n) => getVariables(n));
  }
  if (node.type === "variable") return [node.value];
  return [];
};
const getPattern = (node) => {
  if (node.type === "block") {
    const values = node.items.filter((n) => ["assign"].includes(n.type));
    const items = node.items.filter((n) => !["assign"].includes(n.type));
    return {
      items: items.map((n) => getPattern(n)),
      values: values.reduce(
        (res, n) => ({ ...res, [n.key]: getPattern(n.value) }),
        {}
      ),
    };
  }
  return node;
};

const compileBlock = (node, capture) => {
  const items = node.items.filter(
    (n) => !["merge", "assign", "function"].includes(n.type)
  );
  const values = node.items.filter((n) => ["merge", "assign"].includes(n.type));
  const functions = node.items.filter((n) => ["function"].includes(n.type));
  if (items.length > 0 && values.length === 0 && functions.length === 0) {
    return `[${capture ? "~" : ""} ${items.map((n) => compile(n)).join(",")}]`;
  }
  if (values.length > 0 && items.length === 0 && functions.length === 0) {
    return `{${capture ? "~" : ""} ${values.map((n) => compile(n)).join(",")}}`;
  }
  if (
    functions.length === 1 &&
    items.length === 0 &&
    values.length === 0 &&
    !functions[0].test &&
    (functions[0].arg.type === "variable" ||
      (functions[0].arg.type === "parameters" &&
        functions[0].arg.items.every((n) => n.type === "variable")))
  ) {
    const variables = getVariables(functions[0].arg);
    return `((${variables.join(", ")})=> ${compile(functions[0].value)})`;
  }
  return `<\\${capture ? "~" : ""} ${[
    items.map((n) => `{${compile(n, true)}}`).join(" "),
    values.map((n) => compile(n, true)).join(" "),
    functions.length > 0 &&
      `&functions={[${functions.map((n) => compile(n)).join(", ")}]}`,
  ]
    .filter((x) => x)
    .join(" ")} />`;
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
    return compileBlock(node, true);
  }
  if (node.type === "scope") {
    if (node.items.every((n) => n.type === "assign")) {
      return `(${node.items
        .map((n) => (n.key ? compile(n) : compile(n.value)))
        .join(", ")})`;
    }
    if (
      node.items.every(
        (n) =>
          (n.type === "function" && !n.arg) || (n.type === "assign" && !n.key)
      )
    ) {
      const items = node.items.slice(
        0,
        node.items.findIndex((n) => n.type === "assign") + 1
      );
      const last = items.pop();
      return items.reduceRight(
        (res, n) =>
          `toTruthy(${compile(n.test)}) ? ${compile(n.value)} : ${res}`,
        compile(last.value)
      );
    }
    return `apply(${compileBlock(node, false)}, false, false, "")`;
  }
  if (node.type === "merge") {
    const operator = node.source ? ":~" : "::";
    if (!node.value) return `${node.key}${operator}`;
    if (block) return `${node.key}${operator}{${compile(node.value)}}`;
    return `${node.key}${operator} ${compile(node.value)}`;
  }
  if (node.type === "assign") {
    const recursive = node.recursive ? "*" : "";
    if (block) return `${recursive}"${node.key}"={${compile(node.value)}}`;
    return `${recursive}"${node.key}": ${compile(node.value)}`;
  }
  if (node.type === "spread") {
    return `...${compile(node.value)}`;
  }
  if (node.type === "function") {
    if (node.arg?.type === "parameters") {
      return compile(
        node.arg.items.reduceRight((value, arg, i) => {
          const count = node.arg.items.length - i;
          return {
            type: "block",
            items: [
              {
                type: "function",
                arg,
                test: count === 1 && node.test,
                count,
                value,
              },
            ],
          };
        }, node.value).items[0]
      );
    }
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
