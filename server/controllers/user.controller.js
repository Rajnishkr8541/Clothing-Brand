import UserModel from '../models/user.model.js';
import bcrypt from 'bcrypt';

export async function registerUserController(req, res) {
    try {
        const {name, email, password} = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required',
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({email})
        if (user) {
            return res.status(400).json({
                message: 'User already exists',
                error: true,
                success: false
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const payload = {
            name,
            email,
            password: hashedPassword
        }
        const newuser = await UserModel.create(payload)
        const save = await newuser.save()
        
        const verifyEmail = await sendEmail({
            sendTo: email,
            subject: 'Verify your email',
            html: `<h1>Welcome to our platform, ${name}</h1>
            <p>Please verify your email by clicking the link below</p>
            <a href="http://localhost:3000/verify/${newuser._id}">Verify Email</a>`
        })
        
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
            error: true,
            success: false
        })
    }

}
