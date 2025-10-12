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
                        <Button variant="outline" size="sm">View Details</Button>
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
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Requests;
