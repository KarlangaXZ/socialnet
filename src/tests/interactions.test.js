const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

let token, postId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany();
  await Post.deleteMany();
  await Comment.deleteMany();

  await request(app).post("/api/register").send({
    username: "interactuser",
    email: "interact@example.com",
    password: "password123",
  });

  const login = await request(app).post("/api/login").send({
    email: "interact@example.com",
    password: "password123",
  });

  token = login.body.token;

  const postRes = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ content: "Post para interacción" });

  postId = postRes.body._id;
});

describe("Post Interactions", () => {
  it("should like a post", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("should unlike a post", async () => {
    await request(app)
      .post(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("should add and delete a comment", async () => {
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comment`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "¡Buen post!" });

    expect(commentRes.statusCode).toBe(201);

    const deleteRes = await request(app)
      .delete(`/api/comments/${commentRes.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
  });
});
