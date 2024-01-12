var R = {};

window.onhashchange = async function () {
  var r;
  var tokens = window.location.hash.split('/');
  console.log('tokens=', tokens);
  switch (tokens[0]) {
    case '#show':
      r = await window.fetch('/contact/' + tokens[1]);
      let contact = await r.json();
      R.show(contact);
      break;
    case '#new':
      R.new();
      break;
    default:
      r = await window.fetch('/contacts');
      let contacts = await r.json();
      R.list(contacts);
      break;
  }
};

window.onload = function () {
  window.onhashchange();
};

R.layout = function (title, content) {
  document.querySelector('title').innerText = title;
  document.querySelector('#content').innerHTML = content;
};

R.list = function (contacts) {
  let list = [];
  for (let contact of contacts) {
    list.push(`
    <li>
      <h2>${contact.name}</h2>
      <p><a id="showContact${contact.id}" href="#show/${contact.id}">View Details</a></p>
    </li>
    `);
  }
  let content = `
  <h1>Contacts</h1>
  <p>You have <strong>${contacts.length}</strong> contacts!</p>
  <p><a id="createContact" href="#new">Create a Contact</a></p>
  <ul id="contacts">
    ${list.join('\n')}
  </ul>
  `;
  return R.layout('Contacts', content);
};

R.new = function () {
  return R.layout('New Contact', `
  <h1>New Contact</h1>
  <p>Create a new contact.</p>
  <form>
    <p><input id="name" type="text" placeholder="Name" name="name"></p>
    <p><input id="email" type="text" placeholder="Email" name="email"></p>
    <p><input id="saveContact" type="button" onclick="R.saveContact()" value="Create"></p>
  </form>
  `);
};

R.show = function (contact) {
  return R.layout(contact.name, `
    <h1>${contact.name}</h1>
    <p>Email: ${contact.email}</p>
  `);
};

R.saveContact = async function () {
  let name = document.querySelector('#name').value;
  let email = document.querySelector('#email').value;
  let r = await window.fetch('/contact', {
    body: JSON.stringify({ name: name, email: email }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  window.location.hash = '#contacts';
  return r;
};
