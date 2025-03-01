const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();
const cors = require("cors");
const app = express();

const coreRoutes = require('./core.js');
app.use('/api', coreRoutes);

const exchangeAPIKey = 'a1942e41890ac578245ee2c7';
const newsAPIKey = '3ce6b2cc2ee8491496fb2f93dbba239c';
const Product = require('./models/product');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//const adminRoutes = require('./routes/admin');
//app.use('/admin', adminRoutes);

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, 
            httpOnly: true,
        },
    })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connection to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
    const dataSchema = new mongoose.Schema({
        data: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    });
    
    const DataModel = mongoose.model('Data', dataSchema);
    
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);
const requestSchema = new mongoose.Schema({
    userData: String,
    exchangeData: Object,
    newsData: Object,
    timestamp: Date
});
  
const Request = mongoose.model('Request', requestSchema);
  
function isAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

function isAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).send('Access denied');
    }
    next();
}


// Routes

// Login page
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
    console.log('GET /login called');
    res.render('index', { title: 'Login' });
});

app.post('/login', async (req, res) => {
    console.log('POST /login called');
    const { email, password } = req.body;

    console.log(`Email: ${email}, Password: ${password ? '***' : 'Not Provided'}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).send('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log('Login failed: Incorrect password');
            return res.status(401).send('Invalid email or password');
        }

        // 🛠️ Правильное сохранение сессии:
        req.session.userId = user._id;
        req.session.user = { email: user.email, isAdmin: user.admin };

        console.log('Login successful:', req.session.user);
        res.redirect(user.admin ? '/admin' : '/front');
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).send('Error logging in');
    }
});


// Registration page
app.get('/register', (req, res) => res.render('reg', { title: 'Register' }));

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    console.log('POST /register called');
    console.log(`Received data: username=${username}, email=${email}, passwordLength=${password.length}`);

    if (!password || password.length < 6) {
        console.log('Registration failed: Password too short');
        return res.status(400).send('Password must be at least 6 characters long');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`Registration failed: Email ${email} already in use`);
            return res.status(400).send('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Password hashed successfully for email: ${email}`);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log(`User created successfully: ${username} (${email})`);

        req.session.userId = newUser._id;
        req.session.isAdmin = newUser.admin;
        console.log(`Session created: userId=${newUser._id}, isAdmin=${newUser.admin}`);

        res.redirect('/front'); // arter registration goes to front
    } catch (err) {
        console.error('Error during registration:', err.message);
        res.status(500).send('Error registering user');
    }
});

// Profile page
app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile', { title: 'Profile', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving profile');
    }
});
app.post('/getData', async (req, res) => {
    const userInput = req.body.userInput.toUpperCase(); 

    try {
        const exchangeResponse = await axios.get(
            `https://v6.exchangerate-api.com/v6/${exchangeAPIKey}/latest/${userInput}`
        );
        const newsResponse = await axios.get(
            `https://newsapi.org/v2/everything?q=${userInput}&apiKey=${newsAPIKey}`
        );

        const newRequest = new Request({
            userData: userInput,
            exchangeData: exchangeResponse.data,
            newsData: newsResponse.data,
        });
        await newRequest.save();

        res.render('dataPage', {
            userInput,
            exchangeData: exchangeResponse.data,
            newsData: newsResponse.data,
        });
    } catch (error) {
        console.error('Error while getting data from API:', error.message);
        res.status(500).send('Error while receiving data');
    }
});

  
// GET route to display data on the dataPage
app.get('/dataPage', async (req, res) => {
    const userInput = req.query.userInput;
  
    try {
      // Searching for data in MongoDB by the entered value
      const requestData = await Request.findOne({ userData: userInput }).sort({ timestamp: -1 }).limit(1);
  
      if (!requestData) {
        return res.render('dataPage', {
          userData: userInput,
          exchangeData: null,
          newsData: null,
          message: 'Data not found'
        });
      }
  
      // Display the found data
      res.render('dataPage', {
        userData: requestData.userData,
        exchangeData: requestData.exchangeData,
        newsData: requestData.newsData,
        message: null
      });
    } catch (error) {
      console.error('Error while searching data', error);
      res.status(500).send('Error while searching data');
    }
});

// Administration panel
app.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find(); // Загружаем всех пользователей
        const products = await Product.find(); // Загружаем все продукты

        console.log("✅ Загружены пользователи:", users.length);
        console.log("✅ Загружены товары:", products.length);

        res.render('admin', { title: 'Admin Page', users, products }); // Передаем products в шаблон
    } catch (err) {
        console.error("❌ Ошибка при загрузке admin:", err.message);
        res.status(500).send("Ошибка загрузки admin");
    }
});

