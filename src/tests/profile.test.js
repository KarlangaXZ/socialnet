const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany();

  const res = await request(app).post("/api/register").send({
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  });

  const login = await request(app).post("/api/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = login.body.token;
});

describe("User Profile", () => {
  it("should get user profile", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("testuser");
    expect(res.body.email).toBe("test@example.com");
  });

  it("should update user profile", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "updateduser" });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("updateduser");
  });
});
