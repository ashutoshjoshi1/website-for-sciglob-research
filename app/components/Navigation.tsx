import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navigation({ isDarkMode, onToggleDarkMode }: NavigationProps) {
  const navItems = [
    { name: 'About Us', href: '/about' },
    { name: 'Research', href: '/research' },
    { name: 'Projects', href: '/projects' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="flex items-center space-x-8">
      {navItems.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Link
            href={item.href}
            className="text-lg font-medium hover:text-primary transition-colors duration-200"
          >
            {item.name}
          </Link>
        </motion.div>
      ))}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
        onClick={onToggleDarkMode}
        className="p-2 rounded-full bg-primary text-white hover:bg-opacity-90 transition-colors duration-200"
      >
        {isDarkMode ? '🌞' : '🌙'}
      </motion.button>
    </nav>
  );
} 