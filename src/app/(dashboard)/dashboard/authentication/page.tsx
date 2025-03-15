"use client";

import { useState } from "react";
import {
  FiUser,
  FiUserPlus,
  FiUserX,
  FiUsers,
  FiSettings,
  FiSearch,
  FiMoreHorizontal,
  FiTrash2,
  FiEdit,
  FiLock,
  FiMail,
  FiSlash,
  FiCheckCircle,
  FiBarChart,
  FiFilter,
  FiGlobe,
  FiGithub,
  FiTwitter,
  FiPlus,
  FiAlertTriangle
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AuthPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock user data
  const users = [
    {
      id: "usr_1",
      name: "John Smith",
      email: "john.smith@example.com",
      avatarUrl: null,
      role: "Admin",
      status: "active",
      verified: true,
      createdAt: "2023-01-15",
      lastLogin: "2 hours ago",
      authProvider: "email",
    },
    {
      id: "usr_2",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      avatarUrl: null,
      role: "User",
      status: "active",
      verified: true,
      createdAt: "2023-02-23",
      lastLogin: "5 days ago",
      authProvider: "google",
    },
    {
      id: "usr_3",
      name: "Robert Davis",
      email: "robert.davis@example.com",
      avatarUrl: null,
      role: "User",
      status: "inactive",
      verified: true,
      createdAt: "2023-03-10",
      lastLogin: "2 weeks ago",
      authProvider: "email",
    },
    {
      id: "usr_4",
      name: "Emily Wilson",
      email: "emily.wilson@example.com",
      avatarUrl: null,
      role: "Developer",
      status: "active",
      verified: true,
      createdAt: "2023-04-05",
      lastLogin: "1 day ago",
      authProvider: "github",
    },
    {
      id: "usr_5",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatarUrl: null,
      role: "User",
      status: "active",
      verified: false,
      createdAt: "2023-05-12",
      lastLogin: "3 hours ago",
      authProvider: "email",
    },
    {
      id: "usr_6",
      name: "Sarah Miller",
      email: "sarah.miller@example.com",
      avatarUrl: null,
      role: "Developer",
      status: "blocked",
      verified: true,
      createdAt: "2023-06-20",
      lastLogin: "Never",
      authProvider: "email",
    },
  ];

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auth provider stats
  const authStats = [
    { provider: "Email", count: 4, color: "blue" },
    { provider: "Google", count: 1, color: "red" },
    { provider: "GitHub", count: 1, color: "gray" },
    { provider: "Twitter", count: 0, color: "sky" },
  ];

  // Get provider icon
  const getProviderIcon = (provider: string) => {
    switch(provider) {
      case "google":
        return <FiGlobe className="h-4 w-4 text-red-500" />;
      case "github":
        return <FiGithub className="h-4 w-4 text-gray-900 dark:text-gray-100" />;
      case "twitter":
        return <FiTwitter className="h-4 w-4 text-sky-500" />;
      default:
        return <FiMail className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Inactive</Badge>;
      case "blocked":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Authentication</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and authentication settings.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="providers">Auth Providers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <FiUserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <FiUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {users.filter(u => u.status === "active").length} active users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Signups
                </CardTitle>
                <FiUserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12</div>
                <p className="text-xs text-muted-foreground">
                  +42% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                <FiBarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +5 in the last hour
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Auth Issues
                </CardTitle>
                <FiAlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  3 failed login attempts
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FiFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
              <CardDescription>
                View and manage user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Provider</TableHead>
                    <TableHead className="hidden md:table-cell">Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                          {!user.verified && (
                            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Unverified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          {getProviderIcon(user.authProvider)}
                          <span className="text-xs capitalize">
                            {user.authProvider}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FiMoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FiUser className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FiEdit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FiMail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {user.status === "active" ? (
                                <>
                                  <FiSlash className="mr-2 h-4 w-4" />
                                  Disable Account
                                </>
                              ) : (
                                <>
                                  <FiCheckCircle className="mr-2 h-4 w-4" />
                                  Enable Account
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <FiTrash2 className="mr-2 h-4 w-4" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles and Permissions</CardTitle>
              <CardDescription>
                Manage roles and assign permissions to users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center justify-center text-center">
                  <FiLock className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Permissions Management</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Role-based access control will be implemented in the next phase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Providers</CardTitle>
              <CardDescription>
                Set up and manage external authentication providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  {authStats.map((provider, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{provider.provider}</CardTitle>
                        {provider.provider === "Email" && <FiMail className="h-4 w-4" />}
                        {provider.provider === "Google" && <FiGlobe className="h-4 w-4" />}
                        {provider.provider === "GitHub" && <FiGithub className="h-4 w-4" />}
                        {provider.provider === "Twitter" && <FiTwitter className="h-4 w-4" />}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{provider.count}</div>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Social Authentication</CardTitle>
                        <Button variant="outline" size="sm">
                          <FiSettings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </div>
                      <CardDescription>
                        Allow users to sign in with social accounts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiGlobe className="h-5 w-5 text-red-500" />
                            <div>
                              <h3 className="font-medium">Google</h3>
                              <p className="text-xs text-muted-foreground">Enabled</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiGithub className="h-5 w-5" />
                            <div>
                              <h3 className="font-medium">GitHub</h3>
                              <p className="text-xs text-muted-foreground">Enabled</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiTwitter className="h-5 w-5 text-sky-500" />
                            <div>
                              <h3 className="font-medium">Twitter</h3>
                              <p className="text-xs text-muted-foreground">Not configured</p>
                            </div>
                          </div>
                          <Badge variant="outline">Inactive</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Email Authentication</CardTitle>
                        <Button variant="outline" size="sm">
                          <FiSettings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </div>
                      <CardDescription>
                        Configure email-based authentication settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Verification</h3>
                            <p className="text-xs text-muted-foreground">
                              Require email verification for new users
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Password Rules</h3>
                            <p className="text-xs text-muted-foreground">
                              Strong password requirements
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Account Recovery</h3>
                            <p className="text-xs text-muted-foreground">
                              Allow password recovery via email
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Enabled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure authentication security settings and policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center justify-center text-center">
                  <FiSettings className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Security Settings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Advanced security settings will be implemented in the next phase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
