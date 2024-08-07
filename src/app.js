const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");

require("./db/conn");
const Register = require("./models/registers");
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);

app.get("/", (req, res) => {
    res.render("index"); // Change this to the correct view if needed
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/register", async (req, res) => {
    try {
        console.log(req.body); // Log the entire body to check the received data
        const { username, email, password, number } = req.body;

        // Check if the number is provided and not null
        if (!number) {
            return res.status(400).send("Number is required");
        }

        // Create a new user with the received data
        const registerEmployee = new Register({
            username,
            email,
            password,
            number
        });

        // Save the new user
        const registered = await registerEmployee.save();
        
        console.log('Saved to database:', registered); // Log the saved data

        // Respond with a success message
        res.status(201).send('Registration successful');
    } catch (e) {
        console.error('Error saving to database:', e); // Log the error
        res.status(400).send(e);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { number, password } = req.body;
        const user = await Register.findOne({ number });

        if (user && user.password === password) {
            res.status(201).render("index");
        } else {
            res.status(400).send("Invalid credentials");
        }
    } catch (e) {
        console.error('Login error:', e); // Log the error
        res.status(400).send(e);
    }
});

app.listen(port, () => {
    console.log(`Server is running at port no. ${port}`);
});
