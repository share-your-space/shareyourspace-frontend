'use client';

import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, XCircle, FileText, Mic } from 'lucide-react';
import { socket } from '@/lib/socket';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchAuthenticated } from '@/lib/api';
import { toast } from "sonner";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
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
        } catch (error) {
            console.error("File upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not upload the file.";
            toast.error("Upload failed", {
                description: errorMessage,
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

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        setMessageContent(prev => prev + emojiObject.emoji);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageContent(e.target.value);
        if (socket.connected && selectedUser) {
            socket.emit('user_typing', { recipient_id: selectedUser.id });
        }
    };

    return (
        <div className="p-4 border-t bg-background">
            {attachment && (
                <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-2">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{attachment.original_filename}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setAttachment(null)}>
                        <XCircle className="h-5 w-5" />
                    </Button>
                </div>
            )}
            <div className="relative flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-0">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </PopoverContent>
                </Popover>
                <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1"
                    value={messageContent}
                    onChange={handleTyping}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isUploading || !selectedUser}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" disabled={isUploading}>
                    <Mic className="h-5 w-5" />
                </Button>
                <Button onClick={handleSend} disabled={(!messageContent.trim() && !attachment) || isUploading || !selectedUser}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}