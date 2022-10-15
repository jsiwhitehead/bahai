import run from "reactivejs";

import parse from "./parse";
import methods from "./methods";

const compile = (source) => {
  if (typeof source === "string") return parse(source);
  return Object.keys(source).reduce(
    (res, k) => ({ ...res, [k]: compile(source[k]) }),
    {}
  );
};

export default (library, source, update) => {
  run({ ...library, ...methods }, compile(source), update);
};
