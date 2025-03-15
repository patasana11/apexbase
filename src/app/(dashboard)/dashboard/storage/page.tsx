"use client";

import { useState } from "react";
import {
  FiFolder,
  FiUpload,
  FiFile,
  FiImage,
  FiFileText,
  FiSearch,
  FiMoreHorizontal,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiLock
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function StoragePage() {
  const [selectedBucket, setSelectedBucket] = useState("public");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock buckets data
  const buckets = [
    { name: "public", size: "234 MB", files: 287, isPublic: true },
    { name: "private", size: "1.2 GB", files: 532, isPublic: false },
    { name: "backups", size: "4.7 GB", files: 182, isPublic: false },
    { name: "uploads", size: "856 MB", files: 723, isPublic: true },
  ];

  // Mock files data
  const files = [
    { name: "user-profile.jpg", size: "1.2 MB", type: "image", bucket: "public" },
    { name: "report-2023.pdf", size: "4.5 MB", type: "document", bucket: "public" },
    { name: "product-demo.mp4", size: "24.8 MB", type: "video", bucket: "public" },
    { name: "data-backup.zip", size: "128.5 MB", type: "archive", bucket: "backups" },
    { name: "user-data.json", size: "256 KB", type: "document", bucket: "private" },
    { name: "banner.png", size: "3.8 MB", type: "image", bucket: "public" },
    { name: "database-dump.sql", size: "42.1 MB", type: "document", bucket: "backups" },
    { name: "user-uploads.zip", size: "78.3 MB", type: "archive", bucket: "uploads" },
  ];

  // Filter files based on selected bucket and search query
  const filteredFiles = files
    .filter(file => file.bucket === selectedBucket)
    .filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Storage</h1>
        <p className="text-muted-foreground">
          Manage your files, buckets, and storage policies.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Storage Buckets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 px-1">
                {buckets.map((bucket) => (
                  <Button
                    key={bucket.name}
                    variant={selectedBucket === bucket.name ? "secondary" : "ghost"}
                    className="flex w-full items-center justify-start gap-2 px-3"
                    onClick={() => setSelectedBucket(bucket.name)}
                  >
                    <FiFolder className="h-4 w-4" />
                    <span className="flex-1 truncate text-left">
                      {bucket.name}
                    </span>
                    {bucket.isPublic ? (
                      <Badge variant="outline" className="ml-auto">
                        Public
                      </Badge>
                    ) : (
                      <FiLock className="ml-auto h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4">
              <Button className="w-full" size="sm">
                <FiPlus className="mr-2 h-4 w-4" />
                New Bucket
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Total Storage</span>
                  <span className="text-sm text-muted-foreground">7.1 GB / 10 GB</span>
                </div>
                <Progress value={71} className="h-2" />
              </div>
              <Separator />
              <div className="space-y-2">
                {buckets.map((bucket) => (
                  <div key={bucket.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{bucket.name}</span>
                    <span className="text-sm text-muted-foreground">{bucket.size}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedBucket} Files
                  </CardTitle>
                  <CardDescription>
                    {buckets.find(b => b.name === selectedBucket)?.files} files,{" "}
                    {buckets.find(b => b.name === selectedBucket)?.size} used
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search files..."
                      className="pl-8 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>
                    <FiUpload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filteredFiles.map((file) => (
                  <Card key={file.name} className="overflow-hidden">
                    <div className="aspect-square bg-muted p-4 flex items-center justify-center">
                      {file.type === "image" ? (
                        <FiImage className="h-12 w-12 text-blue-500" />
                      ) : file.type === "document" ? (
                        <FiFileText className="h-12 w-12 text-orange-500" />
                      ) : (
                        <FiFile className="h-12 w-12 text-gray-500" />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <h3 className="truncate text-sm font-medium">{file.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {file.size}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <FiMoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FiDownload className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <FiTrash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredFiles.length === 0 && (
                  <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-4">
                    <FiFile className="h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No files found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? `No files matching "${searchQuery}"`
                        : "Upload files to get started"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
