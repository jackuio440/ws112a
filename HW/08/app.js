import { Application, send } from "https://deno.land/x/oak/mod.ts";
import { WebSocketServer } from "https://deno.land/x/websocket/mod.ts";

const app = new Application()

const contacts = [
  { id: 0, name: 'John Doe', phone: '123-456-7890', email: 'john@example.com' },
  { id: 1, name: 'Jane Doe', phone: '987-654-3210', email: 'jane@example.com' }
];

// ...

const wss = new WebSocketServer(8080);

wss.on("connection", function (ws) {
  ws.on("message", function (message) {
    var id, contact, msg = JSON.parse(message);
    console.log('msg=', msg);
    switch (msg.type) {
      case 'list':
        ws.send(JSON.stringify({ type: 'list', contacts }));
        break;
      case 'show':
        id = msg.contact.id;
        contact = contacts.find(c => c.id === id);
        ws.send(JSON.stringify({ type: 'show', contact }));
        break;
      case 'create':
        contact = msg.contact;
        id = contacts.push(contact) - 1;
        contact.id = id;
        ws.send(JSON.stringify({ type: 'create', contact }));
        break;
    }
  });
});

// ...


app.use(async (ctx, next) => {
  await next()
  console.log('path=', ctx.request.url.pathname)
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/public/`,
    index: "index.html",
  })
})

console.log('Server run at http://127.0.0.1:8002')
await app.listen({ port: 8002 })
