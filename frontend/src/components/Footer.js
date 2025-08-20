import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Multi Vendor Shop</h3>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Your trusted online shopping destination for quality products and exceptional service.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Built with MongoDB, Express.js, React.js, and Node.js
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white text-sm sm:text-base">Home</a></li>
              <li><a href="/products" className="text-gray-300 hover:text-white text-sm sm:text-base">Products</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white text-sm sm:text-base">About</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white text-sm sm:text-base">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li>Email: Chaitanyamooli11@gmail.com</li>
              <li>Phone: +91 82476600084</li>
              <li>Address: 123 E-commerce St</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-center text-gray-400 text-sm sm:text-base">
            © {new Date().getFullYear()} Multi Vendor Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
