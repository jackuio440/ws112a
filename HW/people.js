import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
 
const peoples = new Map();


const router = new Router();
router
.get("/", (ctx) => {
    ctx.response.body = "Home";
  })
  .get("/public/(.*)", async (ctx) => {
    let wpath = ctx.params[0]
    await send(ctx, wpath, {
      root: Deno.cwd()+"/public/",
      index: "index.html",
    })
  })
  .get("/people/find", async (ctx) => {
    const params = ctx.request.url.searchParams;
    const account = params.get("name");
    const password = params.get("tel");

    ctx.response.type = 'text/html';
    if (peoples.has(account) && peoples.get(account).password == password) {
        ctx.response.body = `
            <h1>登入成功</h1>
            <h2><a href="/public/index.html">進入</a></h2>`;
    } else {
        ctx.response.body = `
            <h1>登入失敗</h1>`;
    }
})

  .post("/people/add", async (ctx) => {
    const body = ctx.request.body()
    if (body.type === "form") {
      const pairs = await body.value
      console.log('pairs=', pairs)
      const params = {}
      for (const [key, value] of pairs) {
        params[key] = value
      }
      console.log('params=', params)
      let account = params['name']
      let password = params['tel']
      console.log(`account=${account} password=${password}`)
      if (peoples.get(account)) {
        ctx.response.body = `
        <h1>失敗</h1>
        <h2>帳號已存在</h2>`
      } else {
        peoples.set(account, {account, password})
        ctx.response.type = 'text/html'
        ctx.response.body = `
        <h1>成功</h1>
        <h2><a href="/public/add.html">註冊</a></h2>`
      }
    }
  })

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log('start at : http://127.0.0.1:8000')

await app.listen({ port: 8000 });