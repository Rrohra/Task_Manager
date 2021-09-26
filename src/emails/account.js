const sgMail = require('@sendgrid/mail')

const email_key =process.env.SENDGRID_API_KEY

sgMail.setApiKey(email_key)

/*
sgMail.send({
    to:'rohit123456rohra@gmail.com',
    from:'rohit123456rohra@gmail.com',
    subject:'Hey this is ur second email',
    text:'Enjoy buddy',
}).then(()=>{
    console.log("mail sent")
}).catch((er)=>{
    console.log(er)
})*/                            //for testing


//for sending mails when a new user creates a account at Task Manager
const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from : 'rohit123456rohra@gmail.com',
        subject: 'Are bhai Welcome Welcome Welcome doston',
        text : `Hi ${name}. Thanks for choosing Task Manager App , you can now create ur tasks . Happy managing` 
    }).then(()=>{
        console.log("mail sent")
    }).catch((er)=>{
        console.log(er)
    })
}


const sendByeByeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: "rohit123456rohra@gmail.com",
        subject : 'We are sorry to see you go Away',
        text: `Hi ${name} , its sad to see u go away. Please write back to us so that we can be better next time. Thank you.` 
    }).then(()=>{
        console.log("mail sent")
    }).catch((er)=>{
        console.log(er)
    })
}
module.exports ={
    sendWelcomeEmail,
    sendByeByeEmail
}