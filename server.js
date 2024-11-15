const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const accountRoutes = require('./routes/accountRoutes');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use('/tasks', taskRoutes);
app.use('/accounts', accountRoutes);
const subscriptionRoutes = require('./routes/notificationRoutes'); // Adjust the path as necessary

app.use(subscriptionRoutes); // This will make the routes available at /subscription/subscribe, /subscription/unsubscribe, etc.

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("Server is running!");
})
