var nodeMailer = require("nodemailer");
var fs = require("fs");
var ejs = require("ejs");

const sender = 'mushariar.test@gmail.com';
const password = 'Mic.testing123';

var transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: sender,
        pass: password
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});



export const sendPasswordReset = function (emailData) {
    // let message = {
    //     from: 'Tester <'+sender+'>',
    //     to: 'Hello Mushariar <mushariar@gmail.com>',
    //     subject: 'Testing mail',
    //     text: 'For clients with plaintext support only',
    //     html: '<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>',
    //     amp: `<!doctype html>
    //     <html ⚡4email>
    //       <head>
    //         <meta charset="utf-8">
    //         <style amp4email-boilerplate>body{visibility:hidden}</style>
    //         <script async src="https://cdn.ampproject.org/v0.js"></script>
    //         <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
    //       </head>
    //       <body>
    //         <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
    //         <p>GIF (requires "amp-anim" script in header):<br/>
    //           <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
    //       </body>
    //     </html>`
    // }

    // emailData.receiver = data.email;
    //           emailData.username = data.memberid;
    //           emailData.name = data.fullname_bn;
    //           emailData.passwordtoken = passrestToken;
    //           emailData.redirecturl = "";

    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log("Email sender verification faild");
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");

            ejs.renderFile(__dirname + "/templates/resetPassword.ejs", { data: emailData }, function (err, htmlBody) {
                if (err) {
                    console.log("Email template render faild");
                    console.log(err);
                } else {

                    let message = {
                        from: 'ভেড়ামারা সমিতি ঢাকা <'+sender+'>',
                        to: emailData.fullname_bn +' <'+emailData.email+'>',
                        subject: 'পাসওয়ার্ড পরিবর্তন করার জন্য অনুরোধ',
                        html: htmlBody
                    }

                    transporter.sendMail(message, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                }
            });
        }
    });

    
};


export const sendAccountCreated = function (newMember, activateAccount) {
    
    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log("Email sender verification faild");
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");

            ejs.renderFile(__dirname + "/templates/accountWelcome.ejs", { data: {Member:newMember, Activate: activateAccount} }, function (err, htmlBody) {
                if (err) {
                    console.log("Email template render faild");
                    console.log(err);
                } else {

                    let message = {
                        from: 'ভেড়ামারা সমিতি ঢাকা <'+sender+'>',
                        to: newMember.fullname_bn +' <'+newMember.email+'>',
                        subject: 'ভেড়ামারা সমিতি ঢাকার পক্ষ থেকে স্বাগতম',
                        //text: 'For clients with plaintext support only',
                        html: htmlBody
                    }

                    transporter.sendMail(message, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                }
            });
        }
    });

    
};