const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Like post
router.post("/posts/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post not found" });

  if (post.likes.includes(req.user.id))
    return res.status(400).json({ msg: "Already liked" });

  post.likes.push(req.user.id);
  await post.save();
  res.json({ msg: "Liked post" });
});

// Unlike post
router.delete("/posts/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post not found" });

  post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
  await post.save();
  res.json({ msg: "Unliked post" });
});

// Comment on post
router.post("/posts/:id/comment", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post not found" });

  const comment = new Comment({
    content: req.body.content,
    post: post._id,
    author: req.user.id,
  });

  await comment.save();
  res.status(201).json(comment);
});

// Delete comment
router.delete("/comments/:id", auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ msg: "Comment not found" });

  if (comment.author.toString() !== req.user.id)
    return res.status(403).json({ msg: "Unauthorized" });

  await comment.deleteOne();
  res.json({ msg: "Comment deleted" });
});

module.exports = router;
