import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function RoleSwitcher() {
  const navigate = useNavigate();

  const currentRole = (localStorage.getItem("userRole") || "legal") as "legal" | "department";

  const switchRole = () => {
    const nextRole = currentRole === "legal" ? "department" : "legal";
    localStorage.setItem("userRole", nextRole);
    if (nextRole === "department") {
      // Ensure a sample department for demo purposes
      if (!localStorage.getItem("userDepartment")) {
        localStorage.setItem("userDepartment", "Human Resources (HR)");
      }
      navigate({ to: "/department/dashboard" });
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={switchRole}>
      Switch to {currentRole === "legal" ? "Department" : "Legal"}
    </Button>
  );
}


