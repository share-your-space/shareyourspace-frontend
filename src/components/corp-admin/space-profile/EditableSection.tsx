import React from 'react';
import { Button } from '@/components/ui/button';

interface EditableSectionProps {
  title: string;
  isEditing: boolean;
  onSave: () => void;
  children: React.ReactNode;
  editContent: React.ReactNode;
}

export const EditableSection: React.FC<EditableSectionProps> = ({ title, isEditing, onSave, children, editContent }) => {
  return (
    <div className="py-6 border-b">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {isEditing ? (
        <div className="space-y-4">
          {editContent}
          <Button onClick={onSave} size="sm">Save</Button>
        </div>
      ) : (
        <div className="prose max-w-none text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}; 