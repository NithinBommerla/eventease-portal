
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-10 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold">EventEase</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Creating memorable experiences through seamless event management.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-primary" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-primary" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-primary" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-primary" />
              </a>
            </div>
          </div>
          
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/discover" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  Discover Events
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold">Help & Info</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faqs" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                support@eventease.com
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                123 Event Street, <br />
                San Francisco, CA 94103
              </p>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-start">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-left">
            &copy; {currentYear} EventEase. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <Link to="/privacy-policy" className="hover:text-primary dark:hover:text-primary">Privacy</Link>
            <Link to="/terms-conditions" className="hover:text-primary dark:hover:text-primary">Terms</Link>
            <Link to="/refund-policy" className="hover:text-primary dark:hover:text-primary">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
