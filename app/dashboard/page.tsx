'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import MiddleContent from '../../components/mainContent';
import RightSidebar from '../../components/activitybar';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [userJoinedGroups, setUserJoinedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState(null);

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) {
        setUserJoinedGroups([]);
        setLoadingGroups(false);
        return;
      }

      setLoadingGroups(true);
      setGroupsError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/groups/joined`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error fetching groups' }));
          throw new Error(errorData.message || `Failed to fetch joined groups (Status: ${response.status})`);
        }

        const data = await response.json();
        setUserJoinedGroups(data);
      } catch (error) {
        console.error("Error fetching joined groups:", error);
        setGroupsError(error.message);
        setUserJoinedGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchUserGroups();
  }, [user]);

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="h-auto p-4 bg-gray-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <Slidebar
              joinedGroups={userJoinedGroups}
              currentPath={pathname}
              className=""
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="">
              <MiddleContent />
            </div>
          </div>

          <div className="flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}