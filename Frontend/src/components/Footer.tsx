import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-4 text-sm">
      &copy; {new Date().getFullYear()} Deepak Chauhan. All rights reserved.
    </footer>
  );
};

export default Footer;
