import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          padding: '48px',
          maxWidth: '480px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          backgroundColor: 'rgba(15, 23, 42, 0.45)'
        }}
      >
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
          <Compass size={32} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-white text-gradient">404</h2>
          <h3 className="text-lg font-bold text-white">Route Coordinates Lost</h3>
          <p className="text-xs text-slate-400 max-w-[280px]">
            The requested workflow coordinates do not exist or have been archived.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/dashboard')} icon={Home}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
