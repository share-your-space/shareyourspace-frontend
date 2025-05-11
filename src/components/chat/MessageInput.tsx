'use client';

import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, XCircle } from 'lucide-react';
import { socket } from '@/lib/socket';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchAuthenticated } from '@/lib/api';
import { toast } from "sonner";

// Placeholder type
interface User {
    id: number;
    full_name: string;
    email: string;
    profile_picture_url?: string;
    role?: string;
}

interface MessageInputProps {
    selectedUser: User | null;
}

interface AttachmentMetadata {
    attachment_url: string;
    original_filename: string;
    content_type: string;
    new_filename: string;
}

export function MessageInput({ selectedUser }: MessageInputProps) {
    const [messageContent, setMessageContent] = useState('');
    const [attachment, setAttachment] = useState<AttachmentMetadata | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setAttachment(null); // Clear previous attachment

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Ensure API_V1_STR is handled correctly, or use the full path
            const response = await fetchAuthenticated('/uploads/chat-attachment', {
                method: 'POST',
                body: formData,
                // fetchAuthenticated should handle Content-Type for FormData correctly
            });
            const result: AttachmentMetadata = await response.json();
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
            // Reset file input to allow uploading the same file again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSend = () => {
        const content = messageContent.trim();
        // A message can be just an attachment, or text, or both (though UI might guide one way)
        if ((content || attachment) && selectedUser) {
            const payload: any = {
                recipient_id: selectedUser.id,
                content: content,
            };
            if (attachment) {
                payload.attachment_url = attachment.attachment_url;
                payload.attachment_filename = attachment.original_filename; // Send original filename
                payload.attachment_mimetype = attachment.content_type;
            }

            socket.emit('send_message', payload);
            
            setMessageContent('');
            setAttachment(null); // Clear attachment after sending
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const emojis = ['😀', '😂', '😍', '🤔', '😢', '👍', '🎉', '❤️'];

    const handleEmojiClick = (emoji: string) => {
        setMessageContent(prev => prev + emoji);
    };

    const removeAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the file input
        }
    };

    return (
        <div className="p-2 border-t">
            {attachment && (
                <div className="mb-2 p-2 border rounded-md bg-muted text-sm flex justify-between items-center">
                    <span>Attached: {attachment.original_filename} ({attachment.content_type})</span>
                    <Button variant="ghost" size="icon" onClick={removeAttachment} className="h-6 w-6">
                        <XCircle size={16} />
                    </Button>
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
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!selectedUser} className="flex-shrink-0">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-4 gap-1">
                            {emojis.map(emoji => (
                                <Button 
                                    key={emoji} 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="text-xl"
                                >
                                    {emoji}
                                </Button>
                            ))}
                        </div>
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