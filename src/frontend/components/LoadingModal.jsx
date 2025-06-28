import React from 'react';
import { useUserStore } from '../store/userStore';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

export const LoadingModal = ({ message = "Loading..." }) => {
  const globalLoading = useUserStore(state => state.loading);

  return (
    <Dialog open={globalLoading}>
      <DialogContent className="flex flex-col items-center justify-center gap-4 p-8 bg-background/90 backdrop-blur-sm border-none shadow-2xl rounded-lg">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-foreground">
          {message}
        </p>
      </DialogContent>
    </Dialog>
  );
};