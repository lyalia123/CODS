# **📌 CODS User Management System**

## **🚀 Project Description**
This project is a **user management system** with authentication, administration, and user role management. Users can **register, log in, and manage their profiles**, while administrators can **manage users and products**.

Additionally, the system includes **APIs** for **city information** and **currency exchange rates**.

---

## **🚀 Features**
### **User Authentication**
- Secure registration and login
- Session-based authentication

### **Admin Panel**
- **User Management**
  - View all users
  - Add new users
  - Edit user details
  - Delete users
- **Product Management**
  - View all products
  - Add new products
  - Edit product details
  - Delete products

### **User Profile Management**
- Secure Password Hashing (`bcrypt.js`)
- MongoDB Atlas Integration

### **City & Weather API**
- Fetch city information and weather updates

### **Currency Exchange API**
- Convert between currencies using real-time exchange rates

---

## **🛠️ Installation Guide**
### **1. Install Dependencies**
```bash
npm install
```

### **2. Create `.env` File**
Create a `.env` file in the root directory and add:
```
OPENWEATHER_API_KEY=d915ea843517205d620b8aaaf5e9f869
GEOPOSITION_API_KEY=67a79380cc3c0491140970mkxc2b993
NEWS_API_KEY=3ce6b2cc2ee8491496fb2f93dbba239c
MONGO_URI=mongodb+srv://inkarusurb:JaxM994i5DxyEsyG@cluster0.fhuvs.mongodb.net/user_cods?retryWrites=true&w=majority
PORT=3000
SESSION_SECRET=3f4a9cb3c14d17d5e0e1c6a8e74176f5f6a7b4f0f9b9c3e1d8c1c91b0e6e8e23
SENDGRID_API_KEY=227NJHD9CT8Z26SYW9PYRB2U
EMAIL_USER= Alpieva60023081@gmail.com
EMAIL_PASS=aapm qsjy ngcw fnne

```

### **3. Start the Server**
```bash
node server.js
```
The server will run at `http://localhost:3000`.

---

## **📌 User Roles**
### **Regular Users**
- Register and log in
- Access the profile page

### **Administrators**
- Access the `/admin` panel
- Manage users
- Manage products

---

## **📌 API Endpoints**
### **Authentication**
| Method | Route       | Description            |
|--------|------------|------------------------|
| GET    | /login     | Renders the login page |
| POST   | /login     | Logs in a user         |
| GET    | /register  | Renders the registration page |
| POST   | /register  | Registers a new user   |
| POST   | /logout    | Logs out the user      |

### **Admin Panel**
| Method | Route            | Description                          |
|--------|-----------------|--------------------------------------|
| GET    | /admin          | Admin panel (User Management)       |
| GET    | /admin/products | Admin panel (Product Management)    |
| POST   | /admin/add      | Add a new user                      |
| POST   | /admin/edit/:id | Edit user details                   |
| POST   | /admin/delete/:id | Delete a user                     |

### **City API**
| Method | Route          | Description |
|--------|---------------|-------------|
| GET    | /api/city/:name | Fetch city information (weather, population, location) |

### **Currency API**
| Method | Route                  | Description |
|--------|------------------------|-------------|
| GET    | /api/currency/:from/:to | Convert currency from one to another |

---

## **📌 How to Use the Admin Page?**
### **1. Logging in as Admin**
1. Open `/login`
2. Enter **admin credentials** (email: `admin@cods.com`, password: `1234567`).
3. After logging in, you will be redirected to `/admin`.

### **2. Managing Users**
- **View Users**: See all registered users.
- **Add User**: Enter a new username, email, and password.
- **Edit User**: Modify user details, including admin status.
- **Delete User**: Remove a user from the database.

**User Form Example:**
```html
<label>Username:</label>
<input type="text" name="username" required>

<label>Email:</label>
<input type="email" name="email" required>

<label>Password:</label>
<input type="password" name="password" required>

<label>Admin:</label>
<input type="checkbox" name="admin">

<button type="submit">Add User</button>
```

### **3. Managing Products**
- **View Products**: `/admin/products`
- **Add Product**: Enter product name, description, and images.
- **Edit Product**: Modify product details.
- **Delete Product**: Remove product from the database.

**Product Form Example:**
```html
<label>Name (EN):</label>
<input type="text" name="name_en" required>

<label>Name (RU):</label>
<input type="text" name="name_ru" required>

<label>Description (EN):</label>
<textarea name="description_en" required></textarea>

<label>Description (RU):</label>
<textarea name="description_ru" required></textarea>

<label>Image 1:</label>
<input type="text" name="image1" required>

<label>Image 2:</label>
<input type="text" name="image2">

<label>Image 3:</label>
<input type="text" name="image3">

<button type="submit">Add Product</button>
```

---

## **📌 How to Add an Admin User?**
### **Method 1: Create via MongoDB**
1. Open **MongoDB Atlas** or **Compass**.
2. Locate the `users` collection.
3. Insert a new document:
```json
{
  "username": "admin",
  "email": "admin@cods.com",
  "password": "<hashed_password>",
  "admin": true,
  "createdAt": { "$date": "2025-01-27T03:40:34.412Z" }
}
```
4. Replace `<hashed_password>` with a **bcrypt hash**.

### **Method 2: Use an Express Route**
Add this route to `server.js`:
```js
app.get('/create-admin', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('your_password', 10);
        const newAdmin = new User({
            username: 'admin',
            email: 'admin@cods.com',
            password: hashedPassword,
            admin: true,
        });
        await newAdmin.save();
        res.send('Admin created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating admin');
    }
});
```

---

## **📌 Troubleshooting**
### **1. Cannot Access `/admin`**
✅ Make sure your user has `admin: true` in the database.  
✅ Ensure `req.session.isAdmin` is being set after login.

### **2. MongoDB Connection Issues**
✅ Verify `MONGO_URI` in `.env`.  
✅ Check if your **MongoDB Atlas IP whitelist** is configured.

### **3. Session Not Persisting**
✅ Enable cookies in your browser.  
✅ Check `session` configuration in `server.js`.

---

## **👥 Contributors**
- **Ussurbayeva Inkar**
- **Ablanova Dariya**
- **Alpieva Leila**

---

### **✨ What's New?**
✔ Added **Admin Panel** documentation  
✔ Improved **Product Management** instructions  
✔ Updated **Troubleshooting** section 🚀
