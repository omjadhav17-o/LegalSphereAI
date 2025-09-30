import { useState } from "react";
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

  const filteredRequests = mockRequests.filter((request) => {
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
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {request.dueDate}
                          </span>
                          <span>Created: {request.created}</span>
                        </div>
                        <p className="text-foreground/80 mb-3">{request.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {request.requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{request.title}</DialogTitle>
                              <DialogDescription>
                                Request from {request.department} department
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-muted-foreground">{request.description}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {request.requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {request.status !== "completed" && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Send className="w-4 h-4 mr-2" />
                            Send Template
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Template Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/30"
                  >
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        {template.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Updated: {template.lastUpdated}</span>
                        <span>Used {template.usage} times</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}