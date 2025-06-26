const token = localStorage.getItem("token");
const postBtn = document.getElementById("postBtn");
const logoutBtn = document.getElementById("logoutBtn");
const feed = document.getElementById("feed");

// Redirigir si no hay token
if (!token) {
  window.location.href = "index.html";
}

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

// Publicar post
postBtn.addEventListener("click", async () => {
  const content = document.getElementById("postContent").value;
  if (!content) return;

  const res = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (res.ok) {
    document.getElementById("postContent").value = "";
    cargarFeed();
  }
});

// Cargar feed
async function cargarFeed() {
  const res = await fetch("/api/feed", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const posts = await res.json();
  feed.innerHTML = "";

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow";

    card.innerHTML = `
      <h3 class="font-bold text-blue-600">${post.author.username}</h3>
      <p class="text-gray-700 mt-1">${post.content}</p>
      <p class="text-xs text-gray-400 mt-2">${new Date(post.createdAt).toLocaleString()}</p>
    `;

    feed.appendChild(card);
  });
}

cargarFeed();
