'use client';

import { Message } from './ai-agent-chat';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserMessageProps {
  message: Message;
  className?: string;
}

export function UserMessage({ message, className }: UserMessageProps) {
  return (
    <div className={cn("flex items-start gap-4 text-slate-600", className)}>
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <div className="font-semibold text-sm text-primary">You</div>
        <div className="prose-sm mt-1 break-words">
          {message.content.split('\n').map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
