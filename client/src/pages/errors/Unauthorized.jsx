import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

const Unauthorized = () => {
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
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderColor: 'rgba(239, 68, 68, 0.2)'
        }}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 animate-bounce">
          <ShieldAlert size={32} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-red-400">403</h2>
          <h3 className="text-lg font-bold text-white">Access Violation Blocked</h3>
          <p className="text-xs text-slate-400 max-w-[320px]">
            Your current security role does not have authorization parameters to access this workflow node.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/dashboard')} icon={Home}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
