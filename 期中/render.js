export function list(posts) {
  let listItems = posts.map(post => {
    return `
      <li>
        <h2>${post.title}</h2>
        <p>${post.body}</p>
        <p><a href="/post/${post.id}">View</a> | <a href="/post/delete/${post.id}">Delete | <a href="/post/${post.id}/edit">Edit</a></p>
      </li>
    `;
  }).join('');

  return layout('List of Posts', `
    <h1>List of Posts</h1>
    <ul>${listItems}</ul>
    <p><a href="/post/new">Add New Post</a></p>
  `);
}

export function newPost() {
  return layout('New Post', `
    <h1>New Post</h1>
    <form action="/post" method="post">
      <p><input type="text" placeholder="Title" name="title"></p>
      <p><textarea placeholder="Body" name="body"></textarea></p>
      <p><input type="submit" value="Create"></p>
    </form>
  `);
}

export function show(post) {
  return layout(post.title, `
    <h1>${post.title}</h1>
    <p>${post.body}</p>
    <p><a href="/">Back to List</a></p>
  `);
}

export function editPost(post) {
  return layout(`Edit ${post.title}`, `
    <h1>Edit ${post.title}</h1>
    <form action="/post/${post.id}/edit" method="post">
      <p><input type="text" placeholder="Title" name="title" value="${post.title}"></p>
      <p><textarea placeholder="Body" name="body">${post.body}</textarea></p>
      <p><input type="submit" value="Update"></p>
    </form>
  `);
}

export function deleteConfirmation(post) {
  return layout('Confirm Deletion', `
    <h1>Confirm Deletion</h1>
    <p>Are you sure you want to delete this post?</p>
    <p><strong>${post.title}</strong></p>
    <form action="/post/delete/${post.id}" method="post">
      <p><input type="submit" value="Delete"></p>
    </form>
  `);
}

function layout(title, content) {
  return `
    <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
      <div id="content">
        ${content}
      </div>
    </body>
    </html>
  `;
}

