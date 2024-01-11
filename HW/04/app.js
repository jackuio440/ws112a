import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("contacts.db");
db.query("CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT)");
const router = new Router();

router.get('/', list)
  .get('/contact/new', add)
  .post('/contact', create)
  .get('/contact/:id', show)
  .get('/contact/delete/:id', deleteConfirmation)
  .post('/contact/delete/:id', deleteItem)
  .get('/contact/:id/edit', edit)
  .post('/contact/:id/edit', update);

const app = new Application();

function sqlcmd(sql, arg1) {
  console.log('sql:', sql);
  try {
    var results = db.query(sql, arg1);
    console.log('sqlcmd: results=', results);
    return results;
  } catch (error) {
    console.log('sqlcmd error: ', error);
    throw error;
  }
}

function itemQuery(sql) {
  let list = [];
  for (const [id, name, phone, email] of sqlcmd(sql)) {
    list.push({ id, name, phone, email });
  }
  console.log('itemQuery: list=', list);
  return list;
}

async function parseFormBody(body) {
  const pairs = await body.value;
  const obj = {};
  for (const [key, value] of pairs) {
    if (key !== 'email') {
      obj[key] = value;
    }
  }
  return obj;
}

async function list(ctx) {
  let items = itemQuery("SELECT id, name, phone, email FROM contacts");
  console.log('list:items=', items);
  ctx.response.body = await render.list(items);
}

async function add(ctx) {
  ctx.response.body = await render.newPost();
}

async function show(ctx) {
  const itemId = ctx.params.id;
  let items = itemQuery(`SELECT id, name, phone, email FROM contacts WHERE id=${itemId}`);
  let item = items[0];
  console.log('show:item=', item);
  if (!item) ctx.throw(404, 'invalid item id');
  ctx.response.body = await render.show(item);
}

async function create(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    var item = await parseFormBody(body);
    console.log('create:item=', item);
    sqlcmd("INSERT INTO contacts (name, phone) VALUES (?, ?)", [item.name, item.phone]);
    ctx.response.redirect('/');
  }
}

async function deleteConfirmation(ctx) {
  const itemId = ctx.params.id;
  const item = itemQuery(`SELECT id, name, phone, email FROM contacts WHERE id=${itemId}`)[0];

  if (!item) {
    ctx.throw(404, 'Invalid item id');
  }

  ctx.response.body = await render.deleteConfirmation(item);
}

async function deleteItem(ctx) {
  const itemId = ctx.params.id;
  sqlcmd("DELETE FROM contacts WHERE id=?", [itemId]);

  ctx.response.redirect('/');
}

async function edit(ctx) {
  const itemId = ctx.params.id;
  let items = itemQuery(`SELECT id, name, phone FROM contacts WHERE id=${itemId}`);
  let item = items[0];
  if (!item) {
    ctx.throw(404, 'Invalid item id');
  }
  ctx.response.body = await render.editItem(item);
}

async function update(ctx) {
  const itemId = ctx.params.id;
  const body = ctx.request.body();
  if (body.type === "form") {
    const item = await parseFormBody(body);
    sqlcmd("UPDATE contacts SET name=?, phone=? WHERE id=?", [item.name, item.phone, itemId]);
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000');
await app.use(router.routes());
await app.use(router.allowedMethods());
await app.listen({ port: 8000 });
