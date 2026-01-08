import React, { useState, useRef, useEffect } from 'react';
import { Mail, User } from 'lucide-react';

interface UserSuggestion {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

interface ParticipantAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  users: UserSuggestion[];
  currentUserId?: number;
  placeholder?: string;
}

export const ParticipantAutocomplete: React.FC<ParticipantAutocompleteProps> = ({
  value,
  onChange,
  users,
  currentUserId,
  placeholder = "email@empresa.com, colega@empresa.com"
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getEmailsAlreadyAdded = (): string[] => {
    return value
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0);
  };

  const getCurrentSearchTerm = (text: string, position: number): string => {
    const beforeCursor = text.substring(0, position);
    const lastCommaIndex = beforeCursor.lastIndexOf(',');
    const currentPart = beforeCursor.substring(lastCommaIndex + 1).trim();
    return currentPart.toLowerCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(position);
    
    const term = getCurrentSearchTerm(newValue, position);
    setSearchTerm(term);
    setShowSuggestions(term.length >= 2);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const position = (e.target as HTMLTextAreaElement).selectionStart || 0;
    setCursorPosition(position);
    
    const term = getCurrentSearchTerm(value, position);
    setSearchTerm(term);
    
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectUser = (user: UserSuggestion) => {
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    const lastCommaIndex = beforeCursor.lastIndexOf(',');
    const textBeforeCurrentPart = lastCommaIndex >= 0 
      ? beforeCursor.substring(0, lastCommaIndex + 1) + ' '
      : '';
    
    const afterCommaIndex = afterCursor.indexOf(',');
    const textAfterCurrentPart = afterCommaIndex >= 0
      ? afterCursor.substring(afterCommaIndex)
      : '';
    
    const newValue = textBeforeCurrentPart + user.email + textAfterCurrentPart;
    onChange(newValue);
    setShowSuggestions(false);
    setSearchTerm('');
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = textBeforeCurrentPart.length + user.email.length;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const filteredUsers = users.filter(user => {
    if (user.id === currentUserId) return false;
    
    const emailsAdded = getEmailsAlreadyAdded();
    if (emailsAdded.includes(user.email.toLowerCase())) return false;
    
    if (searchTerm.length < 2) return false;
    
    const matchesName = user.name.toLowerCase().includes(searchTerm);
    const matchesEmail = user.email.toLowerCase().includes(searchTerm);
    
    return matchesName || matchesEmail;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute top-3 left-3 pointer-events-none">
        <Mail className="h-4 w-4 text-gray-400" />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyUp={handleKeyUp}
        onFocus={() => {
          const term = getCurrentSearchTerm(value, cursorPosition);
          if (term.length >= 2) {
            setSearchTerm(term);
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary min-h-[80px] resize-none bg-white text-dark"
      />
      
      {showSuggestions && filteredUsers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => selectUser(user)}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-dark truncate">{user.name}</div>
                <div className="text-xs text-medium truncate">{user.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
