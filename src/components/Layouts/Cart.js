import React, { useEffect, useState } from "react";
import "./Cart.css";
import useUserStore from "../../useUserStore";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const user = useUserStore((state) => state.user);
  console.log("User object in Cart component:", user);

  useEffect(() => {
    if (!user || !user.id) {
      console.error("User not logged in");
      return;
    }

    fetch(`http://localhost:5000/api/cart/${user.id}`)
      .then((response) => {
        console.log("Fetch response:", response);
        if (!response.ok) {
          throw new Error("Failed to fetch cart items");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Cart items data:", data);
        setCartItems(data);
      })
      .catch((error) => console.error("Error fetching cart items:", error));
  }, [user]);

  const handleRemove = (itemId) => {
    fetch(`http://localhost:5000/api/cart/${user.id}/${itemId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to remove item, status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCartItems(cartItems.filter((item) => item.id !== itemId));
      })
      .catch((error) => console.error("Error removing item:", error));
  };
  

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table className="cart-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="cart-item-image"
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${parseFloat(item.price).toFixed(2)}</td>
                <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleRemove(item.id)} className="remove-btn">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Cart;
 