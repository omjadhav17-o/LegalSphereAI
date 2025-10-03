import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  CheckCircle,
  FileText,
  Send,
  Download,
  Copy,
  Wand2,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockRiskAnalysis = {
  overallRisk: "medium",
  risks: [
    {
      type: "high",
      title: "Unlimited Liability Clause",
      description: "Contract contains unlimited liability terms which could expose company to significant financial risk.",
      location: "Section 8.2"
    },
    {
      type: "medium", 
      title: "Termination Notice Period",
      description: "30-day termination notice may be insufficient for critical vendor relationships.",
      location: "Section 12.1"
    },
    {
      type: "low",
      title: "Jurisdiction Clause",
      description: "Governing law clause specifies foreign jurisdiction.",
      location: "Section 15.3"
    }
  ]
};

export default function DraftContracts() {
  const [prompt, setPrompt] = useState("");
  const [contractType, setContractType] = useState("NDA");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [responseJson, setResponseJson] = useState<any | null>(null);
  const [generatedContract, setGeneratedContract] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const { toast } = useToast();

  const formatContractForExport = (contractData: any) => {
    let contractText = `${contractData.contractTitle}\n`;
    contractText += `${'='.repeat(contractData.contractTitle.length)}\n\n`;
    
    contractText += `Contract Type: ${contractData.contractType}\n`;
    contractText += `Party A: ${contractData.partyA}\n`;
    contractText += `Party B: ${contractData.partyB}\n`;
    contractText += `Generated: ${new Date(contractData.generatedAt).toLocaleDateString()}\n`;
    contractText += `Effective Date: ${contractData.effectiveDate}\n`;
    contractText += `Expiration Date: ${contractData.expirationDate}\n\n`;
    
    if (contractData.preamble) {
      contractText += `PREAMBLE\n${'='.repeat(8)}\n${contractData.preamble}\n\n`;
    }
    
    if (contractData.sections && contractData.sections.length > 0) {
      contractText += `CONTRACT TERMS\n${'='.repeat(13)}\n\n`;
      contractData.sections.forEach((section: any) => {
        contractText += `${section.sectionNumber}. ${section.title}\n`;
        contractText += `${'-'.repeat(section.title.length + 3)}\n`;
        contractText += `${section.content}\n\n`;
      });
    }
    
    if (contractData.conclusion) {
      contractText += `SIGNATURES\n${'='.repeat(10)}\n${contractData.conclusion}\n\n`;
    }
    
    contractText += `GOVERNING LAW AND JURISDICTION\n${'='.repeat(30)}\n`;
    contractText += `Jurisdiction: ${contractData.jurisdiction}\n`;
    contractText += `Governing Law: ${contractData.governingLaw}\n`;
    
    return contractText;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !contractType || !partyA.trim() || !partyB.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide contract type, prompt, Party A, and Party B.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
      const res = await fetch(`${baseUrl}/api/v1/contracts/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          contractType,
          partyA,
          partyB,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponseJson(data);
      setGeneratedContract("");
      toast({
        title: "Draft Generated",
        description: "Received contract JSON from backend.",
      });
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err?.message || "An error occurred while generating the draft.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToDepartment = () => {
    if (!selectedDepartment) {
      toast({
        title: "Select Department",
        description: "Please select a department to send the contract to.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Contract Sent",
      description: `Contract template has been sent to ${selectedDepartment} department.`,
    });
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      low: { class: "bg-green-500/10 text-green-500 border-green-500/30", icon: Shield },
      medium: { class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", icon: AlertTriangle },
      high: { class: "bg-red-500/10 text-red-500 border-red-500/30", icon: AlertTriangle },
    };
    return variants[riskLevel as keyof typeof variants] || variants.medium;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Draft Contracts</h1>
        <p className="text-muted-foreground">
          Generate and customize legal contracts with AI assistance and real-time risk analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Contract Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contract Type
                </label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NDA">NDA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Party A</label>
                  <Input
                    placeholder="e.g., Tech Innovations Inc."
                    value={partyA}
                    onChange={(e) => setPartyA(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Party B</label>
                  <Input
                    placeholder="e.g., Digital Solutions LLC"
                    value={partyB}
                    onChange={(e) => setPartyB(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contract Description
                </label>
                <Textarea
                  placeholder="Describe the contract requirements, key terms, parties involved, and any specific clauses needed..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="bg-background/50"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Contract
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          {responseJson && responseJson.riskAnalysis && (
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Risk:</span>
                  <Badge className={getRiskBadge(responseJson.riskAnalysis.overallRisk).class}>
                    {responseJson.riskAnalysis.overallRisk.toUpperCase()}
                  </Badge>
                </div>

                {responseJson.riskAnalysis.summary && (
                  <div className="p-3 bg-background/30 rounded-lg border border-border">
                    <p className="text-sm text-foreground">{responseJson.riskAnalysis.summary}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {responseJson.riskAnalysis.risks && responseJson.riskAnalysis.risks.map((risk: any, index: number) => {
                    const riskData = getRiskBadge(risk.type);
                    return (
                      <div
                        key={index}
                        className="p-3 border border-border rounded-lg bg-background/30"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <riskData.icon className="w-4 h-4 mt-0.5 text-current" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">
                              {risk.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {risk.description}
                            </p>
                            {risk.location && (
                              <span className="text-xs text-primary mt-1 block">
                                {risk.location}
                              </span>
                            )}
                            {risk.recommendation && (
                              <p className="text-xs text-green-400 mt-2 font-medium">
                                Recommendation: {risk.recommendation}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className={`${riskData.class} text-xs`}>
                            {risk.type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Output Review */}
        <div className="lg:col-span-2">
          <Card className="card-professional">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Draft Output
                </CardTitle>
                {responseJson && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const contractText = formatContractForExport(responseJson);
                        navigator.clipboard.writeText(contractText);
                        toast({ title: "Copied", description: "Contract copied to clipboard" });
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Contract
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const contractText = formatContractForExport(responseJson);
                        const blob = new Blob([contractText], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        const name = (responseJson?.contractTitle || "contract-draft").toString().replace(/\s+/g, "-");
                        a.download = `${name}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Contract
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {responseJson ? (
                <div className="space-y-6">
                  {/* Contract Header */}
                  <div className="bg-background/50 p-6 rounded-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {responseJson.contractTitle}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Type:</span> {responseJson.contractType}
                      </div>
                      <div>
                        <span className="font-medium">Generated:</span> {new Date(responseJson.generatedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Party A:</span> {responseJson.partyA}
                      </div>
                      <div>
                        <span className="font-medium">Party B:</span> {responseJson.partyB}
                      </div>
                    </div>
                  </div>

                  {/* Preamble */}
                  {responseJson.preamble && (
                    <div className="bg-background/30 p-4 rounded-lg border border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Preamble</h3>
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {responseJson.preamble}
                      </p>
                    </div>
                  )}

                  {/* Contract Sections */}
                  {responseJson.sections && responseJson.sections.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Contract Terms</h3>
                      {responseJson.sections.map((section: any, index: number) => (
                        <div key={index} className="bg-background/30 p-4 rounded-lg border border-border">
                          <h4 className="text-md font-semibold text-foreground mb-3">
                            {section.sectionNumber}. {section.title}
                          </h4>
                          <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                            {section.content}
                          </div>
                          {section.subsections && section.subsections.length > 0 && (
                            <ul className="mt-3 ml-4 space-y-1">
                              {section.subsections.map((subsection: string, subIndex: number) => (
                                <li key={subIndex} className="text-muted-foreground text-sm">
                                  • {subsection}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conclusion */}
                  {responseJson.conclusion && (
                    <div className="bg-background/30 p-4 rounded-lg border border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Signatures</h3>
                      <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {responseJson.conclusion}
                      </div>
                    </div>
                  )}

                  {/* Contract Metadata */}
                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Contract Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Effective Date:</span>
                        <div className="text-foreground">{responseJson.effectiveDate}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Expiration Date:</span>
                        <div className="text-foreground">{responseJson.expirationDate}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Jurisdiction:</span>
                        <div className="text-foreground">{responseJson.jurisdiction}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Governing Law:</span>
                        <div className="text-foreground">{responseJson.governingLaw}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-center">
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-foreground">No Contract Generated Yet</h3>
                      <p className="text-muted-foreground">Fill out the form on the left and click generate to create your contract.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}