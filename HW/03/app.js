import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';

const contacts = [
  { id: 0, name: 'Alice', phone: '1234567890' },
  { id: 1, name: 'Bob', phone: '9876543210' }
];

const router = new Router();

router
  .get('/', list)
  .get('/contact/new', add)
  .get('/contact/:id', show)
  .post('/contact', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function list(ctx) {
  ctx.response.body = await render.listContacts(contacts);
}

async function add(ctx) {
  ctx.response.body = await render.newContact();
}

async function show(ctx) {
  const id = parseInt(ctx.params.id);
  const contact = contacts.find(contact => contact.id === id);
  if (!contact) {
    ctx.throw(404, 'Invalid contact id');
  }
  ctx.response.body = await render.showContact(contact);
}

async function create(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    const pairs = await body.value;
    const contact = {};
    for (const [key, value] of pairs) {
      contact[key] = value;
    }
    console.log('contact=', contact);
    contact.id = contacts.length;
    contacts.push(contact);
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
