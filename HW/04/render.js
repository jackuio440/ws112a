export function list(contacts) {
  let listItems = contacts.map(contact => {
    return `
      <li>
        <h2>${contact.name}</h2>
        <p>Phone: ${contact.phone}</p>
        <p><a href="/contact/${contact.id}">View</a> | <a href="/contact/delete/${contact.id}">Delete</a> | <a href="/contact/${contact.id}/edit">Edit</a></p>
      </li>
    `;
  }).join('');

  return layout('List of Contacts', `
    <h1>List of Contacts</h1>
    <ul>${listItems}</ul>
    <p><a href="/contact/new">Add New Contact</a></p>
  `);
}

export function newPost() {
  return layout('New Contact', `
    <h1>New Contact</h1>
    <form action="/contact" method="post">
      <p><input type="text" placeholder="Name" name="name"></p>
      <p><input type="text" placeholder="Phone" name="phone"></p>
      <p><input type="submit" value="Create"></p>
    </form>
  `);
}

export function show(contact) {
  return layout(contact.name, `
    <h1>${contact.name}</h1>
    <p>Phone: ${contact.phone}</p>
    <p><a href="/">Back to List</a></p>
  `);
}

export function editPost(contact) {
  return layout(`Edit ${contact.name}`, `
    <h1>Edit ${contact.name}</h1>
    <form action="/contact/${contact.id}/edit" method="post">
      <p><input type="text" placeholder="Name" name="name" value="${contact.name}"></p>
      <p><input type="text" placeholder="Phone" name="phone" value="${contact.phone}"></p>
      <p><input type="submit" value="Update"></p>
    </form>
  `);
}

export function deleteConfirmation(contact) {
  return layout('Confirm Deletion', `
    <h1>Confirm Deletion</h1>
    <p>Are you sure you want to delete this contact?</p>
    <p><strong>${contact.name}</strong></p>
    <form action="/contact/delete/${contact.id}" method="post">
      <p><input type="submit" value="Delete"></p>
    </form>
  `);
}

// ... (layout function remains unchanged)




function layout(title, content) {
  return `
    <html>
    <head>
      <title>${title}</title>
      <style>
        /* Your styling remains unchanged */
      </style>
    </head>
    <body>
      <div id="content">
        ${content}
      </div>
    </body>
    </html>
  `;
}
