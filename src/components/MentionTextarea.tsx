import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  candidates?: Array<{ id: string; name: string }>;
}

export const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value,
  onChange,
  placeholder = '',
  rows = 6,
  className = '',
  candidates = []
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    onChange(newValue);

    // Check for @mention trigger
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const isInWord = /\S/.test(textAfterAt);

      if (!isInWord || textAfterAt.match(/^\w+$/)) {
        const searchTerm = textAfterAt.trim().toLowerCase();
        const filtered = candidates.filter(c =>
          c.name.toLowerCase().includes(searchTerm)
        );

        if (filtered.length > 0) {
          setMentionStart(lastAtIndex);
          setSuggestions(filtered);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (suggestion: { id: string; name: string }) => {
    if (mentionStart === null || !textareaRef.current) return;

    const textBefore = value.substring(0, mentionStart);
    const textAfter = value.substring(textareaRef.current.selectionStart);
    const newValue = `${textBefore}@${suggestion.name} ${textAfter}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(null);

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const cursorPos = mentionStart + suggestion.name.length + 2; // @ + name + space
        textareaRef.current.setSelectionRange(cursorPos, cursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const getCursorPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };
    const textarea = textareaRef.current;
    const position = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, position);
    
    // Create a temporary element to measure text
    const div = document.createElement('div');
    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    div.style.whiteSpace = 'pre-wrap';
    div.style.font = window.getComputedStyle(textarea).font;
    div.style.padding = window.getComputedStyle(textarea).padding;
    div.textContent = textBeforeCursor;
    document.body.appendChild(div);
    
    const rect = textarea.getBoundingClientRect();
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const lines = textBeforeCursor.split('\n').length - 1;
    
    const top = rect.top + (lines * lineHeight) + lineHeight;
    const left = rect.left;
    
    document.body.removeChild(div);
    
    return { top, left };
  };

  const suggestionPosition = mentionStart !== null && textareaRef.current
    ? getCursorPosition()
    : { top: 0, left: 0 };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onSelect={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold ${className}`}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute z-50 bg-parchment border-2 border-gold rounded-lg shadow-lg max-h-48 overflow-y-auto"
          style={{
            top: `${suggestionPosition.top + 20}px`,
            left: `${suggestionPosition.left}px`,
            minWidth: '200px'
          }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => insertMention(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-parchment-dark transition-colors flex items-center gap-2"
            >
              <User className="h-4 w-4 text-royal-purple" />
              <span className="font-body text-castle-stone">{suggestion.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

