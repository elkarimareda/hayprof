import Logo from "@/assets/logo.svg?react";
import LanguageSwitcher from "./ui/LanguageSwitcher";
import { Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";

function Footer() {
  return (
    <div className="w-full border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-auto" />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} HayProf. All rights reserved.
          </div>
        </div>

        <div className="">
          <LanguageSwitcher />
        </div>

        <div className=""></div>

        {/* Right column placeholder for links or social icons */}
        <div className="flex justify-end space-x-3">
          <a
            href="#"
            aria-label="Twitter"
            title="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <Twitter className="w-5 h-5" />
          </a>

          <a
            href="#"
            aria-label="Facebook"
            title="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <Facebook className="w-5 h-5" />
          </a>

          <a
            href="#"
            aria-label="Instagram"
            title="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <Instagram className="w-5 h-5" />
          </a>

          <a
            href="#"
            aria-label="LinkedIn"
            title="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <Linkedin className="w-5 h-5" />
          </a>

          <a
            href="#"
            aria-label="GitHub"
            title="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;
