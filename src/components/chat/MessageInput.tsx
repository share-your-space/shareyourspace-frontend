'use client';

import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, XCircle, FileText, Mic } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
    const [messageContent, setMessageContent] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setAttachment(null);

        // Mocking file upload
        setTimeout(() => {
            setAttachment(file);
            setIsUploading(false);
            toast("Attachment ready", {
                description: `Ready to send: ${file.name}`,
            });
        }, 1000);
    };

    const handleSend = () => {
        const content = messageContent.trim();
        if (content || attachment) {
            let messageToSend = content;
            if (attachment) {
                messageToSend += `\n[Attachment: ${attachment.name}]`;
                // In a real app, you'd handle the upload and send a URL
            }
            onSendMessage(messageToSend);
            setMessageContent('');
            setAttachment(null);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageContent(e.target.value);
        // Typing indicator logic would go here if needed
    };

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        setMessageContent(prev => prev + emojiObject.emoji);
    };

    return (
        <div className="p-4 border-t bg-background">
            {attachment && (
                <div className="mb-2 flex items-center justify-between p-2 rounded-md bg-muted">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">{attachment.name}</span>
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isUploading}
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
                <Button onClick={handleSend} disabled={(!messageContent && !attachment) || isUploading}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}