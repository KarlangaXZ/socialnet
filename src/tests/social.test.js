const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

let user1Token, user2Token, user2Id;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany();
  await Post.deleteMany();

  // Crear y loguear dos usuarios
  await request(app).post("/api/register").send({
    username: "user1",
    email: "user1@example.com",
    password: "pass123",
  });

  const login1 = await request(app).post("/api/login").send({
    email: "user1@example.com",
    password: "pass123",
  });
  user1Token = login1.body.token;

  await request(app).post("/api/register").send({
    username: "user2",
    email: "user2@example.com",
    password: "pass456",
  });

  const login2 = await request(app).post("/api/login").send({
    email: "user2@example.com",
    password: "pass456",
  });
  user2Token = login2.body.token;

  const user2 = await User.findOne({ email: "user2@example.com" });
  user2Id = user2._id;

  // Crear post de user2
  await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ content: "Post de user2" });
});

describe("Social Graph", () => {
  it("should follow and unfollow a user", async () => {
    const follow = await request(app)
      .post(`/api/users/${user2Id}/follow`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(follow.statusCode).toBe(200);

    const unfollow = await request(app)
      .post(`/api/users/${user2Id}/unfollow`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(unfollow.statusCode).toBe(200);
  });

  it("should return followers and following lists", async () => {
    await request(app)
      .post(`/api/users/${user2Id}/follow`)
      .set("Authorization", `Bearer ${user1Token}`);

    const followers = await request(app)
      .get("/api/users/me/followers")
      .set("Authorization", `Bearer ${user2Token}`);
    expect(followers.statusCode).toBe(200);
    expect(followers.body[0].username).toBe("user1");

    const following = await request(app)
      .get("/api/users/me/following")
      .set("Authorization", `Bearer ${user1Token}`);
    expect(following.statusCode).toBe(200);
    expect(following.body[0].username).toBe("user2");
  });

  it("should return personalized feed", async () => {
    await request(app)
      .post(`/api/users/${user2Id}/follow`)
      .set("Authorization", `Bearer ${user1Token}`);

    const feed = await request(app)
      .get("/api/feed")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(feed.statusCode).toBe(200);
    expect(feed.body.length).toBe(1);
    expect(feed.body[0].content).toBe("Post de user2");
  });
});
