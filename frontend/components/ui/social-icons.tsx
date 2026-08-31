import { Globe, MessageSquare, Share2, Users } from "lucide-react";

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs ${className}`}>
      <Share2 className="h-4 w-4" />
    </div>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white font-bold text-xs ${className}`}>
      <Globe className="h-4 w-4" />
    </div>
  );
}

export function TwitterIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-sky-500 text-white font-bold text-xs ${className}`}>
      <MessageSquare className="h-4 w-4" />
    </div>
  );
}

export function YoutubeIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs ${className}`}>
      <Users className="h-4 w-4" />
    </div>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-black text-white font-bold text-xs ${className}`}>
      <Globe className="h-4 w-4" />
    </div>
  );
}

export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-blue-700 text-white font-bold text-xs ${className}`}>
      <Users className="h-4 w-4" />
    </div>
  );
}
