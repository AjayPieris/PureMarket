import React from "react";
import "../components_style/about.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt, faTruckFast, faHeadset } from "@fortawesome/free-solid-svg-icons";

export default function About() {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-card">
          <div className="icon-box">
            <FontAwesomeIcon icon={faShieldAlt} className="icon" />
          </div>
          <h3>Secure Payments</h3>
          <p>Your transactions are protected with industry‑standard encryption</p>
        </div>

        <div className="about-card">
          <div className="icon-box">
            <FontAwesomeIcon icon={faTruckFast} className="icon" />
          </div>
          <h3>Fast Delivery</h3>
          <p>Get your orders delivered quickly with real‑time tracking</p>
        </div>

        <div className="about-card">
          <div className="icon-box">
            <FontAwesomeIcon icon={faHeadset} className="icon" />
          </div>
          <h3>24/7 Support</h3>
          <p>Our customer service team is always here to help you</p>
        </div>
      </div>
    </section>
  );
}