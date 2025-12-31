import React from 'react';
import { useSocialLinks } from '@/hooks/useSocialLinks';

interface FancySocialLinksProps {
  className?: string;
}

// SVG icons for each platform with brand colors
const PLATFORM_ICONS: Record<string, { svg: React.ReactNode; color: string; hoverColor: string }> = {
  youtube: {
    svg: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
      </svg>
    ),
    color: 'text-red-500',
    hoverColor: 'hover:text-red-400'
  },
  facebook: {
    svg: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
      </svg>
    ),
    color: 'text-blue-500',
    hoverColor: 'hover:text-blue-400'
  },
  instagram: {
    svg: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
      </svg>
    ),
    color: 'text-pink-500',
    hoverColor: 'hover:text-pink-400'
  },
  tiktok: {
    svg: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
      </svg>
    ),
    color: 'text-white',
    hoverColor: 'hover:text-white/90'
  },
  x: {
    svg: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
      </svg>
    ),
    color: 'text-white',
    hoverColor: 'hover:text-gray-300'
  },
  twitter: {
    svg: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
      </svg>
    ),
    color: 'text-white',
    hoverColor: 'hover:text-gray-300'
  }
};

const BORDER_COLORS: Record<string, string> = {
  youtube: 'border-red-500/20 hover:border-red-500/50 hover:shadow-red-500/30',
  facebook: 'border-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/30',
  instagram: 'border-pink-500/20 hover:border-pink-500/50 hover:shadow-pink-500/30',
  tiktok: 'border-white/10 hover:border-white/30 hover:shadow-white/20',
  x: 'border-white/10 hover:border-white/30 hover:shadow-white/20',
  twitter: 'border-white/10 hover:border-white/30 hover:shadow-white/20'
};

const HOVER_BG_COLORS: Record<string, string> = {
  youtube: 'hover:from-red-500/10',
  facebook: 'hover:from-blue-500/10',
  instagram: 'hover:from-pink-500/10',
  tiktok: 'hover:from-white/10',
  x: 'hover:from-white/10',
  twitter: 'hover:from-white/10'
};

const GLOW_COLORS: Record<string, string> = {
  youtube: 'via-red-400/20',
  facebook: 'via-blue-400/20',
  instagram: 'via-pink-400/20',
  tiktok: 'via-white/10',
  x: 'via-white/10',
  twitter: 'via-white/10'
};

const FancySocialLinks: React.FC<FancySocialLinksProps> = ({ className = '' }) => {
  const { links, loading } = useSocialLinks();

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-6 max-w-[200px] mx-auto ${className}`}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-[70px] h-[70px] rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-2 gap-6 max-w-[200px] mx-auto ${className}`}>
      {links.map((link, index) => {
        const platform = link.platform.toLowerCase();
        const iconData = PLATFORM_ICONS[platform];
        const borderColor = BORDER_COLORS[platform] || 'border-white/10 hover:border-white/30';
        const hoverBg = HOVER_BG_COLORS[platform] || 'hover:from-white/10';
        const glowColor = GLOW_COLORS[platform] || 'via-white/10';
        
        if (!iconData) return null;

        const rotation = index % 2 === 0 ? 'hover:rotate-2' : 'hover:-rotate-2';

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-[70px] h-[70px] rounded-full backdrop-blur-lg ${borderColor} border bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:scale-110 ${rotation} active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:bg-gradient-to-tr ${hoverBg} hover:to-black/40 group relative overflow-hidden flex items-center justify-center`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${glowColor} to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out`} />
            <div className={`relative z-10 ${iconData.color} group-${iconData.hoverColor} transition-colors duration-300`}>
              {iconData.svg}
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default FancySocialLinks;
