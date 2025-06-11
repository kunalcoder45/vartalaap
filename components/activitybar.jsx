import React from 'react';
import { Gift } from 'lucide-react';

const latestActivity = [
  {
    user: 'Hally Haraló Gomes',
    action: 'added a photo in Talk.js',
    time: 'an hour ago',
    avatar: '/avatars/hally-gomes.jpg',
  },
  {
    user: 'Alex Kai',
    action: 'sent you a friend request',
    time: '3 hours ago',
    avatar: '/avatars/alex-kai.jpg',
  },
];

const activeFriends = [
  { name: 'Jaden Chance', avatar: '/avatars/jaden-chance.jpg' },
  { name: 'Arezki Williams', avatar: '/avatars/arezki-williams.jpg' },
  { name: 'Rose James', avatar: '/avatars/rose-james.jpg' },
  { name: 'Tman Mats', avatar: '/avatars/tman-mats.jpg' },
  { name: 'Alex Andrew', avatar: '/avatars/alex-andrew.jpg' },
  { name: 'Kaixi Cark', avatar: '/avatars/kaixi-cark.jpg' },
  { name: 'Hamid Oskip', avatar: '/avatars/hamid-oskip.jpg' },
  { name: 'Serena Lewis', avatar: '/avatars/serena-lewis.jpg' },
  { name: 'April Sky', avatar: '/avatars/april-sky.jpg' },
];

const activitybar = () => {
  const heightAdjustment = "110px";
  return (
    <div className="w-99 p-4 bg-white shadow-md rounded-lg overflow-y-auto mr-0 hide-scrollbar"
      style={{ height: `calc(100vh - ${heightAdjustment})` }}>
      {/* Birthdays */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold text-gray-800">Birthdays</h3>
          <button className="text-gray-500 hover:text-gray-800">
            <span className="text-xl font-bold leading-none">x</span>
          </button>
        </div>
        <div className="flex items-center p-2 bg-blue-50 rounded-lg">
          <Gift size={24} className="text-blue-600 mr-3" />
          <p className="text-blue-700 text-sm">
            <span className="font-semibold">Pola Foster</span> and 3 other friends have birthday today
          </p>
        </div>
      </div>

      {/* Latest Activity */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Latest Activity</h3>
        <ul className="space-y-3">
          {latestActivity.map((activity, index) => (
            <li key={index} className="flex items-center space-x-3">
              <img
                src={activity.avatar}
                alt={activity.user}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
                <p className="text-gray-500 text-xs">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Active Friends */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-3">Active Friends</h3>
        <ul className="space-y-3">
          {activeFriends.map((friend, index) => (
            <li key={index} className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-gray-700 text-sm">{friend.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default activitybar;