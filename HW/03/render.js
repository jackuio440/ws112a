export function layout(title, content) {
  return `
  <html>
  <head>
    <title>${title}</title>
    <style>
      body {
        padding: 80px;
        font: 16px Helvetica, Arial;
      }
  
      h1 {
        font-size: 2em;
      }
  
      h2 {
        font-size: 1.2em;
      }
  
      #contacts {
        margin: 0;
        padding: 0;
      }
  
      #contacts li {
        margin: 40px 0;
        padding: 0;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        list-style: none;
      }
  
      #contacts li:last-child {
        border-bottom: none;
      }
  
      textarea {
        width: 500px;
        height: 300px;
      }
  
      input[type=text],
      textarea {
        border: 1px solid #eee;
        border-top-color: #ddd;
        border-left-color: #ddd;
        border-radius: 2px;
        padding: 15px;
        font-size: .8em;
      }
  
      input[type=text] {
        width: 500px;
      }
    </style>
  </head>
  <body>
    <section id="content">
      ${content}
    </section>
  </body>
  </html>
  `;
}

export function listContacts(contacts) {
  let list = [];
  for (let contact of contacts) {
    list.push(`
    <li>
      <h2>${contact.name}</h2>
      <p><a href="/contact/${contact.id}">View Contact</a></p>
    </li>
    `);
  }
  let content = `
  <h1>Contacts</h1>
  <p>You have <strong>${contacts.length}</strong> contacts!</p>
  <p><a href="/contact/new">Create a Contact</a></p>
  <ul id="contacts">
    ${list.join('\n')}
  </ul>
  `;
  return layout('Contacts', content);
}

export function newContact() {
  return layout('New Contact', `
  <h1>New Contact</h1>
  <p>Create a new contact.</p>
  <form action="/contact" method="post">
    <p><input type="text" placeholder="Name" name="name"></p>
    <p><input type="text" placeholder="Phone" name="phone"></p>
    <p><input type="submit" value="Create"></p>
  </form>
  `);
}

export function showContact(contact) {
  return layout(contact.name, `
    <h1>${contact.name}</h1>
    <p>Phone: ${contact.phone}</p>
  `);
}
