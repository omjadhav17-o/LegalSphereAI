import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Save, FolderOpen, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentsCreate = () => {
  const department = localStorage.getItem("userDepartment") || "Department";
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const templates = [
    { id: "emp-contract", name: "Employment Contract", category: "HR" },
    { id: "nda", name: "Non-Disclosure Agreement", category: "Legal" },
    { id: "service-agreement", name: "Service Agreement", category: "Operations" },
    { id: "purchase-order", name: "Purchase Order", category: "Finance" },
    { id: "budget-request", name: "Budget Request", category: "Finance" },
  ];

  const savedDocuments = [
    { id: 1, title: "Employment Contract - Jane Smith", template: "Employment Contract", date: "2024-01-15", type: "Draft" },
    { id: 2, title: "NDA - Project Alpha", template: "NDA", date: "2024-01-12", type: "In CLM" },
    { id: 3, title: "Service Agreement - Vendor XYZ", template: "Service Agreement", date: "2024-01-10", type: "Draft" },
  ];

  const handleCreateDocument = () => {
    if (!selectedTemplate || !documentTitle) {
      toast({
        title: "Error",
        description: "Please select a template and enter a title",
        variant: "destructive"
      });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    setDocumentContent(`[${template?.name} Template]\n\nParty A: ${department}\nParty B: [Enter Name]\n\nDate: ${new Date().toLocaleDateString()}\n\n[Template content will be loaded here...]`);
    setIsDialogOpen(false);
  };

  const handleSaveDocument = (type: "draft" | "clm") => {
    toast({
      title: "Success",
      description: `Document saved as ${type === "draft" ? "draft" : "sent to CLM"}`,
    });
  };

  return (
    <div className="px-6 py-6">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground">Create and manage documents from templates</p>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="saved">Saved Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template Selection */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Select Template</CardTitle>
                  <CardDescription>Choose a template to start</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        New Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Document</DialogTitle>
                        <DialogDescription>Select a template and enter document details</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Document Title</Label>
                          <Input
                            placeholder="Enter document title"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Template</Label>
                          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose template" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateDocument}>
                          Create
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Available Templates</h3>
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{template.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{template.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Editor */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Document Editor</CardTitle>
                      <CardDescription>Edit your document and save</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleSaveDocument("draft")}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </Button>
                      <Button onClick={() => handleSaveDocument("clm")}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Send to CLM
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Document Title</Label>
                      <Input 
                        value={documentTitle} 
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Enter document title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        placeholder="Select a template or start typing..."
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Documents</CardTitle>
                <CardDescription>Your created documents and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium text-foreground">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Template: {doc.template} • {doc.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={doc.type === "Draft" ? "secondary" : "default"}>
                            {doc.type}
                          </Badge>
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const USER_HEADER = "X-USER";
const LEGAL_USERNAME = "legal";

export default function Documents() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/templates`, { headers: { [USER_HEADER]: LEGAL_USERNAME } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const openTemplate = (tpl: any) => {
    try {
      const content = typeof tpl.content === "string" ? tpl.content : JSON.stringify(tpl.content);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;">${content.replace(/[<>&]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c] as string))}</pre>`);
        win.document.close();
      }
    } catch (e: any) {
      toast({ title: "Open Failed", description: e.message || "Cannot open template", variant: "destructive" });
    }
  };

  const downloadDocx = async (tpl: any) => {
    if (!tpl.hasDocx) {
      toast({ title: "No DOCX", description: "DOCX not available for this template" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/templates/${tpl.id}/docx`, { headers: { [USER_HEADER]: LEGAL_USERNAME } });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${String(tpl.title || "template").replace(/\s+/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({ title: "Download Failed", description: e.message || "Could not download DOCX", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold">Department Documents</h1>
        <p className="text-muted-foreground">Browse saved templates</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : templates.length > 0 ? (
        <div className="grid gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{tpl.title}</CardTitle>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Badge>{tpl.contractType}</Badge>
                    {tpl.timesUsed != null && <span>Used {tpl.timesUsed} times</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openTemplate(tpl)}>
                    <Eye className="w-4 h-4 mr-1" /> Open
                  </Button>
                  <Button size="sm" onClick={() => downloadDocx(tpl)} disabled={!tpl.hasDocx}>
                    <Download className="w-4 h-4 mr-1" /> Download DOCX
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {typeof tpl.description === "string" ? tpl.description : "No description"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-muted-foreground">No templates found</CardContent>
        </Card>
      )}
    </div>
  );
}
