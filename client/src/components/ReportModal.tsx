import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "fake-location", label: "Fake location" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

export function ReportModal({ isOpen, onClose, sessionId }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !sessionId) return;

    setIsSubmitting(true);
    
    // Simulate API call
    console.log("Report submitted:", { sessionId, reason, details });
    
    setTimeout(() => {
      toast({
        title: "Report submitted",
        description: "Thanks — a moderator will review.",
      });
      setIsSubmitting(false);
      setReason("");
      setDetails("");
      onClose();
    }, 500);
  };

  const handleClose = () => {
    setReason("");
    setDetails("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-report">
        <DialogHeader>
          <DialogTitle>Report Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger data-testid="select-report-reason">
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details (Optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide more details..."
              maxLength={300}
              rows={4}
              data-testid="textarea-report-details"
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/300 characters
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!reason || isSubmitting}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-submit-report"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
