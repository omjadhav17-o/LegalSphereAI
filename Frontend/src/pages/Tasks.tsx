import { useState, useEffect } from "react";
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

// ... existing code ...

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

type LegalRequest = {
  id: number;
  title: string;
  department: string;
  requestor: string;
  priority: string;
  status: string;
  dueDate?: string;
  description: string;
  requirements: string[];
  created?: string;
};

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { toast } = useToast();
  const [requests, setRequests] = useState<LegalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const username = localStorage.getItem("username") || "";

  const mapResponseToLegalRequest = (r: any): LegalRequest => {
    return {
      id: r.id,
      title: r.title,
      department: r.requestedBy?.department || "-",
      requestor: r.requestedBy?.fullName || r.requestedBy?.email || "-",
      priority: (r.priority || "medium").toLowerCase(),
      status: (r.status || "pending").toLowerCase().replace("_", "-"),
      dueDate: r.dueDate || undefined,
      description: r.description || "",
      requirements: Array.isArray(r.tags) ? r.tags : [],
      created: r.createdAt ? String(r.createdAt).split("T")[0] : undefined,
    };
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const unassignedRes = await fetch(`${API_BASE}/api/v1/requests/unassigned`);
      const unassigned = unassignedRes.ok ? await unassignedRes.json() : [];

      let assigned: any[] = [];
      if (username) {
        const assignedRes = await fetch(`${API_BASE}/api/v1/requests/assigned`, {
          headers: { "X-Username": username },
        });
        assigned = assignedRes.ok ? await assignedRes.json() : [];
      }

      const combined: LegalRequest[] = ([] as any[])
        .concat(unassigned || [])
        .concat(assigned || [])
        .map(mapResponseToLegalRequest);

      setRequests(combined);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load legal requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
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
          <TabsTrigger value="templates">Template Library</TabsTrigger>
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
                    <SelectTrigger className="W-[140px] bg-background/50">
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
                            <h3 className="text-lg font-semibold text-foreground">
                              {request.title}
                            </h3>
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
                                <Calendar className="w-4 h-4" /> Due {String(request.dueDate)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm" onClick={() => handleSendTemplate(1, request.id)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Template
                          </Button>
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

        {/* Template Library - unchanged */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle>Template Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                View and manage contract templates.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}