import * as React from "react";
import { useUser } from "@/stores/user";
import { useUserStore } from "@/stores/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ open, onOpenChange }: UserDialogProps) {
  const user = useUser();
  const updateDisplayName = useUserStore((state) => state.updateDisplayName);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleUpdateName = () => {
    if (newName.trim()) {
      updateDisplayName(newName.trim());
      setIsEditing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Card className="w-full">
            <CardContent className="grid gap-4 pt-6">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Name</Label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleUpdateName}>Save</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-foreground">{user.name}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="text-foreground">{user.email}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
