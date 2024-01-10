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
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 0;
          background-color: #f4f4f4;
        }
        h1 {
          color: #333;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          background-color: #fff;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        a {
          text-decoration: none;
          color: #007bff;
        }
        a:hover {
          text-decoration: underline;
        }
        form {
          background-color: #fff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        input[type="text"],
        textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        input[type="submit"] {
          background-color: #007bff;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        input[type="submit"]:hover {
          background-color: #0056b3;
        }
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


