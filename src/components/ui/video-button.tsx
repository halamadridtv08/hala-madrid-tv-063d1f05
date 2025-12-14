import React from 'react';
import styled from 'styled-components';
import { Video } from 'lucide-react';

interface VideoButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function VideoButton({ children, onClick, className = "" }: VideoButtonProps) {
  return (
    <StyledWrapper className={className}>
      <div 
        aria-label="Video Button" 
        tabIndex={0} 
        role="button" 
        className="user-profile"
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        <div className="user-profile-inner">
          <Video className="w-6 h-6" />
          <p>{children}</p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .user-profile {
    width: auto;
    min-width: 131px;
    height: 51px;
    border-radius: 15px;
    cursor: pointer;
    transition: 0.3s ease;
    background: linear-gradient(
      to bottom right,
      #2e8eff 0%,
      rgba(46, 142, 255, 0) 30%
    );
    background-color: rgba(46, 142, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
  }

  .user-profile:hover,
  .user-profile:focus {
    background-color: rgba(46, 142, 255, 0.7);
    box-shadow: 0 0 10px rgba(46, 142, 255, 0.5);
    outline: none;
  }

  .user-profile-inner {
    width: 100%;
    height: 47px;
    border-radius: 13px;
    background-color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #fff;
    font-weight: 600;
    padding: 0 1.5rem;
    white-space: nowrap;
  }

  .user-profile-inner svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: #fff;
  }

  .user-profile-inner p {
    margin: 0;
    font-size: 0.875rem;
  }

  @media (min-width: 640px) {
    .user-profile-inner p {
      font-size: 1rem;
    }
  }
`;

export default VideoButton;
