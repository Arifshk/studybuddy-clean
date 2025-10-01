import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for reports
const mockReports = [
  {
    id: "r1",
    time: "2 hours ago",
    target: { name: "Josh S.", initials: "JS", session: "BU111 - Library" },
    reason: "Inappropriate content",
    status: "pending" as const,
  },
  {
    id: "r2", 
    time: "5 hours ago",
    target: { name: "Emily L.", initials: "EL", session: "CP102 - Science" },
    reason: "Fake location",
    status: "resolved" as const,
  },
  {
    id: "r3",
    time: "1 day ago", 
    target: { name: "Mike K.", initials: "MK", session: "MA103 - Peters" },
    reason: "Spam",
    status: "removed" as const,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    case "resolved":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
    case "removed":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Removed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function Moderate() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Moderation Dashboard</h1>
          <p className="text-muted-foreground">Review reported sessions and manage platform safety</p>
        </div>

        <Card className="overflow-hidden" data-testid="moderation-table">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Time
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Target
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Reason
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                    <TableCell className="text-sm text-foreground">
                      {report.time}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="w-8 h-8 mr-3">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {report.target.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">
                          {report.target.name} ({report.target.session})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {report.reason}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(report.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              disabled
                              variant="ghost"
                              size="sm"
                              className="bg-muted text-muted-foreground cursor-not-allowed"
                              data-testid={`button-review-${report.id}`}
                            >
                              {report.status === "pending" ? "Review" : "View"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Admin only (demo)</p>
                          </TooltipContent>
                        </Tooltip>
                        {report.status === "pending" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                disabled
                                variant="ghost"
                                size="sm"
                                className="bg-muted text-muted-foreground cursor-not-allowed"
                                data-testid={`button-dismiss-${report.id}`}
                              >
                                Dismiss
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Admin only (demo)</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Moderate;
