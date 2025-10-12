import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Clock,
  Users,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Add API constants and types
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const USER_HEADER = "X-USER";
const LEGAL_USERNAME = "legal"; // hard-coded for testing

type LegalRequest = {
  id: number;
  title: string;
  department: string;
  requestor: string;
  priority: string;
  status: string;
  dueDate?: string;
  description: string;
  requirements?: string[];
  created?: string;
};

const mockRequests = [
  {
    id: 1,
    title: "Employment Contract - New Hire",
    department: "HR",
    requestor: "Sarah Wilson",
    priority: "high",
    status: "pending",
    dueDate: "2024-01-20",
    description: "Need employment contract for senior developer position. Include non-compete clause and equity options.",
    requirements: ["Standard employment terms", "Non-compete clause", "Equity options", "Remote work provisions"],
    created: "2024-01-15",
  },
  {
    id: 2,
    title: "Vendor Agreement - Cloud Services",
    department: "IT",
    requestor: "Michael Chen",
    priority: "medium",
    status: "in-progress",
    dueDate: "2024-01-25",
    description: "Cloud hosting service agreement with SLA requirements and data privacy clauses.",
    requirements: ["SLA guarantees", "Data privacy compliance", "Termination clauses", "Pricing structure"],
    created: "2024-01-12",
  },
  {
    id: 3,
    title: "Consulting Agreement - Marketing Campaign",
    department: "Marketing",
    requestor: "Emily Rodriguez",
    priority: "low",
    status: "completed",
    dueDate: "2024-01-18",
    description: "Agreement for external marketing consultant for Q1 campaign.",
    requirements: ["Project deliverables", "Payment schedule", "IP ownership", "Confidentiality"],
    created: "2024-01-10",
  },
  {
    id: 4,
    title: "Software License - Analytics Tool",
    department: "IT",
    requestor: "David Park",
    priority: "medium",
    status: "review",
    dueDate: "2024-01-22",
    description: "Enterprise license for business analytics software with multi-user access.",
    requirements: ["Multi-user licensing", "Data export rights", "Support terms", "Renewal options"],
    created: "2024-01-13",
  },
];

