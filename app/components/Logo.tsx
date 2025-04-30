import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center space-x-2"
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <span className="text-white text-xl font-bold">S</span>
      </div>
      <span className="text-2xl font-bold">Sciglob Research</span>
    </motion.div>
  );
} 