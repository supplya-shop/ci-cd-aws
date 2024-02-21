const { updateUser } = require("../controllers/user");
const User = require("../models/User");

jest.mock("../models/User");

describe("updateUser", () => {
  it("should update user details except password", async () => {
    const userId = "655759193c9898001c57f05f";
    const updates = {
      firstName: "John",
      lastName: "Doe",
      email: "tester1@gmail.com",
      password: "newPassword", // Including password in updates
    };

    // Mock the User.findByIdAndUpdate method
    User.findByIdAndUpdate.mockResolvedValueOnce({ _id: userId, ...updates });

    const req = { params: { id: userId }, body: updates };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateUser(req, res);

    // Expect that User.findByIdAndUpdate was called with correct arguments
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      {
        $set: {
          firstName: "John",
          lastName: "Doe",
          email: "tester1@gmail.com",
        },
      },
      { new: true }
    );

    // Expect status code 200 and user details (excluding password) to be returned
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User updated successfully",
      User: { _id: userId, ...updates },
    });
  });

  it("should handle user not found", async () => {
    const userId = "655759193c9898001c57f05f";
    const updates = {
      firstName: "John",
      lastName: "Doe",
      email: "tester1@gmail.com",
    };

    // Mocking User.findByIdAndUpdate to return null (user not found)
    User.findByIdAndUpdate.mockResolvedValueOnce(null);

    const req = { params: { id: userId }, body: updates };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateUser(req, res);

    // Expect status code 404 and error message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should handle internal server error", async () => {
    const userId = "655759193c9898001c57f05f";
    const updates = {
      firstName: "John",
      lastName: "Doe",
      email: "tester1@gmail.com",
    };

    // Mocking User.findByIdAndUpdate to throw an error
    User.findByIdAndUpdate.mockRejectedValueOnce(new Error("Database error"));
    const req = { params: { id: userId }, body: updates };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateUser(req, res);

    // Expect status code 500 and error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: "Database error" }, // Updated error message
    });
  });
});
