import React from 'react';
import { User } from 'lucide-react';

interface MentionRendererProps {
  text: string;
  candidates?: Array<{ id: string; name: string }>;
}

export const MentionRenderer: React.FC<MentionRendererProps> = ({ text, candidates = [] }) => {
  const parts: Array<{ text: string; isMention: boolean; candidateName?: string }> = [];
  const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        isMention: false
      });
    }
    const mentionedName = match[1].trim();
    parts.push({
      text: match[0],
      isMention: true,
      candidateName: mentionedName
    });
    lastIndex = mentionRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isMention: false
    });
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.isMention) {
          return (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 mx-1 bg-gold-light text-castle-stone border border-gold rounded-md font-semibold text-sm"
            >
              <User className="h-3 w-3 mr-1" />
              {part.text}
            </span>
          );
        }
        return <span key={index}>{part.text}</span>;
      })}
    </>
  );
};

