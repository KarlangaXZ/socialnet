const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Ver todos los usuarios
router.get("/admin/users", auth, isAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Eliminar usuario
router.delete("/admin/users/:id", auth, isAdmin, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
  res.json({ msg: "Usuario eliminado" });
});

// Ver todos los posts
router.get("/admin/posts", auth, isAdmin, async (req, res) => {
  const posts = await Post.find().populate("author", "username email");
  res.json(posts);
});

// Eliminar cualquier post
router.delete("/admin/posts/:id", auth, isAdmin, async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post no encontrado" });
  res.json({ msg: "Post eliminado por admin" });
});

// Ver todos los comentarios
router.get("/admin/comments", auth, isAdmin, async (req, res) => {
  const comments = await Comment.find().populate("author", "username");
  res.json(comments);
});

// Eliminar comentario
router.delete("/admin/comments/:id", auth, isAdmin, async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) return res.status(404).json({ msg: "Comentario no encontrado" });
  res.json({ msg: "Comentario eliminado por admin" });
});

module.exports = router;
