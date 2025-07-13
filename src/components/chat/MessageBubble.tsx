import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessageData } from '@/types/chat';
import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
  message: ChatMessageData;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const bubbleAlignment = isOwnMessage ? 'justify-end' : 'justify-start';
  const bubbleStyles = isOwnMessage
    ? 'bg-primary text-primary-foreground'
    : 'bg-muted';
  const attachmentUrl = message.attachment_url ? (
    <div className="mt-2">
      <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline">
        View Attachment
      </a>
    </div>
  ) : null;

  return (
    <div className={`flex items-end gap-2 ${bubbleAlignment}`}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.profile_picture_url || undefined} alt={message.sender?.full_name || 'User'} />
          <AvatarFallback>{message.sender?.full_name ? message.sender.full_name[0] : '?'}</AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${bubbleStyles}`}>
        <p className="text-sm">{message.content}</p>
        {attachmentUrl}
        <div className="flex items-center justify-end mt-1">
          {!!message.read_at && isOwnMessage && (
            <span className="text-xs text-muted-foreground/80 mr-1">Read</span>
          )}
          <span className="text-xs text-muted-foreground/80">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1">
                {message.reactions.map((reaction, index) => (
                    <Badge key={index} variant="secondary">{reaction.emoji}</Badge>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
