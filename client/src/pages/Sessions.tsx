import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { ReportModal } from "@/components/ReportModal";
import { DonateModal } from "@/components/DonateModal";
import { useStore } from "@/store/useStore";

export function Sessions() {
  const { sessions, hasShownDonateModal, donateSnoozed, donateDismissed } = useStore();
  const [filters, setFilters] = useState<FilterState>({
    courseCode: "",
    building: "",
    floor: "",
    publicOnly: true
  });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSessionId, setReportSessionId] = useState<string | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  // Check if we should show donate modal
  useEffect(() => {
    if (hasShownDonateModal && !donateDismissed && (!donateSnoozed || Date.now() > donateSnoozed)) {
      setDonateModalOpen(true);
    }
  }, [hasShownDonateModal, donateDismissed, donateSnoozed]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      if (filters.courseCode && session.courseCode !== filters.courseCode) return false;
      if (filters.building && session.building !== filters.building) return false;
      if (filters.floor && session.floor !== filters.floor) return false;
      if (filters.publicOnly && !session.public) return false;
      return true;
    });
  }, [sessions, filters]);

  const handleReport = (sessionId: string) => {
    setReportSessionId(sessionId);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Study Sessions</h1>
            <p className="text-muted-foreground">Join an active study group on campus</p>
          </div>
          <Link href="/donate">
            <Button 
              className="mt-4 md:mt-0 bg-destructive text-destructive-foreground hover:opacity-90"
              data-testid="button-header-donate"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <FilterBar onFilterChange={setFilters} className="mb-8" />

        {/* Sessions Grid */}
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="sessions-grid">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onReport={handleReport}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="empty-state">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No public sessions found
            </h3>
            <p className="text-muted-foreground mb-4">
              Be the first to host a study session!
            </p>
            <Link href="/host">
              <Button data-testid="button-host-from-empty">
                Host a Session
              </Button>
            </Link>
          </div>
        )}

        {/* Modals */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          sessionId={reportSessionId}
        />

        <DonateModal
          isOpen={donateModalOpen}
          onClose={() => setDonateModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default Sessions;
