'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, CustomUser } from './AuthProvider';
import defaultUserLogo from '../app/assets/userLogo.png';

interface UserResult {
  uid: string;
  name: string;
  avatarUrl?: string | null;
}

interface SearchBarProps {
  currentAuthUser: CustomUser | null;
}

const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const SearchBar: React.FC<SearchBarProps> = () => {
  const { getIdToken } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setIsSearchActive(false);
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
        setIsSearchActive(false);
        setSearchResults([]);
        setSelectedIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setIsSearchActive(false);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedIndex(null);
    searchInputRef.current?.blur();
  };

  return (
    <div className="relative w-full ml-24" ref={searchRef}>
      <div className="relative w-144">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search Vartalaap"
          value={searchTerm}
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchActive(true)}
          className={`w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200 ${
            isSearchActive ? 'shadow-md' : ''
          }`}
        />
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      {isSearchActive && searchTerm && (
        <div className="absolute left-0 right-0 mt-4 bg-white border border-gray-200 rounded-lg shadow-lg z-[310] max-h-80 overflow-y-auto animate-fade-in">
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

      {isSearchActive && (
        <div
          className="fixed inset-0 top-[64px] bg-opacity-30 backdrop-blur-sm z-40"
          onClick={() => {
            setIsSearchActive(false);
            setSearchResults([]);
            setSelectedIndex(null);
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SearchBar;
