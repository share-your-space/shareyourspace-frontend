'use client';

import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, XCircle, FileText } from 'lucide-react';
import { socket } from '@/lib/socket';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchAuthenticated } from '@/lib/api';
import { toast } from "sonner";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { User, Conversation } from '@/types/chat';
import { useChatStore } from '@/store/chatStore';

interface AttachmentMetadata {
    attachment_url: string;
    original_filename: string;
    content_type: string;
}

interface SendMessagePayload {
    recipient_id: number;
    content: string;
    attachment_url?: string;
    attachment_filename?: string;
    attachment_mimetype?: string;
}

export function MessageInput() {
    const { activeConversationId, conversations } = useChatStore();
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const selectedUser = activeConversation?.other_user;

    const [messageContent, setMessageContent] = useState('');
    const [attachment, setAttachment] = useState<AttachmentMetadata | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showEmojiPopover, setShowEmojiPopover] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setAttachment(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetchAuthenticated('/uploads/chat-attachment', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || 'File upload failed');
            }
            setAttachment(result);
            toast("Attachment ready", {
                description: `Ready to send: ${result.original_filename}`,
            });
        } catch (error: any) {
            console.error("File upload error:", error);
            toast.error("Upload failed", {
                description: error.message || "Could not upload the file.",
            });
            setAttachment(null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSend = () => {
        const content = messageContent.trim();
        if ((content || attachment) && selectedUser) {
            const payload: SendMessagePayload = {
                recipient_id: selectedUser.id,
                content: content,
            };

            if (attachment) {
                payload.attachment_url = attachment.attachment_url;
                payload.attachment_filename = attachment.original_filename;
                payload.attachment_mimetype = attachment.content_type;
            }

            socket.emit('send_message', payload);
            
            setMessageContent('');
            setAttachment(null);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessageContent(prev => prev + emojiData.emoji);
        setShowEmojiPopover(false);
    };

    const removeAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-4 border-t bg-background">
            {attachment && (
                <div className="mb-2 p-2 pr-1 border rounded-lg bg-muted/70 dark:bg-muted/30 text-sm flex justify-between items-center group">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        {attachment.content_type.startsWith('image/') ? (
                            <img 
                                src={attachment.attachment_url} 
                                alt={attachment.original_filename}
                                className="h-10 w-10 rounded object-cover flex-shrink-0"
                            />
                        ) : (
                            <FileText size={24} className="text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="overflow-hidden">
                            <p className="font-medium truncate text-foreground">{attachment.original_filename}</p>
                            <p className="text-xs text-muted-foreground truncate">{attachment.content_type}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeAttachment} className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <XCircle size={18} />
                    </Button>
                </div>
            )}
            {isUploading && (
                <div className="mb-2 text-sm text-muted-foreground flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading file...
                </div>
            )}
            <div className="flex w-full items-center space-x-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    disabled={isUploading || !selectedUser}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading || !selectedUser}
                    className="flex-shrink-0"
                    title="Attach file"
                >
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Popover open={showEmojiPopover} onOpenChange={setShowEmojiPopover}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!selectedUser} className="flex-shrink-0" onClick={() => setShowEmojiPopover(prev => !prev)}>
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto border-none shadow-xl">
                        <EmojiPicker 
                            onEmojiClick={handleEmojiClick} 
                            height={350}
                            width={300}
                        />
                    </PopoverContent>
                </Popover>
                <Input 
                    type="text"
                    placeholder={selectedUser ? `Message ${selectedUser.full_name}...` : "Select a contact to message..."}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!selectedUser || isUploading}
                    className="flex-1"
                    autoComplete="off"
                />
                <Button 
                    type="button" 
                    size="icon" 
                    onClick={handleSend}
                    disabled={!selectedUser || isUploading || (!messageContent.trim() && !attachment)}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
} 