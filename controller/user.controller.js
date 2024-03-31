const UserModel = require("../model/user.model");

exports.getUsers = async (req,res,next) => {
    try {
        const users = await UserModel.find(); 
        return res.status(200).json({ status: true, data: users});
    } catch (error) {
        throw error;
    }
};