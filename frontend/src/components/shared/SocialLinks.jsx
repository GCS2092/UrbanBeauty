import { FaFacebook, FaTiktok, FaInstagram } from 'react-icons/fa';

const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://www.facebook.com/share/17PicDQeZm/?mibextid=wwXIfr', icon: FaFacebook },
  { name: 'TikTok', url: 'https://www.tiktok.com/@sonshop221', icon: FaTiktok },
  { name: 'Instagram', url: 'https://www.instagram.com/sonshop221', icon: FaInstagram },
];

export default function SocialLinks() {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400">ou consultez nos pages</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>
      <div className="flex justify-center gap-3">
        {SOCIAL_LINKS.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-500 flex items-center justify-center transition-colors"
            >
              <Icon size={18} />
            </a>
          );
        })}
      </div>
    </div>
  );
}