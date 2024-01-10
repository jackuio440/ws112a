import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
const router = new Router();

router.get('/', list)
  .get('/post/new', add)
  .post('/post', create)
  .get('/post/:id', show)
  .get('/post/delete/:id', deleteConfirmation)
  .post('/post/delete/:id', deletePost)
  .get('/post/:id/edit', edit)
  .post('/post/:id/edit', update);

const app = new Application()

function sqlcmd(sql, arg1) {
  console.log('sql:', sql)
  try {
    var results = db.query(sql, arg1)
    console.log('sqlcmd: results=', results)
    return results
  } catch (error) {
    console.log('sqlcmd error: ', error)
    throw error
  }
}

function postQuery(sql) {
  let list = []
  for (const [id, title, body] of sqlcmd(sql)) {
    list.push({id, title, body})
  }
  console.log('postQuery: list=', list)
  return list
}

async function parseFormBody(body) {
  const pairs = await body.value
  const obj = {}
  for (const [key, value] of pairs) {
    obj[key] = value
  }
  return obj
}

async function list(ctx) {
  let posts = postQuery("SELECT id, title, body FROM posts")
  console.log('list:posts=', posts)
  ctx.response.body = await render.list(posts);
}

async function add(ctx) {
  ctx.response.body = await render.newPost();
}

async function show(ctx) {
  const pid = ctx.params.id;
  let posts = postQuery(`SELECT id, title, body FROM posts WHERE id=${pid}`)
  let post = posts[0]
  console.log('show:post=', post)
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

async function create(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    var post = await parseFormBody(body)
    console.log('create:post=', post)
    sqlcmd("INSERT INTO posts (title, body) VALUES (?, ?)", [post.title, post.body]);  
    ctx.response.redirect('/');
  }
}

async function deleteConfirmation(ctx) {
  const pid = ctx.params.id;
  const post = postQuery(`SELECT id, title, body FROM posts WHERE id=${pid}`)[0];

  if (!post) {
    ctx.throw(404, 'Invalid post id');
  }

  ctx.response.body = await render.deleteConfirmation(post);
}

async function deletePost(ctx) {
  const pid = ctx.params.id;
  sqlcmd("DELETE FROM posts WHERE id=?", [pid]);

  ctx.response.redirect('/');
}

async function edit(ctx) {
  const pid = ctx.params.id;
  let posts = postQuery(`SELECT id, title, body FROM posts WHERE id=${pid}`);
  let post = posts[0];
  if (!post) {
    ctx.throw(404, 'Invalid post id');
  }
  ctx.response.body = await render.editPost(post);
}

async function update(ctx) {
  const pid = ctx.params.id;
  const body = ctx.request.body();
  if (body.type === "form") {
    const post = await parseFormBody(body);
    sqlcmd("UPDATE posts SET title=?, body=? WHERE id=?", [post.title, post.body, pid]);
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000')
await app.use(router.routes());
await app.use(router.allowedMethods());
await app.listen({ port: 8000 });
