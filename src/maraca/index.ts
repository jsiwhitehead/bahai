import run from "reactivejs";

import parse from "./parse";
import methods from "./methods";
import { mapObject } from "./utils";

export { createBlock } from "./methods";

const compile = (source) => {
  if (typeof source === "string") return parse(source);
  return mapObject(source, compile);
};

export default (library, source, update?) => {
  return run({ ...library, ...methods }, compile(source), update);
};
