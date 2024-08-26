import User from "../models/userModel.js";
import Validator from "validatorjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import reply from "../common/reply.js";
import Token from "../models/tokenModel.js";
import crypto from "crypto";
import Mail from "../common/Mail.js";

function makeid() {
  return crypto.randomBytes(20).toString("hex");
}

export default {
  // user registration:
  async userRegister(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      let validation = new Validator(request, {
        name: "required|string",
        email: "required|email",
        password: "required_if:role,0|min:8",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      const exist = await User.findOne({ email: request.email }).sort(
        "-created_at"
      );
      if (exist) {
        return res.json(reply.failed("This email is already exists!"));
      }
      request.password = bcrypt.hashSync(request.password);
      const user = await User.create(request);
      return res.json(reply.success("User Created Successfully!!", user));
    } catch (err) {
      console.log("err", err);
      return res.json(reply.failed("Something Went Wrong!"));
    }
  },

  // user login:
  async userLogin(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      let validation = new Validator(request, {
        email: "required|email",
        password: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      const user = await User.findOne({
        email: request.email.toString().toLowerCase(),
      }).sort("-created_at");
      if (!user) {
        return res.json(reply.failed("The selected email is invalid"));
      }
      if (!user) {
        return res.json(reply.failed("User does not exist!"));
      }
      const passwordIsvalid = bcrypt.compareSync(
        request.password,
        user.password
      );
      if (!passwordIsvalid) {
        return res.json(reply.failed("Password Incorrect!"));
      }
      const token_id = makeid();
      const token = jwt.sign(
        { user_id: user._id, tid: token_id },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      );
      await Token.create({ token_id, user_id: user._id });
      const { password, ...responseUser } = user._doc;
      return res.json(
        reply.success("You are logged in successfully.", {
          responseUser,
          token: token,
        })
      );
    } catch (err) {
      return res.json(reply.failed("Something Went Wrong!"));
    }
  },

  // User Logout
  async logout(req, res) {
    try {
      let _id = req.user._id;
      await Token.deleteMany({ user_id: _id });
      return res.json(reply.success("User logged out successfully!!"));
    } catch (err) {
      return res.json(reply.failed("Unable to logout!"));
    }
  },

  //Forgot password
  async forgetPassword(req, res) {
    try {
      let request = req.body;
      let validation = new Validator(request, {
        email: "required|email",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      let user = await User.findOne({ email: request.email });
      if (!user) {
        return res.json(reply.failed("User Not Found"));
      }
      const randomstring = Math.random().toString(36).slice(-8);
      let newPassword = bcrypt.hashSync(randomstring);
      let userUpdate = await User.findByIdAndUpdate(
        { _id: user._id },
        {
          $set: {
            password: newPassword,
          },
        }
      );
      Mail.send(
        request.email,
        "" + `Your Password For Verifying: "${randomstring}"`
      );
      if (userUpdate) {
        return res.json(
          reply.success("Password send to your email successfully")
        );
      }
    } catch (err) {
      return res.json(reply.failed("some error occured", err));
    }
  },

  // Update UserProfile
  async updateUsersProfile(req, res) {
    try {
      let request = req.body;
      const { name, description, id } = req.body;
      if (!request) {
        return res.json(reply.failed("All input is required"));
      }
      const user = await User.findById({ _id: req.user.id });
      if (!user) {
        return res.json(reply.failed("User not found!!"));
      }
      if (name) {
        const users = await User.findOneAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              phone: req.body.phone,
              name: req.body.name,
              email: req.body.email,
            },
          },
          { new: true }
        );

        if (users) {
          return res.status(200).send({
            status_code: 200,
            users: users,
            message: "User updated successfully.",
          });
        }
      } else if (name && !file && !description) {
        const users = await User.findOneAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              // image: req.file.filename,
              name: req.body.name,
              // description:req.body.description
            },
          },
          { new: true }
        );

        if (users) {
          return res.status(200).send({
            status_code: 200,
            users: users,
            message: "User updated successfully.",
          });
        }
      } else if (file && !name && !description) {
        const users = await User.findOneAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              image: req.file.filename,
              // name:req.body.name,
              // description:req.body.description
            },
          },
          { new: true }
        );

        if (users) {
          return res.status(200).send({
            status_code: 200,
            users: users,
            message: "User updated successfully.",
          });
        }
      } else if (description && !name && !file) {
        const users = await User.findOneAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              // image: req.file.filename,
              // name:req.body.name,
              description: req.body.description,
            },
          },
          { new: true }
        );

        if (users) {
          return res.status(200).send({
            status_code: 200,
            users: users,
            message: "User updated successfully.",
          });
        }
      } else if (name && file && !description) {
        const users = await User.findOneAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              image: req.file.filename,
              name: req.body.name,
              // description:req.body.description
            },
          },
          { new: true }
        );

        if (users) {
          return res.status(200).send({
            status_code: 200,
            users: users,
            message: "User updated successfully.",
          });
        }
      } else if (name && !file && description) {
        const users = await User.findOneAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              // image: req.file.filename,
              name: req.body.name,
              description: req.body.description,
            },
          },
          { new: true }
        );

        if (users) {
          return res.status(200).send({
            status_code: 200,
            users: users,
            message: "User updated successfully.",
          });
        }
      } else if (!name && file && description) {
        const users = await User.findOneAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              image: req.file.filename,
              // name:req.body.name,
              description: req.body.description,
            },
          },
          { new: true }
        );

        if (users) {
          return res.status(200).send({
            status_code: 200,
            users: users,
            message: "User updated successfully.",
          });
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send(err);
    }
  },

  async updateProfile(req, res) {
    try {
      let request = req.body;
      const { name, description, id } = req.body;
      if (!request) {
        return res.json(reply.failed("All input is required"));
      }
      const user = await User.findById({ _id: req.user.id });
      if (!user) {
        return res.json(reply.failed("User not found!!"));
      }
      const users = await User.findOneAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            phone: req.body.phone,
            name: req.body.name,
            email: req.body.email,
          },
        },
        { new: true }
      );

      if (users) {
        return res.status(200).send({
          status_code: 200,
          users: users,
          message: "User updated successfully.",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send(err);
    }
  },

  async getUserById(req, res) {
    let user = await User.findById(req.user._id);
    return res.status(200).send({ user });
  },

  async getUsers(req, res) {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
