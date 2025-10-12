import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const USER_HEADER = "X-USER";
const DEPARTMENT_USERNAME = "employee"; // hard-coded for testing

type RequestItem = {
  id: number;
  title: string;
  description: string;
  date?: string;
  status: string;
  completedDate?: string;
  hasTemplate?: boolean;
};

const Requests = () => {
  const [department, setDepartment] = useState<string>(localStorage.getItem("userDepartment") || "Department");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [contractType, setContractType] = useState<string>("");
  const [priority, setPriority] = useState<string>("low");
  const [dueDate, setDueDate] = useState<string>("");

  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>([]);
  const [completedRequests, setCompletedRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const username = DEPARTMENT_USERNAME; // hard-coded for testing

  // View details & Save as Template state
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [requestDetails, setRequestDetails] = useState<any | null>(null);
  const [templateTitle, setTemplateTitle] = useState<string>("");
  const [templateDescription, setTemplateDescription] = useState<string>("");
  const [draftsByRequest, setDraftsByRequest] = useState<any[]>([]);
  const [savingTemplate, setSavingTemplate] = useState<boolean>(false);

  const fetchUserAndRequests = async () => {
    try {
      setLoading(true);
      // Fetch user details
      const userRes = await fetch(`${API_BASE}/api/v1/users/username/${encodeURIComponent(username)}`);
      if (!userRes.ok) throw new Error("Failed to fetch user");
      const user = await userRes.json();
      if (user?.department) {
        setDepartment(user.department);
        localStorage.setItem("userDepartment", user.department);
      }

      // Fetch my requests
      const reqRes = await fetch(`${API_BASE}/api/v1/requests/my-requests`, {
        headers: {
          [USER_HEADER]: username,
        },
      });
      if (!reqRes.ok) throw new Error("Failed to fetch requests");
      const requests = await reqRes.json();

      const pending: RequestItem[] = [];
      const completed: RequestItem[] = [];
      requests.forEach((r: any) => {
        const item: RequestItem = {
          id: r.id,
          title: r.title,
          description: r.description,
          status: (r.status || "pending").replace("_", " "),
          date: r.createdAt?.split("T")[0],
          completedDate: r.updatedAt?.split("T")[0],
          hasTemplate: false,
        };
        if ((r.status || "").toLowerCase() === "completed") completed.push(item);
        else pending.push(item);
      });
      setPendingRequests(pending);
      setCompletedRequests(completed);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRequest = async () => {
    if (!requestTitle || !requestDescription || !contractType || !priority) {
      toast({
        title: "Error",
        description: "Please fill in title, description, contract type and priority",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        title: requestTitle,
        contractType,
        description: requestDescription,
        priority, // low/medium/high accepted
        dueDate: dueDate || null,
        tags: [],
      };
      const res = await fetch(`${API_BASE}/api/v1/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [USER_HEADER]: username,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create request");
      }

      toast({ title: "Success", description: "Request sent to legal team" });
      setRequestTitle("");
      setRequestDescription("");
      setContractType("");
      setPriority("low");
      setDueDate("");
      setIsDialogOpen(false);
      // Refresh lists
      fetchUserAndRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create request", variant: "destructive" });
    }
  };

  const handleDownloadTemplate = (requestId: number) => {
    toast({ title: "Success", description: "Template downloaded successfully" });
  };

  // Open View Details dialog and fetch latest details
  const openViewDetails = async (request: RequestItem) => {
    try {
      setSelectedRequest(request);
      setViewDetailsOpen(true);
      const res = await fetch(`${API_BASE}/api/v1/requests/${request.id}`);
      if (!res.ok) throw new Error("Failed to fetch request details");
      const data = await res.json();
      setRequestDetails(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load details", variant: "destructive" });
    }
  };

  // Open Save as Template dialog, fetch drafts for the request
  const openSaveTemplate = async (request: RequestItem) => {
    try {
      setSelectedRequest(request);
      setTemplateDialogOpen(true);
      setTemplateTitle(`${request.title} Template`);
      setTemplateDescription(`Template based on request #${request.id}`);
      const res = await fetch(`${API_BASE}/api/v1/drafts/by-request/${request.id}`);
      if (!res.ok) throw new Error("Failed to fetch drafts for request");
      const drafts = await res.json();
      setDraftsByRequest(drafts || []);
    } catch (err: any) {
      setDraftsByRequest([]);
      toast({ title: "Error", description: err.message || "Failed to load drafts", variant: "destructive" });
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedRequest) return;
    if (!templateTitle.trim()) {
      toast({ title: "Error", description: "Template title is required", variant: "destructive" });
      return;
    }
    const draft = draftsByRequest.find((d: any) => d.isFinal) || draftsByRequest[0];
    if (!draft) {
      toast({ title: "No Draft Found", description: "There is no draft linked to this request to save as a template.", variant: "destructive" });
      return;
    }
    try {
      setSavingTemplate(true);
      // Fetch request details if not loaded to get contractType
      let ctype = requestDetails?.contractType;
      if (!ctype && selectedRequest) {
        const res = await fetch(`${API_BASE}/api/v1/requests/${selectedRequest.id}`);
        if (res.ok) {
          const data = await res.json();
          ctype = data?.contractType || "NDA";
        } else {
          ctype = "NDA";
        }
      }
      const payload = {
        title: templateTitle.trim(),
        contractType: ctype || "NDA",
        description: templateDescription.trim(),
        content: draft.content,
      };
      const saveRes = await fetch(`${API_BASE}/api/v1/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [USER_HEADER]: username,
        },
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) {
        const text = await saveRes.text();
        throw new Error(text || "Failed to save template");
      }
      toast({ title: "Template Saved", description: "Template added to the library." });
      setTemplateDialogOpen(false);
      setTemplateTitle("");
      setTemplateDescription("");
      setDraftsByRequest([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save template", variant: "destructive" });
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Requests & Tasks</h1>
            <p className="text-muted-foreground">Manage your legal document requests</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Request</DialogTitle>
                <DialogDescription>
                  Submit a request to the legal team for a new document or contract
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title</Label>
                  <Input id="title" placeholder="e.g., Employment Contract for New Hire" value={requestTitle} onChange={(e) => setRequestTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Details</Label>
                  <Textarea id="description" placeholder="Provide detailed information about what you need..." value={requestDescription} onChange={(e) => setRequestDescription(e.target.value)} className="min-h-[150px]" />
                  <p className="text-xs text-muted-foreground">Include all relevant details so the legal team can draft the appropriate document</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Input id="contractType" placeholder="e.g., employment, nda, vendor" value={contractType} onChange={(e) => setContractType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select id="priority" className="w-full border rounded px-3 py-2 bg-background" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={department} disabled />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRequest}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="p-4 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <CardDescription>{request.description}</CardDescription>
                        </div>
                        <Badge variant={request.status.toLowerCase() === "pending" ? "secondary" : "default"}>{request.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>Submitted: {request.date || "-"}</p>
                          <p>Department: {department}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openViewDetails(request)}>View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid gap-4">
              {completedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <CardDescription>{request.description}</CardDescription>
                      </div>
                      <Badge>{request.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>Submitted: {request.date || "-"}</p>
                        <p>Department: {department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openViewDetails(request)}>View Details</Button>
                        <Button size="sm" onClick={() => openSaveTemplate(request)}>Save as Template</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Details Modal */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>Full information about the selected request</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <p className="text-sm">{requestDetails?.title || selectedRequest?.title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm whitespace-pre-wrap">{requestDetails?.description || selectedRequest?.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm">{(requestDetails?.status || selectedRequest?.status || "").toString().replace("_", " ")}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <p className="text-sm">{requestDetails?.priority || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contract Type</Label>
                  <p className="text-sm">{requestDetails?.contractType || "-"}</p>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <p className="text-sm">{requestDetails?.dueDate || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requested By</Label>
                  <p className="text-sm">{requestDetails?.requestedBy?.fullName || department}</p>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <p className="text-sm">{requestDetails?.assignedTo?.fullName || "-"}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save as Template Modal */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>Save the final draft linked to this request into the template library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="templateTitle">Template Title</Label>
                <Input id="templateTitle" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} placeholder="e.g., Standard NDA Template" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateDesc">Description (optional)</Label>
                <Textarea id="templateDesc" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} placeholder="Short description for this template" />
              </div>
              <div>
                <Label>Drafts Linked to Request</Label>
                <p className="text-sm text-muted-foreground">{draftsByRequest.length > 0 ? `${draftsByRequest.length} draft(s) found${draftsByRequest.some((d:any)=>d.isFinal) ? ", including a final draft." : "."}` : "No drafts found."}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate} disabled={savingTemplate || draftsByRequest.length === 0}>{savingTemplate ? "Saving..." : "Save Template"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Requests;
