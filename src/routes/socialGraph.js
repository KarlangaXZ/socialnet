const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middlewares/auth");

// Seguir a un usuario
router.post("/users/:id/follow", auth, async (req, res) => {
  if (req.user.id === req.params.id)
    return res.status(400).json({ msg: "No puedes seguirte a ti mismo" });

  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow || !currentUser)
    return res.status(404).json({ msg: "Usuario no encontrado" });

  if (currentUser.following.includes(userToFollow._id))
    return res.status(400).json({ msg: "Ya estás siguiendo a este usuario" });

  currentUser.following.push(userToFollow._id);
  userToFollow.followers.push(currentUser._id);

  await currentUser.save();
  await userToFollow.save();

  res.json({ msg: "Siguiendo al usuario" });
});

// Dejar de seguir
router.post("/users/:id/unfollow", auth, async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const userToUnfollow = await User.findById(req.params.id);

  if (!currentUser || !userToUnfollow)
    return res.status(404).json({ msg: "Usuario no encontrado" });

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== req.params.id
  );
  userToUnfollow.followers = userToUnfollow.followers.filter(
    (id) => id.toString() !== req.user.id
  );

  await currentUser.save();
  await userToUnfollow.save();

  res.json({ msg: "Dejaste de seguir al usuario" });
});

// Lista de seguidos
router.get("/users/me/following", auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate("following", "username email");
  res.json(user.following);
});

// Lista de seguidores
router.get("/users/me/followers", auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate("followers", "username email");
  res.json(user.followers);
});

// Feed personalizado
router.get("/feed", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const posts = await Post.find({ author: { $in: user.following } })
    .sort({ createdAt: -1 })
    .populate("author", "username");
  res.json(posts);
});

module.exports = router;
