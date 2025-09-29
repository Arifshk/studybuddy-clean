import { Clock, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Session } from "@/types";
import { useStore } from "@/store/useStore";
import { format } from "date-fns";

interface SessionCardProps {
  session: Session;
  onReport: (sessionId: string) => void;
}

export function SessionCard({ session, onReport }: SessionCardProps) {
  const { joinedSessions, joinSession, leaveSession } = useStore();
  const isJoined = joinedSessions.has(session.id);
  const isFull = session.attendeeCount >= session.capacity;
  const progressPercent = (session.attendeeCount / session.capacity) * 100;

  const handleToggleJoin = async () => {
    try {
      if (isJoined) {
        await leaveSession(session.id);
      } else if (!isFull) {
        await joinSession(session.id);
      }
    } catch (error) {
      console.error('Error toggling session join status:', error);
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow" data-testid={`card-session-${session.id}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-primary text-primary-foreground">
              {session.courseCode}
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {session.building} Floor {session.floor}
            </Badge>
            {!session.public && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Private
              </Badge>
            )}
            {session.isScheduled && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Scheduled
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            {session.isScheduled && session.scheduledDate ? (
              <>
                <Calendar className="w-4 h-4" />
                <span data-testid={`text-scheduled-${session.id}`}>
                  Scheduled for {format(session.scheduledDate, "MMM dd, yyyy")}
                  {session.startTime && ` at ${session.startTime}`}
                </span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span data-testid={`text-ends-${session.id}`}>Ends {session.endsAt}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {session.host.initials}
            </AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-menu-${session.id}`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onReport(session.id)}
                data-testid={`button-report-${session.id}`}
                className="text-destructive"
              >
                Report Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Capacity</span>
          <span className="text-sm text-muted-foreground" data-testid={`text-capacity-${session.id}`}>
            {session.attendeeCount}/{session.capacity}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {session.notes && (
        <p className="text-sm text-muted-foreground mb-4 italic" data-testid={`text-notes-${session.id}`}>
          "{session.notes}"
        </p>
      )}

      {session.locationImages && session.locationImages.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">📍 Location Photos:</p>
          <div className="grid grid-cols-3 gap-2">
            {session.locationImages.slice(0, 3).map((imageUrl, index) => (
              <div 
                key={`${session.id}-image-${index}`} 
                className="relative aspect-square rounded-md overflow-hidden bg-muted"
              >
                <img
                  src={imageUrl}
                  alt={`Study location ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  data-testid={`location-image-${session.id}-${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground" data-testid={`text-host-${session.id}`}>
          Host: {session.host.name}
        </span>
        <Button
          onClick={handleToggleJoin}
          disabled={isFull && !isJoined}
          variant={isJoined ? "outline" : "default"}
          size="sm"
          data-testid={`button-join-${session.id}`}
          className={
            isJoined 
              ? "border-muted-foreground text-muted-foreground hover:bg-muted" 
              : isFull 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:opacity-90"
          }
        >
          {isJoined ? "Leave" : isFull ? "Full" : "Join"}
        </Button>
      </div>
    </Card>
  );
}
