import { effect, resolve } from "reactivejs";

const isObject = (x) => Object.prototype.toString.call(x) === "[object Object]";

const isAtom = (x) => isObject(x) && x.isStream && x.set;

const kebabToCamel = (s) => {
  let v = s;
  if (v[0] === "-") {
    v = v.slice(1);
    if (!v.startsWith("ms-")) v = `${v[0].toUpperCase()}${v.slice(1)}`;
  }
  return v
    .split("-")
    .map((x, i) => (i === 0 ? x : `${x[0].toUpperCase()}${x.slice(1)}`))
    .join("");
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
];

const updateNode = (node, data) => {
  if (!data) return null;

  if (!isObject(data) || !data.items) {
    const text = typeof data === "string" ? data : print(resolve(data, true));
    const next =
      node?.nodeName === "#text" ? node : document.createTextNode(text);
    next.textContent = text;
    return next;
  }

  const next =
    node?.nodeName.toLowerCase() === data.tag
      ? node
      : document.createElement(data.tag);
  next.__data = data;

  next.__updateProps =
    next.__updateProps ||
    effect(() => {
      const { style: dataStyle = {}, ...dataValues } = next.__data.values;
      const values = resolve(dataValues, true);
      const setters = Object.keys(next.__data.values)
        .filter((k) => isAtom(next.__data.values[k]) && k.startsWith("on"))
        .reduce(
          (res, k) => ({
            ...res,
            [k]: (e) => {
              next.__data.values[k].set(e);
            },
          }),
          {}
        );
      const props = { ...values, ...setters };
      for (const key in props) next[key] = props[key];

      const styles = resolve(dataStyle);
      const style = Object.keys(styles)
        .filter((key) => !reflowCSS.some((k) => key.startsWith(k)))
        .map((key) => ({ key, value: resolve(styles[key]) }))
        .reduce(
          (res, { key, value }) => ({ ...res, [kebabToCamel(key)]: value }),
          {}
        );
      for (const key in style) next.style[key] = style[key] || null;
    });
  next.__updateProps.get();

  next.__updateLayout =
    next.__updateLayout ||
    effect(() => {
      const styles = resolve(next.__data.values.style || {});
      const style = Object.keys(styles)
        .filter((key) => reflowCSS.some((k) => key.startsWith(k)))
        .map((key) => ({ key, value: resolve(styles[key]) }))
        .reduce(
          (res, { key, value }) => ({ ...res, [kebabToCamel(key)]: value }),
          {}
        );
      for (const key in style) next.style[key] = style[key] || null;
    });
  next.__updateLayout.get();

  next.__updateChildren =
    next.__updateChildren ||
    effect(() => {
      next.replaceChildren(
        ...next.__data.items
          .map((d, i) => updateNode(next.childNodes[i], resolve(d)))
          .filter((x) => x)
      );
    });
  next.__updateChildren.get();

  return next;
};

export default (root) => (data) => {
  root.replaceChildren(updateNode(root.childNodes[0], resolve(data.index)));
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

// import { elementClose, elementOpen, patch, text } from "incremental-dom";

// const render = (data) => {
//   if (!data) {
//     return;
//   }
//   if (!isObject(data) || !data.items) {
//     return text(typeof data === "string" ? data : print(resolve(data, true)));
//   }

//   const content = data.items.map((d) => resolve(d));

//   const values = resolve(data.values, true);
//   const setters = Object.keys(data.values)
//     .filter((k) => isAtom(data.values[k]) && k.startsWith("on"))
//     .reduce(
//       (res, k) => ({
//         ...res,
//         [k]: (e) => {
//           data.values[k].set(e);
//         },
//       }),
//       {}
//     );
//   const props = {
//     ...values,
//     ...(values.style
//       ? {
//           style: Object.keys(values.style)
//             .filter((k) => values.style[k] != null)
//             .reduce(
//               (res, k) => ({ ...res, [kebabToCamel(k)]: values.style[k] }),
//               {}
//             ),
//         }
//       : {}),
//     ...setters,
//   };

//   elementOpen(
//     resolve(data.tag),
//     null,
//     null,
//     ...Object.keys(props).reduce((res, k) => [...res, k, props[k]], [] as any[])
//   );

//   content.forEach((c) => render(c));

//   elementClose(resolve(data.tag));
// };

// export default (root) => (data) => patch(root, render, resolve(data.index));
