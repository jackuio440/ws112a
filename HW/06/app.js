import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)");

const router = new Router();

router.get('/', list)
  .get('/signup', signupUi)
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)
  .get('/logout', logout)
  .get('/post/new', add)
  .get('/post/:id', show)
  .post('/post', create)

const app = new Application()
app.use(Session.initMiddleware())
app.use(router.routes());
app.use(router.allowedMethods());

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
  for (const [id, username, title, body] of sqlcmd(sql)) {
    list.push({id, username, title, body})
  }
  console.log('postQuery: list=', list)
  return list
}

function userQuery(sql) {
  let list = []
  for (const [id, username, password, email] of sqlcmd(sql)) {
    list.push({id, username, password, email})
  }
  console.log('userQuery: list=', list)
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

async function signupUi(ctx) {
  ctx.response.body = await render.signupUi();
}

async function signup(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    var user = await parseFormBody(body);
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`);
    if (dbUsers.length === 0) {
      const sessionId = Math.random().toString(36).substring(7);
      sqlcmd("INSERT INTO users (username, password, email, session_id) VALUES (?, ?, ?, ?)", [
        user.username,
        user.password,
        user.email,
        sessionId,
      ]);
      ctx.state.session.set("user", { username: user.username, sessionId });
      ctx.response.body = await render.success();
    } else ctx.response.body = await render.fail();
  }
}
async function loginUi(ctx) {
  ctx.response.body = await render.loginUi();
}

async function login(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    var user = await parseFormBody(body);
    var dbUsers = userQuery(`SELECT id, username, password, email, session_id FROM users WHERE username='${user.username}'`);
    var dbUser = dbUsers[0];
    if (dbUser && dbUser.password === user.password) {
      const sessionId = Math.random().toString(36).substring(7);
      sqlcmd("UPDATE users SET session_id = ? WHERE id = ?", [sessionId, dbUser.id]);
      ctx.state.session.set("user", { username: user.username, sessionId });
      console.log("session.user=", await ctx.state.session.get("user"));
      ctx.response.redirect("/");
    } else {
      ctx.response.body = await render.fail();
    }
  }
}


async function logout(ctx) {
  const user = await ctx.state.session.get("user");
  if (user) {
    sqlcmd("UPDATE users SET session_id = NULL WHERE username = ?", [user.username]);
    ctx.state.session.set("user", null);
  }
  ctx.response.redirect("/");
}


async function list(ctx) {
  let posts = postQuery("SELECT id, username, title, body FROM posts")
  console.log('list:posts=', posts)
  ctx.response.body = await render.list(posts, await ctx.state.session.get('user'));
}

async function add(ctx) {
  var user = await ctx.state.session.get('user')
  if (user != null) {
    ctx.response.body = await render.newPost();
  } else {
    ctx.response.body = render.fail()
  }
}

async function show(ctx) {
  const pid = ctx.params.id;
  let posts = postQuery(`SELECT id, username, title, body FROM posts WHERE id=${pid}`)
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
    var user = await ctx.state.session.get('user')
    if (user != null) {
      console.log('user=', user)
      sqlcmd("INSERT INTO posts (username, title, body) VALUES (?, ?, ?)", [user.username, post.title, post.body]);  
    } else {
      ctx.throw(404, 'not login yet!');
    }
    ctx.response.redirect('/');
  }
}
app.use(async (ctx, next) => {
  const user = await ctx.state.session.get("user");
  if (user) {
    const dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}' AND session_id='${user.sessionId}'`);
    if (dbUsers.length > 0) {
      await next();
    } else {
      ctx.state.session.set("user", null);
      ctx.response.redirect("/login");
    }
  } else {
    await next();
  }
});

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
