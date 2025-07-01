"use client";

import { useState, ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";

export const TagInput = ({ value: tags = [], onChange, placeholder }: { value?: string[] | null, onChange: (tags: string[]) => void, placeholder:string }) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !(tags || []).includes(newTag)) {
                onChange([...(tags || []), newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange((tags || []).filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {(tags || []).map((tag, index) => (
                    <div key={index} className="flex items-center bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-muted-foreground hover:text-foreground">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder={placeholder}
            />
        </div>
    );
}; 