// client/components/SearchBar.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { CustomUser } from '@/app/types'; // Adjust the import path based on your project structure
import defaultUserLogo from '../app/assets/userLogo.png';

interface UserResult {
  uid: string;
  name: string;
  avatarUrl?: string | null;
}

interface SearchBarProps {
  currentAuthUser: CustomUser | null;
  // NEW PROP: Function to update search active state in parent
  onSearchActiveChange?: (isActive: boolean) => void;
}

const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api$/, '') || 'https://vartalaap-r36o.onrender.com';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

const SearchBar: React.FC<SearchBarProps> = ({ onSearchActiveChange }) => { // Destructure new prop
  const { getIdToken } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  // Managed locally, but we'll notify parent
  const [isSearchActiveLocal, setIsSearchActiveLocal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update local state and notify parent
  const updateSearchActive = useCallback((isActive: boolean) => {
    setIsSearchActiveLocal(isActive);
    if (onSearchActiveChange) {
      onSearchActiveChange(isActive);
    }
  }, [onSearchActiveChange]);

  const getFullImageUrl = useCallback((path?: string | null) => {
    if (!path || path.trim() === '') return defaultUserLogo.src;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BACKEND_STATIC_BASE_URL}/${path.replace(/^\/+/, '')}`;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev === null || prev === searchResults.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev === null || prev === 0 ? searchResults.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex !== null) {
        const user = searchResults[selectedIndex];
        if (user) {
          handleResultClick();
          router.push(`/users/${user.uid}`);
        }
      }
    } else if (e.key === 'Escape') {
      updateSearchActive(false); // Use update function
      setSearchResults([]);
      setSelectedIndex(null);
    }
  };

  const fetchUsers = useCallback(async (query: string) => {
    if (!query.trim()) return setSearchResults([]);
    try {
      const idToken = await getIdToken();
      if (!idToken) return;
      const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.ok) {
        const raw = await response.json();
        const users: UserResult[] = raw
          .filter((u: any) => u.uid && u.name)
          .map((u: any) => ({
            uid: u.uid,
            name: u.name,
            avatarUrl: u.avatarUrl ?? null,
          }));
        setSearchResults(users);
        setImageErrors({});
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setSearchResults([]);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (searchTerm.trim()) {
      debounceTimeoutRef.current = setTimeout(() => fetchUsers(searchTerm), 300);
    } else {
      setSearchResults([]);
      setSelectedIndex(null);
    }
    return () => debounceTimeoutRef.current && clearTimeout(debounceTimeoutRef.current);
  }, [searchTerm, fetchUsers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        updateSearchActive(false); // Use update function
        setSearchResults([]);
        setSelectedIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [updateSearchActive]); // Depend on updateSearchActive

  const handleResultClick = () => {
    updateSearchActive(false); // Use update function
    setSearchTerm('');
    setSearchResults([]);
    setSelectedIndex(null);
    searchInputRef.current?.blur();
  };

  return (
    <div className="relative md:ml-24 ml-0 w-auto" ref={searchRef}>
      <div className="relative w-full">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search Vartalaap"
          value={searchTerm}
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => updateSearchActive(true)} // Use update function
          className={`w-[330px] md:w-[580px] bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200 ${
            isSearchActiveLocal ? 'shadow-md' : '' // Use local state for conditional styling
          }`}
        />
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      {isSearchActiveLocal && searchTerm && ( // Use local state here too
        <div className="absolute w-full left-0 right-0 md:mt-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[310] max-h-80 overflow-y-auto animate-fade-in">
          {searchResults.length > 0 ? (
            searchResults.map((user, index) => (
              <Link
                key={user.uid}
                href={`/users/${user.uid}`}
                onClick={handleResultClick}
                className={`flex items-center p-3 transition-colors duration-200 ${
                  selectedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                <Image
                  src={imageErrors[user.uid] ? defaultUserLogo.src : getFullImageUrl(user.avatarUrl)}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover mr-3 aspect-square"
                  onError={() => setImageErrors((prev) => ({ ...prev, [user.uid]: true }))}
                />
                <span className="font-medium text-gray-800">{user.name}</span>
              </Link>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">No users found for "{searchTerm}"</div>
          )}
        </div>
      )}

      {/* This overlay should be controlled by Navbar now for mobile view */}
      {/* Remove this overlay from here as Navbar will handle it to cover the entire page below it */}
      {/*
      {isSearchActiveLocal && (
        <div
          className="fixed inset-0 top-[64px] bg-opacity-30 backdrop-blur-sm z-40"
          onClick={() => {
            updateSearchActive(false);
            setSearchResults([]);
            setSelectedIndex(null);
          }}
          aria-hidden="true"
        />
      )}
      */}
    </div>
  );
};

export default SearchBar;