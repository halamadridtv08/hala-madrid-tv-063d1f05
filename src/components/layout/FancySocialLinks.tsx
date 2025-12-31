import React from 'react';
import { useSocialLinks } from '@/hooks/useSocialLinks';

interface FancySocialLinksProps {
  className?: string;
}

const platformStyles: Record<string, { borderColor: string; hoverShadow: string; textColor: string; hoverTextColor: string }> = {
  youtube: {
    borderColor: 'border-red-500/20 hover:border-red-500/50',
    hoverShadow: 'hover:shadow-red-500/30',
    textColor: 'text-red-500',
    hoverTextColor: 'group-hover:text-red-400',
  },
  facebook: {
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    hoverShadow: 'hover:shadow-blue-500/30',
    textColor: 'text-blue-500',
    hoverTextColor: 'group-hover:text-blue-400',
  },
  instagram: {
    borderColor: 'border-pink-500/20 hover:border-pink-500/50',
    hoverShadow: 'hover:shadow-pink-500/30',
    textColor: 'text-pink-500',
    hoverTextColor: 'group-hover:text-pink-400',
  },
  twitter: {
    borderColor: 'border-white/10 hover:border-white/30',
    hoverShadow: 'hover:shadow-white/20',
    textColor: 'text-white',
    hoverTextColor: 'group-hover:text-white/90',
  },
  tiktok: {
    borderColor: 'border-white/10 hover:border-white/30',
    hoverShadow: 'hover:shadow-white/20',
    textColor: 'text-white',
    hoverTextColor: 'group-hover:text-white/90',
  },
  linkedin: {
    borderColor: 'border-blue-600/20 hover:border-blue-600/50',
    hoverShadow: 'hover:shadow-blue-600/30',
    textColor: 'text-blue-600',
    hoverTextColor: 'group-hover:text-blue-500',
  },
  whatsapp: {
    borderColor: 'border-green-500/20 hover:border-green-500/50',
    hoverShadow: 'hover:shadow-green-500/30',
    textColor: 'text-green-500',
    hoverTextColor: 'group-hover:text-green-400',
  },
  telegram: {
    borderColor: 'border-sky-500/20 hover:border-sky-500/50',
    hoverShadow: 'hover:shadow-sky-500/30',
    textColor: 'text-sky-500',
    hoverTextColor: 'group-hover:text-sky-400',
  },
  discord: {
    borderColor: 'border-indigo-500/20 hover:border-indigo-500/50',
    hoverShadow: 'hover:shadow-indigo-500/30',
    textColor: 'text-indigo-500',
    hoverTextColor: 'group-hover:text-indigo-400',
  },
  twitch: {
    borderColor: 'border-purple-500/20 hover:border-purple-500/50',
    hoverShadow: 'hover:shadow-purple-500/30',
    textColor: 'text-purple-500',
    hoverTextColor: 'group-hover:text-purple-400',
  },
};

const platformIcons: Record<string, JSX.Element> = {
  youtube: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
    </svg>
  ),
  facebook: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  ),
  instagram: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  ),
  twitter: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  ),
  whatsapp: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  ),
  telegram: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z" />
    </svg>
  ),
  discord: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
    </svg>
  ),
  twitch: (
    <svg className="w-7 h-7 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0ZM449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z" />
    </svg>
  ),
};

const FancySocialLinks: React.FC<FancySocialLinksProps> = ({ className = '' }) => {
  const { links, loading } = useSocialLinks();

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[70px] h-[70px] rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return null;
  }

  const getGridCols = () => {
    if (links.length <= 2) return 'grid-cols-2';
    if (links.length <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className={`grid ${getGridCols()} gap-4 ${className}`}>
      {links.map((link, index) => {
        const styles = platformStyles[link.platform] || platformStyles.twitter;
        const icon = platformIcons[link.platform];
        const rotations = ['hover:rotate-2', 'hover:-rotate-2', 'hover:rotate-3', 'hover:-rotate-3'];
        const rotation = rotations[index % rotations.length];

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-[70px] h-[70px] rounded-full backdrop-blur-lg ${styles.borderColor} bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl ${styles.hoverShadow} hover:scale-110 ${rotation} active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden flex items-center justify-center`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <div className={`relative z-10 ${styles.textColor} ${styles.hoverTextColor} transition-colors duration-300`}>
              {icon}
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default FancySocialLinks;