// Adding a user via the admin panel
app.post('/admin/add', isAuthenticated, isAdmin, async (req, res) => {
    const { username, email, password } = req.body;
    const isAdmin = req.body.admin ? true : false;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('A user with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, admin: isAdmin });

        await newUser.save();
        res.redirect('/admin');
    } catch (err) {
        console.error('Error adding user:', err.message);
        res.status(500).send('Server error adding user');
    }
});
  

// Editing a user via the admin panel
app.post('/admin/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { username, email, password, admin } = req.body;

    // Check for the presence of the required data
    if (!username || !email) {
        return res.status(400).send('Username and email are required');
    }

    try {
        // Generate updated data
        const updates = {
            username,
            email,
            admin: admin === 'on', // Convert the checkbox value to a boolean
        };

        // If a new password is passed, hash it
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

       // Update the user
        await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.redirect('/admin'); // Redirect to admin page
    } catch (err) {
        console.error('Error editing user:', err.message);
        res.status(500).send('Server error while editing user');
    }
});

// Deleting a user via the admin panel
app.post('/admin/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        console.log("Deleting user ID:", req.params.id); // Add ID check
        const user = await User.findById(req.params.id);

        if (!user) {
            console.log("User not found:", req.params.id);
            return res.status(404).send('User not found');
        }

        await User.findByIdAndDelete(req.params.id); // Delete the user
        res.redirect('/admin');
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).send('Server error deleting user');
    }
});

// Страницы фронта
app.get('/front', isAuthenticated, (req, res) => res.render('front', { title: 'Front' }));
app.get('/catalog', async (req, res) => {
    try {
        const products = await Product.find(); // Загружаем все товары
        res.render('catalog', { title: 'Catalog', products }); // Передаем в EJS
        console.log("Available products:", products)
    } catch (error) {
        console.error('Ошибка при загрузке каталога:', error);
        res.status(500).send('Ошибка при загрузке каталога');
    }
})
app.get('/basket', isAuthenticated, (req, res) => res.render('basket', { title: 'Basket' }));
app.get('/edit_profile', isAuthenticated, (req, res) => res.render('edit_profile', { title: 'Edit Profile' }));

// Выход
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

app.get('/history', async (req, res) => {
    try {
        const history = await Request.find().sort({ timestamp: -1 }).limit(20);
        res.render('history', { title: 'Request History', history });
    } catch (error) {
        console.error("Error loading history page:", error);
        res.status(500).send("Error loading history page");
    }
});

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Твой Gmail
        pass: process.env.EMAIL_PASS, // Пароль приложения (не обычный пароль!)
    },
});

app.post("/send-email", async (req, res) => {
    const { email, status } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const message = status === "On"
        ? "Notifications are enabled ✅"
        : "Notifications are disabled ❌";

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Notification status",
            text: message,
        });

        res.json({ success: true, message: "Notification sent!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending email" });
    }
});

app.get('/get-user-email', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ email: user.email });
    } catch (error) {
        console.error('Error receiving email:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to display geolocation (uses API from core.js)
app.get('/geolocation', async (req, res) => {
    try {
        console.log("📡 Request for geolocation page");

        const response = await axios.get('http://localhost:3000/api/get-location'); 
        const location = response.data.location;

        if (!location) {
            console.error("❌ Error: location is empty");
            return res.render('geolocation', { location: null, error: "Unable to determine location" });
        }

        console.log("✅ Data passed to template:", location);
        res.render('geolocation', { location, error: null });

    } catch (error) {
        console.error("❌ Error loading geolocation page:", error);
        res.render('geolocation', { location: null, error: "Server error" });
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).send('Ошибка при получении списка товаров');
    }
});

app.post('/products', async (req, res) => {
    try {
        console.log("Received product data:", req.body); // ЛОГИРУЕМ, ЧТО ПРИШЛО В ЗАПРОСЕ

        const { name_en, name_ru, description_en, description_ru, image1, image2, image3 } = req.body;

        // Проверяем, есть ли имя у продукта
        if (!name_en || !name_ru) {
            return res.status(400).send("Missing required fields: name_en or name_ru");
        }

        const product = new Product({ 
            name_en, 
            name_ru, 
            description_en, 
            description_ru, 
            images: [image1, image2, image3].filter(Boolean) // Убираем пустые значения
        });

        await product.save();
        console.log("✅ Product added:", product);

        res.redirect('/admin'); // Перенаправляем в админку после добавления
    } catch (error) {
        console.error("❌ Ошибка при добавлении товара:", error);
        res.status(500).send('Ошибка при добавлении товара');
    }
});



app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        res.json({ message: 'Товар удален', product });
    } catch (error) {
        res.status(500).send('Ошибка при удалении товара');
    }
});

// Старт сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));