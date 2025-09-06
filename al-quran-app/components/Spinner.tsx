import React from 'react';

interface SpinnerProps {
    text?: string;
    themeColor: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text = 'Loading...', themeColor }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`w-12 h-12 border-4 border-t-4 border-gray-200 dark:border-gray-700 border-t-${themeColor}-600 dark:border-t-${themeColor}-400 rounded-full animate-spin`}></div>
      <p className="text-lg text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
};

export default Spinner;