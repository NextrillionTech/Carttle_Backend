const nodemailer = require("nodemailer");

const sendMail = (req, res) => {
    const { name, email, queryType, description } = req.body;

    const auth = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "skanoujia9@gmail.com",
            pass: "xlik dziv lqyo edcn"
        }
    });

    const receiver = {
        from: "skanoujia9@gmail.com",
        to: "skanoujia9@gmail.com",
        subject: queryType, 
        text: `Name: ${name}\nEmail: ${email}\nDescription: ${description}`
    };

    auth.sendMail(receiver, (error, emailResponse) => {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).send("Failed to send email.");
        }
        console.log("Email sent successfully!");
        res.send("Email sent successfully!");
    });
};

module.exports = sendMail;
