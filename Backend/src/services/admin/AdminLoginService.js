const CreateToken = require('../../utility/CreateToken');

const AdminLoginService = async (Request, DataModel) => {
  try {
    const data = await DataModel.findOne({
      email: Request.body.email,
      password: Request.body.password
    }).lean();

    if (!data) {
      return { status: "unauthorized" };
    }

    const token = await CreateToken(data);

    delete data.password; // 🔒 never send password

    return {
      status: "success",
      token,
      data
    };

  } catch (error) {
    return { status: "fail", data: error.toString() };
  }
};

module.exports = AdminLoginService;
