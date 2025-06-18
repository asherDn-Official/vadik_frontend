import { FaUserCircle } from 'react-icons/fa';

function ProfileAvatar({ src, size = 'medium', alt = 'Profile' }) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <FaUserCircle className="w-full h-full text-gray-400" />
      )}
    </div>
  );
}

export default ProfileAvatar;