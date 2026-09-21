import React from 'react';

interface NetworkingIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const NetworkingIcon: React.FC<NetworkingIconProps> = ({
  className = 'w-4 h-4',
  size = 24,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Central Node */}
      <circle cx="12" cy="12" r="3.2" />

      {/* Connecting Spokes */}
      <line x1="10" y1="9.7" x2="6.7" y2="6.6" />
      <line x1="14.3" y1="9.8" x2="18.2" y2="5.8" />
      <line x1="9.7" y1="14.2" x2="6.3" y2="17.7" />
      <line x1="12" y1="15.2" x2="12" y2="18.8" />
      <line x1="14.4" y1="13.7" x2="18.2" y2="16.3" />

      {/* Outer 5 Satellite Nodes */}
      <circle cx="5.5" cy="5.5" r="2.2" />
      <circle cx="19.5" cy="4.5" r="2.5" />
      <circle cx="5" cy="19" r="2.4" />
      <circle cx="12" cy="20.5" r="2.2" />
      <circle cx="19.5" cy="17.5" r="2.1" />
    </svg>
  );
};
