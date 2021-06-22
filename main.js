const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 100000,
  logging: false,
});

const blogTitle = "Benjamin Brandall"
const walletAddr = 'kaYP9bJtpqON8Kyy3RbqnqdtDBDUsPTQTNUCvZtKiFI'
const arweaveUrl = "https://arweave.net/graphql"

const getAllPosts = async (walletAddr) => {
  const query = `query {
    transactions(
      owners: ["${walletAddr}"]
      tags: { name: "App-Name", values: "permablog-v1" }
    ) {
      edges {
        node {
          id
        }
      }
    }
  }`

  const opts = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query})
  };

  const posts = fetch(arweaveUrl, opts).then(res => res.json())
  return posts
}

const parsePosts = (posts) => {
  const postIds = []
  for (let i in posts) {
    postIds.push(posts[i].node.id)
  }
  return postIds
}

const getPostJson = async (postIds) => {
  const posts = []

  for (let i in postIds) {
    let id = postIds[i]
    const query = `query {
      transactions(ids: ["${id}"]) {
        edges {
          node {
            tags {
              name,
              value
            }
          }
        }
      }
    }`
  
    const opts = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query})
    };
    
    const body = await fetch(`https://arweave.net/${id}`)
    .then(function(response) {
      return response.text()
    }).then(function(data) { return data })
    const post = await fetch(arweaveUrl, opts).then(res => res.json())
    posts.push({'id': id, 'title': post.data.transactions.edges[0].node.tags[0].value, 'body': body})
    
  }

  return posts

}

const getOnePost = (posts) => {
  const post = posts[0]
  var a = document.createElement("a")
    var p = document.createElement("p");
    var h1 = document.createElement("h1")
    h1.innerHTML = post.title
    p.innerHTML = post.body
    a.href = `/#${post.id}`
    a.innerHTML = "Link"
    var blog = document.getElementsByClassName('article')[0]
    blog.appendChild(h1)
    blog.appendChild(a)
    blog.appendChild(p)
}

const createIndex = (posts) => {
  for (let i in posts) {
    var a = document.createElement("a")
    var p = document.createElement("p");
    var h2 = document.createElement("h2")
    h2.innerHTML = posts[i].title
    p.innerHTML = posts[i].body
    a.href = `#${posts[i].id}`
    a.innerHTML = "permalink"
    var blog = document.getElementsByClassName('article')[0]
    blog.appendChild(h2)
    blog.appendChild(a)
    blog.appendChild(p)
    }
}

const setBlogTitle = (title) => {
  var h1 = document.createElement("h1")
  h1.innerHTML = title
  const blogTitle = document.getElementsByClassName('title')[0]
  blogTitle.appendChild(h1)
}

const filterPosts = (posts) => posts.filter(e => !e.includes(barredTxs))
const hashString = window.location.hash.substring(1);
const txId_match = /^[a-zA-Z0-9-_]{43}$/
const barredTxs = ['XXP61tTAywjL2IgGcXWJ4F6TsBh5xNjnuItk6YUjd60']

setBlogTitle(blogTitle)

if (hashString && txId_match.test(hashString)) {
  getOnePost(await getPostJson([hashString]))
} else {
  const postsData = await getAllPosts(walletAddr)
  const postIds = parsePosts(postsData.data.transactions.edges)
  const posts = await getPostJson(filterPosts(postIds))
  createIndex(posts)
}
