import React from 'react';

const Loader = ({ size = 'medium', fullPage = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`rounded-full border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin`}
        style={{
          width: size === 'small' ? '24px' : size === 'large' ? '64px' : '40px',
          height: size === 'small' ? '24px' : size === 'large' ? '64px' : '40px',
          borderWidth: size === 'small' ? '2px' : size === 'large' ? '4px' : '3px',
          borderColor: 'rgba(255, 255, 255, 0.05)',
          borderTopColor: '#6366f1',
          borderStyle: 'solid',
          borderRadius: '50%'
        }}
      />
      {size !== 'small' && (
        <span className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          Loading...
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6">
      {loaderContent}
    </div>
  );
};

export default Loader;
