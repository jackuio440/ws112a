var R = {}

var socket = new WebSocket("ws://"+window.location.hostname+":8080")

socket.onopen = function (event) {
  console.log('socket:onopen()...')
}

function send(o) {
  if (socket.readyState==1) {
    socket.send(JSON.stringify(o))
  } else {
    setTimeout(function() {
      send(o)
    }, 1000)
  }
}

window.onhashchange = async function () {
  var tokens = window.location.hash.split('/');
  console.log('tokens=', tokens);
  switch (tokens[0]) {
    case '#show':
      send({ type: 'show', contact: { id: parseInt(tokens[1]) } });
      break;
    case '#new':
      R.new();
      break;
    default:
      send({ type: 'list' });
      break;
  }
}

socket.onmessage = function (event) {
  var msg = JSON.parse(event.data);
  console.log('onmessage: msg=', msg);
  switch (msg.type) {
    case 'show':
      R.show(msg.contact);
      break;
    case 'list':
      R.list(msg.contacts);
      break;
  }
}

window.onload = function () {
  console.log('onload')
  window.location.href = "#list"
  window.onhashchange()
}

R.layout = function (title, content) {
  document.querySelector('title').innerText = title
  document.querySelector('#content').innerHTML = content
}

R.list = function (posts) {
  let list = []
  for (let post of posts) {
    list.push(`
    <li>
      <h2>${post.title}</h2>
      <p><a id="show${post.id}" href="#show/${post.id}">Read post</a></p>
    </li>
    `)
  }
  let content = `
  <h1>Posts</h1>
  <p>You have <strong>${posts.length}</strong> posts!</p>
  <p><a id="createPost" href="#new">Create a Post</a></p>
  <ul id="posts">
    ${list.join('\n')}
  </ul>
  `
  return R.layout('Posts', content)
}

R.new = function () {
  return R.layout('New Contact', `
  <h1>New Contact</h1>
  <p>Create a new contact.</p>
  <form>
    <p><input id="name" type="text" placeholder="Name" name="name"></p>
    <p><input id="phone" type="text" placeholder="Phone" name="phone"></p>
    <p><input id="email" type="text" placeholder="Email" name="email"></p>
    <p><input id="saveContact" type="button" onclick="R.saveContact()" value="Create"></p>
  </form>
  `);
}

R.show = function (contact) {
  return R.layout(contact.name, `
    <h1>${contact.name}</h1>
    <p>Phone: ${contact.phone}</p>
    <p>Email: ${contact.email}</p>
  `);
}

R.saveContact = function () {
  let name = document.querySelector('#name').value;
  let phone = document.querySelector('#phone').value;
  let email = document.querySelector('#email').value;
  send({ type: 'create', contact: { name, phone, email } });
  window.location.hash = '#list';
}
