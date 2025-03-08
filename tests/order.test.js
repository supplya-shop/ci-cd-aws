// const Order = require("../models/Order");
// const User = require("../models/User");
// const Product = require("../models/Product");
// const { getOrdersByUserId } = require("../controllers/order");
// const { StatusCodes } = require("http-status-codes");

// jest.mock("../models/User");
// jest.mock("../models/Order");
// jest.mock("../models/Product");

// describe("getOrdersByUserId", () => {
//   let mockReq, mockRes;

//   beforeEach(() => {
//     mockReq = {
//       params: { id: "user123" },
//       query: { page: "1", limit: "10", search: "" },
//     };
//     mockRes = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     jest.clearAllMocks();
//   });

//   it("should return orders for a vendor", async () => {
//     User.findById.mockResolvedValue({ _id: "user123", role: "vendor" });
//     Product.find.mockResolvedValue([{ _id: "product1" }, { _id: "product2" }]);
//     Order.find.mockResolvedValue([
//       { _id: "order1", user: "user123", orderItems: [{ product: "product1" }] },
//     ]);
//     Order.countDocuments.mockResolvedValue(1);

//     await getOrdersByUserId(mockReq, mockRes);

//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         status: true,
//         message: "Orders fetched successfully",
//         totalOrders: 1,
//       })
//     );
//   });

//   it("should return orders for a customer", async () => {
//     User.findById.mockResolvedValue({ _id: "user123", role: "customer" });
//     Order.find.mockResolvedValue([
//       { _id: "order2", user: "user123", orderItems: [{ product: "product2" }] },
//     ]);
//     Order.countDocuments.mockResolvedValue(1);

//     await getOrdersByUserId(mockReq, mockRes);

//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         status: true,
//         message: "Orders fetched successfully",
//         totalOrders: 1,
//       })
//     );
//   });

//   it("should return 404 if user is not found", async () => {
//     User.findById.mockResolvedValue(null);

//     await getOrdersByUserId(mockReq, mockRes);

//     expect(mockRes.status).toHaveBeenCalledWith(404);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       status: false,
//       message: "User not found",
//     });
//   });

//   it("should return 404 if no orders are found", async () => {
//     User.findById.mockResolvedValue({ _id: "user123", role: "customer" });
//     Order.find.mockResolvedValue([]);
//     Order.countDocuments.mockResolvedValue(0);

//     await getOrdersByUserId(mockReq, mockRes);

//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       status: false,
//       message: "No orders found for this user",
//       data: [],
//     });
//   });

//   it("should return 500 on error", async () => {
//     User.findById.mockRejectedValue(new Error("Database error"));

//     await getOrdersByUserId(mockReq, mockRes);

//     expect(mockRes.status).toHaveBeenCalledWith(500);
//     expect(mockRes.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         status: false,
//         message: expect.stringContaining("Failed to fetch orders"),
//       })
//     );
//   });
// });
