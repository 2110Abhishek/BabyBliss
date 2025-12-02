import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__section">
            <Link to="/" className="footer__logo">
              <FiHeart />
              <span>BabyBliss</span>
            </Link>
            <p className="footer__description">
              Premium baby products for your little one's happiness and comfort. 
              Quality guaranteed, smiles delivered.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link">
                <FiFacebook />
              </a>
              <a href="#" className="footer__social-link">
                <FiTwitter />
              </a>
              <a href="#" className="footer__social-link">
                <FiInstagram />
              </a>
              <a href="#" className="footer__social-link">
                <FiYoutube />
              </a>
            </div>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Quick Links</h3>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop All</Link></li>
              <li><Link to="/products?category=new">New Arrivals</Link></li>
              <li><Link to="/products?category=sale">Best Sellers</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Categories</h3>
            <ul className="footer__links">
              <li><Link to="/products?category=clothing">Baby Clothing</Link></li>
              <li><Link to="/products?category=toys">Toys & Games</Link></li>
              <li><Link to="/products?category=feeding">Feeding</Link></li>
              <li><Link to="/products?category=bath">Bath & Care</Link></li>
              <li><Link to="/products?category=nursery">Nursery</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Contact Us</h3>
            <ul className="footer__contact">
              <li>
                <FiPhone />
                <span>+91 9370165188</span>
              </li>
              <li>
                <FiMail />
                <span>support@babybliss.com</span>
              </li>
              <li>
                <FiMapPin />
                <span>123 Baby Street, Bliss City Nagpur ,Maharashtra</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} BabyBliss. All rights reserved.</p>
          <div className="footer__bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/shipping">Shipping Policy</Link>
            <Link to="/returns">Returns Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;