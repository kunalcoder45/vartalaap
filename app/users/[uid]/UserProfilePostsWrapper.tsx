'use client';

import React from 'react';
import UserProfilePostsPage from '../../../components/UserProfilePostsPage'; // Adjust path as needed

interface UserProfilePostsWrapperProps {
  uid: string;
}

export default function UserProfilePostsWrapper({ uid }: UserProfilePostsWrapperProps) {
  return <UserProfilePostsPage uid={uid} />;
}