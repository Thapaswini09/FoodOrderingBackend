const Validation = require("./validation");
const users = require("./userSchema");
// const bcrypt=require('bcrypt');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  AdminAddItemsModel,
  CartModel,
  ordersModel,
} = require("../Admin/adminSchema");

class UserController {
  async createUser(req, res) {
    try {
      const schema = Validation();
      const { error, value } = await schema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      const salt = await bcrypt.genSalt(10);
      value.password = await bcrypt.hash(value.password, salt);
      const email = await users.findOne({ email: value.email });
      if (email) {
        return res.status(400).json({ message: "email already exist" });
      }
      const userData = new users(value);
      await userData.save();
      return res.status(201).json({ message: "user created successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Please enter email and password" });
      }
      const user = await users.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }
      const token = jwt.sign({ id: user }, process.env.USER_SECRET_KEY, {
        expiresIn: "1h",
      });
      res.cookie("userAuthToken", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // after 1hr it will expire
      });
      return res
        .status(200)
        .json({ message: "Login successfully", data: user, token: token });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // async getAllItemsData(req,res){
  //     try {
  //         const items=await AdminAddItemsModel.find({});
  //         return res.status(200).json({ message: 'Items fetched successfully',data:items });
  //     } catch (error) {
  //         return res.status(500).json({ message: 'Internal server error' });
  //     }
  // }
  async getAllItemsData(req, res) {
    try {
      const { search = "", foodType = "" } = req.query;
      const query = {};
      if (foodType) {
        query.foodType = { $regex: foodType, $options: "i" };
      }
      if (search) {
        query.$or = [
          { foodName: { $regex: search, $options: "i" } },
          { resturentName: { $regex: search, $options: "i" } },
          { foodType: { $regex: search, $options: "i" } },
        ];
      }
      const items = await AdminAddItemsModel.find(query);
      return res
        .status(200)
        .json({ message: "Items fetched successfully", data: items });
    } catch (error) {
      console.error("Error fetching items:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async cartData(req, res) {
    try {
      const { id, quantity } = req.body;
      if (!id) return res.status(400).json({ message: "Item ID is required" });
      if (!quantity || quantity < 1)
        return res.status(400).json({ message: "Quantity must be at least 1" });

      // const decoded = jwt.verify(req.cookies.userAuthToken,process.env.USER_SECRET_KEY);
      const userId = req.user.id._id;

      const item = await AdminAddItemsModel.findById(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      const cartItem = new CartModel({
        userId,
        itemId: id,
        quantity: quantity,
      });
      await cartItem.save();
      return res
        .status(200)
        .json({ message: "Items Added successfully", data: cartItem });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCartData(req, res) {
    try {
      // const decoded = jwt.verify(req.cookies.userAuthToken,process.env.USER_SECRET_KEY);
      const userId = req.user.id._id;

      const data = await CartModel.find({ userId });
      const itemsdatas = await AdminAddItemsModel.aggregate([
        { $match: { _id: { $in: data.map((item) => item.itemId) } } },
        {
          $lookup: {
            from: "carts",
            localField: "_id",
            foreignField: "itemId",
            as: "carts",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "users",
                },
              },

              {
                $lookup: {
                  from: "adminadditems",
                  localField: "itemId",
                  foreignField: "_id",
                  as: "adminadditems",
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            carts: 1,
          },
        },
      ]);
      return res
        .status(200)
        .json({ message: "Items fetched successfully", data: itemsdatas });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async deleteCartData(req, res) {
    try {
      const id = req.params.id;

      if (!id)
        return res.status(400).json({ message: "Cart item ID is required" });
      await CartModel.findByIdAndDelete(id);
      return res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  //Single Order
  async orderdData(req, res) {
    try {
      const { id } = req.body;
      if (!id)
        return res.status(400).json({ message: "Cart item ID is required" });

      const cartItem = await CartModel.findById(id);
      if (!cartItem)
        return res.status(404).json({ message: "Cart item not found" });

      // Store the cart item data in orders collection before deleting
      const orderData = new ordersModel({
        userId: cartItem.userId,
        itemId: cartItem.itemId,
        quantity: cartItem.quantity,
      });
      await orderData.save();
      // Now delete the cart item
      await CartModel.findByIdAndDelete(id);
      return res
        .status(201)
        .json({ message: "Order placed successfully", order: orderData });
    } catch (error) {
      console.error("Error in orderdData:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  //Multiple Orders
  async allOrderdata(req, res) {
    try {
      const { cartIds } = req.body;
      if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
        return res.status(400).json({ message: "Cart item IDs are required" });
      }

      const placedOrders = [];

      for (const id of cartIds) {
        const cartItem = await CartModel.findById(id);
        if (!cartItem) {
          console.warn(`Cart item with ID ${id} not found`);
          continue; // Skip this item and move to the next
        }

        const orderData = new ordersModel({
          userId: cartItem.userId,
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
        });

        await orderData.save();
        await CartModel.findByIdAndDelete(id);
        placedOrders.push(orderData);
      }

      return res.status(201).json({
        message: "Orders placed successfully",
        orders: placedOrders,
      });
    } catch (error) {
      console.error("Error in allOrderdata:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOrdersData(req, res) {
    try {
      const userId = req.user.id._id;

      const data = await ordersModel.find({ userId });
      const itemsdatas = await AdminAddItemsModel.aggregate([
        { $match: { _id: { $in: data.map((item) => item.itemId) } } },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "itemId",
            as: "orders",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "users",
                },
              },

              {
                $lookup: {
                  from: "adminadditems",
                  localField: "itemId",
                  foreignField: "_id",
                  as: "adminadditems",
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            orders: 1,
          },
        },
      ]);
      return res
        .status(200)
        .json({ message: "Items fetched successfully", data: itemsdatas });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new UserController();
