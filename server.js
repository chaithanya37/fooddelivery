const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 5000;
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Replace with your DB password
  database: "nithish", // Replace with your DB name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// API to fetch food data
app.get("/api/food", (req, res) => {
  const query = "SELECT * FROM food";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Database error");
    } else {
      res.json(results);
    }
  });
});
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
      if (err) {
          console.error('Error checking user:', err);
          return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into database
      const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(insertQuery, [name, email, hashedPassword], (err, results) => {
          if (err) {
              console.error('Error inserting user:', err);
              return res.status(500).json({ error: 'Failed to register user' });
          }

          res.status(200).json({ message: 'User registered successfully' });
      });
  });
});
// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';
// Sign-In Route
app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  // Validation check
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Query to check if the user exists
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // If user not found
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // Optional: Check password hash (if passwords are hashed)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expiration time
    );

    // Successful response
    res.status(200).json({
      message: 'Sign-in successful',
      token,
    });
  });
});


// Add to Cart API
app.post("/api/cart", (req, res) => {
  const { food_id, image_url, name, quantity, price, user_id } = req.body;

  // SQL query to insert data into the cart
  const query = `
    INSERT INTO cart (food_id, image_url, name, quantity, price, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?;
  `;

  // Execute the query
  db.query(
    query,
    [food_id, image_url, name, quantity, price, user_id, quantity],
    (err, results) => {
      if (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ error: "Failed to add item to cart" });
      } else {
        res.status(200).json({ message: "Item added to cart successfully", results });
      }
    }
  );
});
// Fetch Cart Items API
app.get("/api/cart/:user_id", (req, res) => {
  const { user_id } = req.params;

  // SQL query to fetch items for the specific user
  const query = "SELECT * FROM cart WHERE user_id = ?";

  // Execute the query
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching cart items:", err);
      res.status(500).json({ error: "Failed to fetch cart items" });
    } else {
      res.status(200).json(results);
    }
  });
});

app.put("/api/cart/:userId/:foodId", async (req, res) => {
  const { userId, foodId } = req.params;
  const { quantity } = req.body; // The new quantity

  try {
    const cartItem = await Cart.findOne({ user_id: userId, food_id: foodId });
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.delete("/api/cart/:userId/:itemId", (req, res) => {
  const { userId, itemId } = req.params;

  console.log(`Deleting item with cart id: ${itemId} for user: ${userId}`); // Debug log

  // SQL query to delete the cart item based on id
  const query = "DELETE FROM cart WHERE user_id = ? AND id = ?";

  db.query(query, [userId, itemId], (err, results) => {
    if (err) {
      console.error("Error deleting item:", err);
      return res.status(500).json({ error: "Failed to remove item from cart" });
    }

    // If no rows were affected, the item wasn't found
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Item removed from cart successfully" });
  });
});





// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
