import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import sendEmail from "../config/sendEmail.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";

console.log("UserModel loaded:", typeof UserModel);

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "provide Email, Name, and Password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({
        message: "User already exists",
        error: true,
        success: false,
      });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashPassword,
    };
    const newUser = await UserModel(payload);
    const save = await newUser.save();

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`;

    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: "Verify your email",
      html: verifyEmailTemplate({
        name,
        url: verifyEmailUrl,
      }),
    });

    return res.json({
      message: "User Created Successfully",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(req, res) {
  try {
    const { code } = req.body;

    const user = await UserModel.findOne({ _id: code });

    if (!user) {
      return res.status(404).json({
        message: "Invalid verification code",
        error: true,
        success: false,
      });
    }
    const updatedUser = await UserModel.updateOne(
      { _id: code },
      {
        verify_email: true,
      }
    );
    return res.json({
      message: "Email verified successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

//LOGIN

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "provide email, password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not register",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Contact to Admin",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: false,
      sameSite: "None",
    };
    res.cookie("accessToken", accesstoken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error); 
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//LOGOUT CONTROLLER
export async function logoutController(req,res){


  
  try {

    const userid = req.userId; //middleware  

    const cookiesOption = {
      httpOnly: true,
      secure: false,
      sameSite: "None",
    };
    res.clearCookie("accessToken",cookiesOption)
    res.clearCookie("refreshToken",cookiesOption)

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
      refresh_token: "",
    })

    return res.json({
      message: "Logout Scuccessfully",
      error: false,
      success: true,     
    })
    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,

    });

  }
}

//UPLOAD USER IMAGE
export async function uploadAvatar(req,res){

  try {
    const userId = req.userId;
    const image = req.file;
    const upload = await uploadImageCloudinary(image);

    const updateUser = await UserModel.findByIdAndUpdate(userId,{
      avatar: upload.url,
      

    })

    return res.json({
      message: "Image Uploaded Sucessfully",
      error: false,
      success: true,
      data: upload
    })

    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    })
    
  }

}
