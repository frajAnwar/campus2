"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/shared/Avatar";
import { getOnlineUsers } from "@/actions/user";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ActiveUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const result = await getOnlineUsers();
      if (result.success) setUsers(result.data);
    };
    fetch();
    const interval = setInterval(fetch, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="space-y-4 px-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
        Active Now
      </h3>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <Link 
            key={user.id} 
            href={`/profile/${user.username}`}
            title={user.name}
            className="transition-transform hover:scale-110"
          >
            <Avatar 
              src={user.image} 
              name={user.name} 
              size="sm" 
              showStatus={true}
              className="ring-2 ring-transparent hover:ring-primary/20 transition-all"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
