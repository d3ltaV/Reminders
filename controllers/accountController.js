const bcrypt = require('bcrypt');
const Users = require('../models/users');

exports.showRegisterForm = (req, res) => {
    res.render('register');
};
exports.register = async (req, res) => {
    const {username, email, password} = req.body;
    const userExists = await Users.findOne({ where: { email } });
    if (userExists) {
        return res.status(400).send('User already exists');
    }
    if (!username || !email || !password) {
        return res.status(400).send('Please complete all fields!'); //Overidden by HTML
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await Users.create({
        username,
        email,
        password: hashedPassword,
    });

    res.redirect('/accounts/login');
};

exports.showLoginForm = (req, res) => {
    res.render('login');
};
exports.login = async(req, res) => {
    const {email, password} = req.body;
    const user = await Users.findOne({ where: { email } });
    if (!user) {
        return res.status(400).send('User does not exist');
    }
    if (!email || !password) {
        return res.status(400).send('Please complete all fields!'); //Overidden by HTML
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).send('Incorrect password');
    }
    req.session.userId = user.id;
    res.redirect('/tasks/homepage');
};
exports.logout = (req, res) => {
    req.session.destroy(() => {
      res.redirect('/accounts/login');
    });
};

