"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkflowRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dynamic route with 'new' as the ID
    router.push("/dashboard/workflow/designer/new");
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
