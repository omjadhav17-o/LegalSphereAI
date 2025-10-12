import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Requests = () => {
  const department = localStorage.getItem("userDepartment") || "Department";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");

  const pendingRequests = [
    { 
      id: 1, 
      title: "Employment Contract Request", 
      description: "Need employment contract for new hire John Doe",
      date: "2024-01-15",
      status: "Pending"
    },
    { 
      id: 2, 
      title: "NDA for Vendor Partnership", 
      description: "Require NDA for partnership with Tech Corp",
      date: "2024-01-12",
      status: "In Review"
    },
  ];

  const completedRequests = [
    { 
      id: 3, 
      title: "Service Agreement - Marketing Agency", 
      description: "Service agreement with external marketing agency",
      date: "2024-01-08",
      completedDate: "2024-01-10",
      status: "Completed",
      hasTemplate: true
    },
    { 
      id: 4, 
      title: "Consultant Agreement", 
      description: "Agreement for Q1 consultant engagement",
      date: "2024-01-05",
      completedDate: "2024-01-07",
      status: "Completed",
      hasTemplate: true
    },
  ];

  const handleCreateRequest = () => {
    if (!requestTitle || !requestDescription) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Request sent to legal team"
    });

    setRequestTitle("");
    setRequestDescription("");
    setIsDialogOpen(false);
  };

  const handleDownloadTemplate = (requestId: number) => {
    toast({
      title: "Success",
      description: "Template downloaded successfully"
    });
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
                  <Input
                    id="title"
                    placeholder="e.g., Employment Contract for New Hire"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Details</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about what you need..."
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include all relevant details so the legal team can draft the appropriate document
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={department} disabled />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRequest}>
                  Submit Request
                </Button>
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
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <CardDescription>{request.description}</CardDescription>
                      </div>
                      <Badge 
                        variant={request.status === "Pending" ? "secondary" : "default"}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>Submitted: {request.date}</p>
                        <p>Department: {department}</p>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>Submitted: {request.date}</p>
                        <p>Completed: {request.completedDate}</p>
                        <p>Department: {department}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        {request.hasTemplate && (
                          <Button 
                            size="sm"
                            onClick={() => handleDownloadTemplate(request.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Save Template
                          </Button>
                        )}
                      </div>
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
