import React from 'react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] w-full overflow-x-hidden flex flex-col relative">
      {children}
    </div>
  );
};

