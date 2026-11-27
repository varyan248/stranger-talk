import React from 'react';

// 🔥 Get the backend URL from your Vercel Environment Variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Avatar = ({ user, size = 'md', showStatus = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  // 🔥 FIX: Build the full URL to the backend image, and add a timestamp to bust the cache
  let imageUrl = null;
  if (user?.profilePic) {
    const baseUrl = user.profilePic.startsWith('http') 
      ? user.profilePic 
      : `${API_URL}${user.profilePic}`;
      
    // Adding ?t=... forces the browser to download the new image instead of showing the old cached one
    imageUrl = `${baseUrl}?t=${new Date(user.updatedAt || Date.now()).getTime()}`;
  }

  const initials = user?.name 
    ? user.name.charAt(0).toUpperCase() 
    : user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-bold overflow-hidden border-2 border-dark-800`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={user?.name || 'User'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if the image fails to load
              e.target.style.display = 'none';
              e.target.parentElement.innerText = initials;
            }}
          />
        ) : (
          initials
        )}
      </div>
      {showStatus && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-800 ${user?.online ? 'bg-green-500' : 'bg-gray-500'}`} />
      )}
    </div>
  );
};

export default Avatar;