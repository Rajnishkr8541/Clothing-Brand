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

        const verifyEmailUrl= `${process.env.FRONTEND_URL}/verify-email?code=${save._id}`
        
        const verifyEmail = await sendEmail({
            sendTo: email,
            subject: 'Verify your email',
            html: verifyEmailTemplate({
                name,
                url: verifyEmailUrl
            } )
        })

        return res.json({
            message: 'User created successfully',
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
