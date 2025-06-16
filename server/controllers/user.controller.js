import UserModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import sendEmail from '../config/sendEmail.js';

export async function registerUserController(req, res) {
    try {
        const {name, email, password} = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'provide Email, Name, and Password',
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({email})
        if (user) {
            return res.json({
                message: 'User already exists',
                error: true,
                success: false,
            })
        }
        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)

        const payload = {
            name,
            email,
            password: hashPassword
        }
        const newUser = await UserModel(payload)
        const save = await newUser.save()

        const verifyEmailUrl= `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`
        
        const verifyEmail = await sendEmail({
            sendTo: email,
            subject: 'Verify your email',
            html: verifyEmailTemplate({
                name,
                url: verifyEmailUrl
            } )
        })

        return res.json({
            message: 'User Created Successfully',
            error: false,
            success: true,
            data: save
        })
        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        })
    }

}

export async function verifyEmailController(req, res){
    try {
        const {code} = req.body

        const user = await UserModel.findOne({_id: code})

        if (!user) {
            return res.status(404).json({
                message: 'Invalid verification code',
                error: true,
                success: false
            })
        }
    const updatedUser = await UserModel.updateOne({_id : code},{
        verify_email: true
    })
        return res.json({
            message: 'Email verified successfully',
            error: false,
            success: true,
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        })
    }
}

//LOGIN

export async function loginController(req, res){
    try {
        const {email, password}= req.body

        const user = await UserModel.findOne({email})
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        if(user.status!== "Active"){
            return res.status(400).json({
                message: 'Account is not active',
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password)

        if(!checkPassword){
            res.status(400).json({
                message: 'Invalid credentials',
                error: true,
                success: false
            })
        }




    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}