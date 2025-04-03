"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FiDatabase, FiDownload, FiRefreshCw, FiTrash2, FiUpload } from "react-icons/fi";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function BackupsPage() {
  const { toast } = useToast();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);

  // Mock data for demonstration
  const backups = [
    {
      id: 1,
      name: "Full System Backup",
      date: new Date(),
      size: "2.5 GB",
      status: "completed",
      type: "full",
    },
    {
      id: 2,
      name: "Database Backup",
      date: new Date(Date.now() - 86400000),
      size: "1.2 GB",
      status: "completed",
      type: "database",
    },
    {
      id: 3,
      name: "Configuration Backup",
      date: new Date(Date.now() - 172800000),
      size: "500 MB",
      status: "completed",
      type: "config",
    },
  ];

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      setBackupProgress(0);

      // Simulate backup progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setBackupProgress(i);
      }

      toast({
        title: "Success",
        description: "Backup created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const handleRestoreBackup = async (backupId: number) => {
    try {
      setIsRestoring(true);
      toast({
        title: "Restoring Backup",
        description: "Please wait while we restore your backup...",
      });

      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Success",
        description: "Backup restored successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore backup",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDownloadBackup = async (backupId: number) => {
    try {
      toast({
        title: "Downloading Backup",
        description: "Starting download...",
      });

      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Backup downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download backup",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBackup = async (backupId: number) => {
    try {
      toast({
        title: "Deleting Backup",
        description: "Please wait while we delete your backup...",
      });

      // Simulate delete process
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Backup deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Backups</h1>
        <p className="text-muted-foreground">
          Manage and monitor your system backups
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Backups
            </CardTitle>
            <FiDatabase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Storage Used
            </CardTitle>
            <FiDatabase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 GB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Backup
            </CardTitle>
            <FiRefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(backups[0].date, "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Backup Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
              <FiDatabase className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
            <Button variant="outline">
              <FiUpload className="mr-2 h-4 w-4" />
              Upload Backup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCreatingBackup && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Creating backup...</span>
                <span className="text-sm text-muted-foreground">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="h-2" />
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>{format(backup.date, "MMM d, yyyy HH:mm")}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell className="capitalize">{backup.type}</TableCell>
                  <TableCell>{getStatusBadge(backup.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadBackup(backup.id)}
                      >
                        <FiDownload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={isRestoring}
                      >
                        <FiRefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 