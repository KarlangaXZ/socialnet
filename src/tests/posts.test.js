const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany();
  await Post.deleteMany();

  await request(app).post("/api/register").send({
    username: "postuser",
    email: "post@example.com",
    password: "password123",
  });

  const login = await request(app).post("/api/login").send({
    email: "post@example.com",
    password: "password123",
  });

  token = login.body.token;
});

describe("Post API", () => {
  it("should create a post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Mi primer post" });

    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe("Mi primer post");
  });

  it("should get all posts", async () => {
    await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Post público" });

    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("should edit own post", async () => {
    const post = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Post editable" });

    const res = await request(app)
      .patch(`/api/posts/${post.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Post actualizado" });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe("Post actualizado");
  });

  it("should delete own post", async () => {
    const post = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Post para borrar" });

    const res = await request(app)
      .delete(`/api/posts/${post.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Post deleted");
  });
});
