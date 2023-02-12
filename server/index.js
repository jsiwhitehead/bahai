import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";

import documents from "./data/documents.json" assert { type: "json" };

const docsInfo = Object.keys(documents).map((id) => {
  const { paragraphs, ...data } = documents[id];
  return data;
});

const app = new Koa();
app.use(cors());
app.use(bodyParser());

const router = new Router();
router
  .get("/", (ctx) => {
    ctx.body = "Hello World!";
  })
  .post("/documents", (ctx) => {
    const { author } = ctx.request.body;
    ctx.body = docsInfo.filter((d) => !author || author.includes(d.author));
  })
  .post("/paragraphs", (ctx) => {
    const { id } = ctx.request.body;
    ctx.body = documents[id].paragraphs;
  });
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
