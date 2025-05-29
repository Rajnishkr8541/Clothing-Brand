import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

if(!process.env.RESEND_API){
  console.log('Resend API key is set.');
}

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async({sendTo, subject, html}) => {
  try {
    const { data, error } = await resend.emails.send({
    from: 'Clothing <onboarding@resend.dev>',
    to: sendTo,
    subject,
    html,
  });
  
  if (error) {
    console.error({ error });
    return null;
  }
  //console.log('Email sent successfully:', data);
  return data;

  } catch (err) {
    console.log(err);
    return null;
  }
}
export default sendEmail;