const mockTemplates = [
  {
    id: 1,
    title: "Standard Employment Contract",
    type: "employment",
    lastUpdated: "2024-01-10",
    usage: 23,
  },
  {
    id: 2,
    title: "NDA Template - Standard",
    type: "nda",
    lastUpdated: "2024-01-08",
    usage: 45,
  },
  {
    id: 3,
    title: "Vendor Service Agreement",
    type: "vendor",
    lastUpdated: "2024-01-05",
    usage: 18,
  },
];

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { toast } = useToast();
  // New state for tabs and dialogs
  const [tab, setTab] = useState("requests");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<LegalRequest | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedSendRequestId, setSelectedSendRequestId] = useState<number | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);

  // Replace mock requests with fetched requests
  const [requests, setRequests] = useState<LegalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Drafts state
  type DraftItem = { id: number; title: string; contractType: string; isFinal?: boolean; requestId?: number | null; createdAt?: string; updatedAt?: string };
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [draftsLoading, setDraftsLoading] = useState<boolean>(false);

  const mapRequest = (r: any): LegalRequest => ({
    id: r.id,
    title: r.title || "Untitled",
    department: r.department || r.requester?.department || "Unknown",
    requestor: r.requester?.fullName || r.createdBy?.fullName || r.fullName || "Unknown",
    priority: (r.priority || "medium").toLowerCase(),
    status: ((r.status || "pending").toLowerCase()).replace(/_/g, "-"),
    dueDate: r.dueDate ? String(r.dueDate).split("T")[0] : undefined,
    description: r.description || "",
    requirements: r.requirements || [],
    created: r.createdAt ? String(r.createdAt).split("T")[0] : undefined,
  });

  const fetchLegalRequests = async () => {
    try {
      setLoading(true);
      const headers = { [USER_HEADER]: LEGAL_USERNAME } as Record<string, string>;

      const [unassignedRes, assignedRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/requests/unassigned`, { headers }),
        fetch(`${API_BASE}/api/v1/requests/assigned`, { headers }),
      ]);

      const all: any[] = [];

      if (unassignedRes.ok) {
        const unassigned = await unassignedRes.json();
        all.push(...(Array.isArray(unassigned) ? unassigned : []));
      } else {
        const txt = await unassignedRes.text();
        toast({ title: "Unassigned fetch error", description: txt || "Failed to fetch unassigned requests", variant: "destructive" });
      }

      if (assignedRes.ok) {
        const assigned = await assignedRes.json();
        all.push(...(Array.isArray(assigned) ? assigned : []));
      } else {
        const txt = await assignedRes.text();
        toast({ title: "Assigned fetch error", description: txt || "Failed to fetch assigned requests", variant: "destructive" });
      }

      const mapped = all.map(mapRequest);
      setRequests(mapped);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load legal requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDrafts = async () => {
    try {
      setDraftsLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/drafts/my`, { headers: { [USER_HEADER]: LEGAL_USERNAME } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to fetch drafts");
      }
      const list = await res.json();
      const mapped: DraftItem[] = (Array.isArray(list) ? list : []).map((d: any) => ({
        id: d.id,
        title: d.title,
        contractType: d.contractType,
        isFinal: d.isFinal,
        requestId: d.requestId ?? null,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
      setDrafts(mapped);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Unable to load drafts", variant: "destructive" });
    } finally {
      setDraftsLoading(false);
    }
  };

  const openRequestDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/requests/${id}`, { headers: { [USER_HEADER]: LEGAL_USERNAME } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to fetch request details");
      }
      const data = await res.json();
      const details = mapRequest(data);
      setSelectedRequestDetails(details);
      setDetailsOpen(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not load request details", variant: "destructive" });
    }
  };

  const openSendTemplate = async (requestId: number) => {
    setSelectedSendRequestId(requestId);
    setSendDialogOpen(true);
    if (drafts.length === 0) {
      await fetchMyDrafts();
    }
  };

  const attachDraftToRequest = async () => {
    if (!selectedSendRequestId || !selectedDraftId) {
      toast({ title: "Select Draft", description: "Please select a draft to send.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/drafts/complete-request/${selectedSendRequestId}?draftId=${selectedDraftId}`, {
        method: "POST",
        headers: { [USER_HEADER]: LEGAL_USERNAME },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to attach draft");
      }
      toast({ title: "Template Sent", description: "Draft attached and request marked completed." });
      // Update request status locally
      setRequests((prev) => prev.map((r) => (r.id === selectedSendRequestId ? { ...r, status: "completed" } : r)));
      setSendDialogOpen(false);
      setSelectedDraftId(null);
      setSelectedSendRequestId(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not attach draft", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchLegalRequests();
    // Preload drafts for quick access
    fetchMyDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-500/10 text-red-500 border-red-500/30",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      low: "bg-green-500/10 text-green-500 border-green-500/30",
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/30",
      review: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      completed: "bg-green-500/10 text-green-500 border-green-500/30",
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      "in-progress": AlertCircle,
      review: Eye,
      completed: CheckCircle,
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendTemplate = (templateId: number, requestId: number) => {
    toast({
      title: "Template Sent",
      description: "Contract template has been sent to the requesting department.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tasks & Requests</h1>
        <p className="text-muted-foreground">
          Manage contract requests from departments and send drafted templates
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">Contract Requests</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Filters */}
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-background/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px] bg-background/50">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading requests...</div>
          ) : (
            <div className="grid gap-6">
              {filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <Card key={request.id} className="card-professional hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{request.title}</h3>
                            <Badge className={getStatusBadge(request.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {request.status.replace("-", " ")}
                            </Badge>
                            <Badge className={getPriorityBadge(request.priority)}>
                              {request.priority} priority
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {request.department} - {request.requestor}
                            </span>
                            {request.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> Due {request.dueDate}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{request.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openRequestDetails(request.id)}>View Details</Button>
                          {request.status !== "completed" && (
                            <Button size="sm" onClick={() => openSendTemplate(request.id)}>
                              <FileText className="w-4 h-4 mr-1" /> Send Template
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredRequests.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-muted-foreground">No requests found</CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="drafts" className="space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle>My Drafts</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {draftsLoading ? (
                <div className="text-muted-foreground">Loading drafts...</div>
              ) : drafts.length > 0 ? (
                <div className="grid gap-4">
                  {drafts.map((d) => (
                    <Card key={d.id} className="hover-lift">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{d.title}</div>
                          <div className="text-sm text-muted-foreground">Type: {d.contractType}</div>
                          {d.createdAt && (
                            <div className="text-xs text-muted-foreground">Created: {String(d.createdAt).toString()}</div>
                          )}
                        </div>
                        {d.isFinal && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Final</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No drafts found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequestDetails?.title || "Request Details"}</DialogTitle>
            <DialogDescription>
              {selectedRequestDetails ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Department:</strong> {selectedRequestDetails.department}</div>
                  <div><strong>Requester:</strong> {selectedRequestDetails.requestor}</div>
                  {selectedRequestDetails.dueDate && (<div><strong>Due Date:</strong> {selectedRequestDetails.dueDate}</div>)}
                  <div><strong>Status:</strong> {selectedRequestDetails.status}</div>
                  <div className="pt-2"><strong>Description:</strong> {selectedRequestDetails.description}</div>
                  {selectedRequestDetails.requirements && selectedRequestDetails.requirements.length > 0 && (
                    <div className="pt-2">
                      <strong>Requirements:</strong>
                      <ul className="list-disc pl-5">
                        {selectedRequestDetails.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground">Loading...</div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Send Template Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Draft to Request</DialogTitle>
            <DialogDescription>Select a draft to attach and mark the request completed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={selectedDraftId ? String(selectedDraftId) : undefined} onValueChange={(val) => setSelectedDraftId(Number(val))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a draft" />
              </SelectTrigger>
              <SelectContent>
                {drafts.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.title} ({d.contractType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
              <Button onClick={attachDraftToRequest} disabled={!selectedDraftId}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}