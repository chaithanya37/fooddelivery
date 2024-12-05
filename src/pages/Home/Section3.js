import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Cards from "../../components/Layouts/Cards";
import { Link } from "react-router-dom";
import useUserStore from "../../useUserStore";

const Section3 = () => {
  const [foodData, setfoodData] = useState([]);
  const user = useUserStore((state) => state.user);
  console.log("in section check",user);

  useEffect(() => {
    fetch("http://localhost:5000/api/food")
      .then((response) => response.json())
      .then((data) => setfoodData(data))
      .catch((error) => console.error("Error fetching food:", error));
  }, []);

  const renderRatingIcons = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (rating > 0.5) {
        stars.push(<i key={i} className="bi bi-star-fill"></i>);
        rating--;
      } else if (rating > 0 && rating < 1) {
        stars.push(<i key={`half${i}`} className="bi bi-star-half"></i>);
        rating--;
      } else {
        stars.push(<i key={`empty${i}`} className="bi bi-star"></i>);
      }
    }
    return stars;
  };

  const onAddToCart = async (food_id, image, name, quantity, price) => {
    try {
      if (!user || !user.id) {
        alert("Please sign in to add items to the cart.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          food_id,
          image_url: image,
          name,
          quantity,
          price,
          user_id: user.id,
        }),
      });

      if (response.ok) {
        alert("Item added to cart successfully!");
      } else {
        alert("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <section className="menu_section">
      <Container>
        <Row>
          <Col lg={{ span: 8, offset: 2 }} className="text-center mb-5">
            <h2>OUR CRAZY BURGERS</h2>
            <p className="para">
              Aliquam a augue suscipit, luctus neque purus ipsum neque undo
              dolor primis libero tempus, blandit a cursus varius magna
            </p>
          </Col>
        </Row>
        <Row>
          {foodData.map((food) => (
            <Cards
              key={food.id}
              food_id={food.id}
              image={`http://localhost:5000${food.image_url}`}
              rating={food.rating}
              title={food.title}
              paragraph={food.description}
              price={food.price}
              renderRatingIcons={renderRatingIcons}
              onAddToCart={onAddToCart}
            />
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Section3;
