import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

if(!process.env.RESEND_API){
    console.log('Please set the RESEND_API environment variable');
    
}
const resend = new Resend(process.env.RESEND_API);

const sendEmail = async({sendTo, subject, html})=>{
    try {
        const { data, error } = await resend.emails.send({
    from: 'clothing <onboarding@resend.dev>',
    to: sendTo,
    subject: subject,
    html: html,
  });
       if (error) {
    return console.error({ error });
  }
   
    } catch (error) {
        console.log('Error sending email', error);
        
    }
}

(async function () {
  

  

  console.log({ data });
})();