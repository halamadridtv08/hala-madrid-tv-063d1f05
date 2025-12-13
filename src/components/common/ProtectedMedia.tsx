import React from 'react';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

interface ProtectedVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="relative select-none">
      <img
        src={src}
        alt={alt}
        className={`pointer-events-none select-none ${className}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        {...props}
      />
      {/* Invisible overlay to prevent interaction */}
      <div 
        className="absolute inset-0 bg-transparent" 
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
};

export const ProtectedVideo: React.FC<ProtectedVideoProps> = ({ 
  src, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="relative select-none">
      <video
        src={src}
        className={`select-none ${className}`}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        {...props}
      />
    </div>
  );
};
