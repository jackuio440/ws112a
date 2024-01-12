import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

const contacts = [
  { id: 0, name: 'John Doe', email: 'john@example.com' },
  { id: 1, name: 'Jane Smith', email: 'jane@example.com' }
];

const router = new Router();

router.get('/', (ctx) => ctx.response.redirect('/public/index.html'))
  .get('/contacts', list)
  .get('/contact/:id', show)
  .post('/contact', create)
  .get('/public/(.*)', pub);

app.use(router.routes());
app.use(router.allowedMethods());

async function pub(ctx) {
  console.log('path=', ctx.request.url.pathname);
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/`,
    index: "index.html",
  });
}

async function list(ctx) {
  ctx.response.type = 'application/json';
  ctx.response.body = contacts;
}

async function show(ctx) {
  const id = ctx.params.id;
  const contact = contacts[id];
  if (!contact) ctx.throw(404, 'invalid contact id');
  ctx.response.type = 'application/json';
  ctx.response.body = contact;
}

async function create(ctx) {
  const body = ctx.request.body(); // content type automatically detected
  console.log('body = ', body);
  if (body.type === "json") {
    let contact = await body.value;
    contact.id = contacts.length;
    contacts.push(contact);
    ctx.response.body = 'success';
    console.log('create:save=>', contact);
  }
}

console.log('Server run at http://127.0.0.1:8001');
await app.listen({ port: 8001 });
