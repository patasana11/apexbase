"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEmptyWorkflow } from "@/lib/workflow-utils";

export default function NewWorkflowRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Create a new workflow with default settings
    const newWorkflow = createEmptyWorkflow("New Workflow");

    // Store the new workflow in session storage
    sessionStorage.setItem("newWorkflow", JSON.stringify(newWorkflow));

    // Redirect to the dynamic route with 'new' as the ID
    router.replace(`/dashboard/workflow/designer/${newWorkflow.id}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-1">Creating new workflow...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}
