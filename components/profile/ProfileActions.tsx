"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, Loader2 } from "lucide-react";
import { getOrCreateDirectConversation } from "@/actions/message";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProfileActions({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMessage = async () => {
    setLoading(true);
    const result = await getOrCreateDirectConversation(userId);
    setLoading(false);
    
    if (result.success && result.data) {
      router.push(`/messages/${result.data.id}`);
    } else {
      toast.error(result.error || "Failed to start conversation");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="outline" 
        className="rounded-xl font-bold h-10 gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm px-6"
        onClick={handleMessage}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
        Message
      </Button>

      <Button 
        className="rounded-xl font-bold h-10 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 px-8"
      >
        <UserPlus className="h-4 w-4" />
        Follow
      </Button>
    </div>
  );
}
