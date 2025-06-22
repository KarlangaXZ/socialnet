const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middlewares/auth");

// Crear post
router.post("/posts", auth, async (req, res) => {
  try {
    const post = new Post({
      content: req.body.content,
      author: req.user.id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener todos los posts
router.get("/posts", async (req, res) => {
  const posts = await Post.find().populate("author", "username email");
  res.json(posts);
});

// Obtener un post por ID
router.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "username email");
  if (!post) return res.status(404).json({ msg: "Post not found" });
  res.json(post);
});

// Editar post propio
router.patch("/posts/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post not found" });
  if (post.author.toString() !== req.user.id)
    return res.status(403).json({ msg: "Unauthorized" });

  post.content = req.body.content || post.content;
  await post.save();
  res.json(post);
});

// Eliminar post propio
router.delete("/posts/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post not found" });
  if (post.author.toString() !== req.user.id)
    return res.status(403).json({ msg: "Unauthorized" });

  await post.deleteOne();
  res.json({ msg: "Post deleted" });
});

module.exports = router;

