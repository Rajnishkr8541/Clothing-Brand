const auth = (req, res, next) =>{

    try {
        console.log("Cookies:", req.cookies);
        const token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1]; 
        console.log("token:", token);
        
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
        
    }
}
export default auth;