// 'use client';
// import React from 'react';
// import Link from 'next/link';
// import { Home, Compass, Bell, MonitorPlay, Bookmark, User, Star,    MessagesSquare  } from 'lucide-react';

// // navigation items for the sidebar
// const navItems = [
//     { icon: Home, label: 'Home', active: false, href: '/dashboard' },
//     { icon: Compass, label: 'Explore', active: false, href: '/explore' },
//     // { icon: Bell, label: 'Notification', active: false, href: '/notifications' },
//     { icon: MonitorPlay, label: 'Reels', active: false, href: '/reels' },
//     // { icon: Bookmark, label: 'Saved', active: false, href: '/saved' },
//     // { icon: Star, label: 'Favourites', active: false, href: '/favourites' },
//     {icon: MessagesSquare, label: 'Message', active: false, href: '/chat' },
//     { icon: User, label: 'Profile', active: false, href: '/profile' },
// ];

// // Slidebar component now accepts `currentPath`, `className`, and `joinedGroups` props
// const Slidebar = ({ currentPath, className, joinedGroups = [] }) => {
//     const heightAdjustment = '105px';
//     return (
//         <div className={`w-99 bg-white shadow-md rounded-lg mr-0 ${className || ''}`} 
//         style={{ height: `calc(100vh - ${heightAdjustment})` }}>
//             {/* Scrollable content container */}
//             <div className="h-full overflow-y-auto hide-scrollbar p-4 w-auto">
//                 <ul className="space-y-1">
//                     {navItems.map((item, index) => (
//                         <li key={index}>
//                             <Link
//                                 href={item.href}
//                                 className={`flex items-center p-2 rounded-lg transition-colors ${currentPath === item.href
//                                     ? 'bg-blue-100 text-blue-700 font-semibold'
//                                     : 'hover:bg-gray-100 text-gray-700'
//                                     }`}
//                             >
//                                 <item.icon size={20} className="mr-3" />
//                                 <span>{item.label}</span>
//                             </Link>
//                         </li>
//                     ))}
//                 </ul>

//                 <hr className="my-4 border-gray-200" />

//                 <h3 className="text-md font-semibold text-gray-800 mb-3">My Group</h3>

//                 {/* Conditionally render groups or a message if no groups are joined */}
//                 {joinedGroups.length > 0 ? (
//                     <div>
//                         <ul className="space-y-2">
//                             {joinedGroups.map((group, index) => (
//                                 <li key={index} className="flex flex-col">
//                                     <Link
//                                         href={`/group/${(group.name ?? '').toLowerCase().replace(/\s/g, '-')}`}
//                                         className="flex items-center p-1 rounded-lg hover:bg-gray-100 transition-colors"
//                                     >
//                                         <img
//                                             src={group.avatar || '/avatars/group-default.jpg'} // Fallback for missing avatar
//                                             alt={group.name || 'Group'}
//                                             className="w-8 h-8 rounded-full mr-3 object-cover"
//                                         />
//                                         <span>{group.name || 'Unnamed Group'}</span>
//                                     </Link>
//                                     {/* The 'hi' link, styled to appear below the group name */}
//                                     <Link href={'#'} className="mt-1 ml-11 text-sm text-gray-500 hover:underline">hi</Link>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 ) : (
//                     <p className="text-gray-500 text-sm italic">No groups joined yet.</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Slidebar;









// mobile




'use client';
import React from 'react';
import Link from 'next/link';
import { Home, Compass, MonitorPlay, User, MessagesSquare } from 'lucide-react';

// navigation items
const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: MonitorPlay, label: 'Reels', href: '/reels' },
  { icon: MessagesSquare, label: 'Message', href: '/chat' },
  { icon: User, label: 'Profile', href: '/profile' },
];

const Slidebar = ({ currentPath, className, joinedGroups = [] }) => {
  const heightAdjustment = '0px';

  return (
    <div
      // REMOVED: md:w-[260px]
      // The width is now controlled entirely by the `className` prop passed from Dashboard
      className={`bg-white md:shadow-md md:rounded-lg  h-auto z-50 ${className || ''}`}
      // style={{ height: `calc(100vh - ${heightAdjustment})` }}
    >
      <div className="h-auto overflow-y-auto hide-scrollbar p-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  currentPath === item.href
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-gray-200" />
        <h3 className="text-md font-semibold text-gray-800 mb-3">My Group</h3>

        {joinedGroups.length > 0 ? (
          <ul className="space-y-2">
            {joinedGroups.map((group, index) => (
              <li key={index} className="flex flex-col">
                <Link
                  href={`/group/${(group.name ?? '').toLowerCase().replace(/\s/g, '-')}`}
                  className="flex items-center p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={group.avatar || '/avatars/group-default.jpg'}
                    alt={group.name || 'Group'}
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                  />
                  <span>{group.name || 'Unnamed Group'}</span>
                </Link>
                <Link href="#" className="mt-1 ml-11 text-sm text-gray-500 hover:underline">
                  hi
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm italic">No groups joined yet.</p>
        )}
      </div>
    </div>
  );
};

export default Slidebar;