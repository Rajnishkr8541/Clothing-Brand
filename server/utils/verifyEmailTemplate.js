const verifyEmailTemplate = (name, url) => {
  return `
            <p>Dear ${name},</p>
            <title>Verify your email</title>        
             <a href= ${url} style="color:white; background:green" margin-top:10px > Verify Email</a>

    `;
};
export default verifyEmailTemplate;