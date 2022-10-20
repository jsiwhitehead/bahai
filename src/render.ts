import { effect, resolve } from "reactivejs";

import { createBlock } from "./maraca";

const isSourceStream = (x) => x && typeof x === "object" && x.isStream && x.set;

const kebabToCamelMemo = {};
const kebabToCamel = (s) => {
  if (s in kebabToCamelMemo) return kebabToCamelMemo[s];
  let v = s;
  if (v[0] === "-") {
    v = v.slice(1);
    if (!v.startsWith("ms-")) v = `${v[0].toUpperCase()}${v.slice(1)}`;
  }
  return (kebabToCamelMemo[s] = v
    .split("-")
    .map((x, i) => (i === 0 ? x : `${x[0].toUpperCase()}${x.slice(1)}`))
    .join(""));
};

const print = (x, space?) =>
  JSON.stringify(
    x,
    (_, v) => {
      if (v === undefined) return "__undefined__";
      if (v !== v) return "__NaN__";
      return v;
    },
    space && 2
  )
    .replace(/"__undefined__"/g, "undefined")
    .replace(/"__NaN__"/g, "NaN");

const reflowCSS = [
  "display",
  "visibility",
  "padding",
  "margin",
  "width",
  "height",
  "font-size",
  "top",
  "left",
  "bottom",
  "right",
  "float",
];

const applyUpdate = (node, ref, values, style = false) => {
  const prev = node[`__${ref}`] || {};
  for (const key in { ...prev, ...values }) {
    if (style) {
      node.style[key] = values[key] || null;
    } else {
      if (values[key] === null || values[key] === undefined) delete node[key];
      else node[key] = values[key];
    }
  }
  node[`__${ref}`] = values;
};

const updateChildren = (node, children) => {
  if (
    node.childNodes.length !== children.length ||
    [...node.childNodes].some((c, i) => children[i] !== c)
  ) {
    node.replaceChildren(...children);
  }
};

const updateNode = (node, data) => {
  if (!data && data !== 0) return null;

  if (typeof data !== "object" || data.type !== "block") {
    const text = (typeof data === "string" ? data : print(resolve(data, true)))
      .normalize("NFD")
      .replace(/\u0323/g, "")
      .normalize("NFC");
    const next =
      node?.nodeName === "#text" ? node : document.createTextNode(text);
    next.textContent = text;
    return next;
  }

  const tag = resolve(data.values[""]);
  const next =
    node?.nodeName.toLowerCase() === tag ? node : document.createElement(tag);

  effect(() => {
    const { style: dataStyle = {}, ...dataValues } = data.values;
    const values = resolve(dataValues, true);
    const setters = Object.fromEntries(
      Object.entries<any>(data.values)
        .filter(([k, v]) => isSourceStream(v) && k.startsWith("on"))
        .map(([k, v]) => [
          k,
          (e) => {
            v.set(e);
          },
        ])
    );
    applyUpdate(next, "props", { ...values, ...setters });

    const styles = resolve(createBlock(resolve(dataStyle)).values);
    const style = Object.fromEntries(
      Object.entries(styles)
        .filter(([key]) => !reflowCSS.some((k) => key.startsWith(k)))
        .map(([key, value]) => [kebabToCamel(key), resolve(value)])
    );
    applyUpdate(next, "styles", style, true);
  }, "style");

  effect(() => {
    const styles = resolve(
      createBlock(resolve(data.values.style || {})).values
    );
    const style = Object.fromEntries(
      Object.entries(styles)
        .filter(([key]) => reflowCSS.some((k) => key.startsWith(k)))
        .map(([key, value]) => [kebabToCamel(key), resolve(value)])
    );
    applyUpdate(next, "reflow", style, true);
  }, "reflow");

  effect(() => {
    updateChildren(
      next,
      data.items
        .map((d, i) => updateNode(next.childNodes[i], resolve(d)))
        .filter((x) => x)
    );
  }, "children");

  return next;
};

export default (root) => (data) => {
  updateChildren(root, [updateNode(root.childNodes[0], resolve(data.index))]);
};

// const attributesMap = {
//   accesskey: "accessKey",
//   bgcolor: "bgColor",
//   class: "className",
//   colspan: "colSpan",
//   contenteditable: "contentEditable",
//   crossorigin: "crossOrigin",
//   dirname: "dirName",
//   inputmode: "inputMode",
//   ismap: "isMap",
//   maxlength: "maxLength",
//   minlength: "minLength",
//   novalidate: "noValidate",
//   readonly: "readOnly",
//   referrerpolicy: "referrerPolicy",
//   rowspan: "rowSpan",
//   tabindex: "tabIndex",
// };
