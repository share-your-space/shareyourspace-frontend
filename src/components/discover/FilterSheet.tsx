'use client';

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

// TODO: Get these from an API or a predefined list
const sampleSkills = ["React", "Node.js", "Python", "Data Science", "UX Design", "TypeScript", "Next.js", "Project Management"];
const sampleInterests = ["Artificial Intelligence", "SaaS", "FinTech", "E-commerce", "HealthTech", "Green Energy"];

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add props for filter state and callbacks
}

export function FilterSheet({ open, onOpenChange }: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect connection.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-y-auto py-4 px-1 space-y-6">
          {/* Skills Section */}
          <div>
            <h4 className="font-semibold mb-3">Skills & Expertise</h4>
            <div className="space-y-2">
              {sampleSkills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox id={`skill-${skill}`} />
                  <Label htmlFor={`skill-${skill}`} className="font-normal">
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Interests Section */}
          <div>
            <h4 className="font-semibold mb-3">Interests</h4>
            <div className="space-y-2">
              {sampleInterests.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox id={`interest-${interest}`} />
                  <Label htmlFor={`interest-${interest}`} className="font-normal">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" className="w-full">Clear Filters</Button>
          <SheetClose asChild>
            <Button className="w-full">Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
