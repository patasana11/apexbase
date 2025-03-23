"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ClientWrapper } from "@/components/client-wrapper";
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiShield,
  FiCheck,
  FiMoreHorizontal,
  FiEdit,
  FiTrash2,
  FiSave,
  FiSearch,
  FiChevronDown
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
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const inviteFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.string({ required_error: "Please select a role." }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const roles = [
  { id: "admin", name: "Admin", description: "Full access to all resources" },
  { id: "editor", name: "Editor", description: "Can edit but not delete resources" },
  { id: "viewer", name: "Viewer", description: "Read-only access to resources" },
  { id: "developer", name: "Developer", description: "API and development access" },
];

const teamMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "admin",
    status: "active",
    avatar: "/placeholder-avatar.png",
    invited: "2 years ago",
    lastActive: "Just now"
  },
  {
    id: 2,
    name: "Taylor Smith",
    email: "taylor@example.com",
    role: "editor",
    status: "active",
    avatar: "/placeholder-avatar.png",
    invited: "1 year ago",
    lastActive: "2 hours ago"
  },
  {
    id: 3,
    name: "Jordan Williams",
    email: "jordan@example.com",
    role: "developer",
    status: "active",
    avatar: "/placeholder-avatar.png",
    invited: "6 months ago",
    lastActive: "Yesterday"
  },
  {
    id: 4,
    name: "Casey Brown",
    email: "casey@example.com",
    role: "viewer",
    status: "pending",
    avatar: "/placeholder-avatar.png",
    invited: "2 weeks ago",
    lastActive: "Never"
  },
];

export default function TeamSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [members, setMembers] = useState(teamMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState<typeof teamMembers[0] | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "",
    },
  });

  function onSubmit(data: InviteFormValues) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setInviteDialogOpen(false);

      // If editing existing member
      if (editingMember) {
        setMembers(members.map(member =>
          member.id === editingMember.id
            ? { ...member, role: data.role, email: data.email }
            : member
        ));

        toast({
          title: "Team member updated",
          description: `${data.email}'s role has been updated to ${getRoleName(data.role)}.`,
        });

        setEditingMember(null);
      } else {
        // Adding new member
        const newMember = {
          id: Math.max(...members.map(m => m.id)) + 1,
          name: data.email.split('@')[0],
          email: data.email,
          role: data.role,
          status: "pending",
          avatar: "",
          invited: "Just now",
          lastActive: "Never"
        };

        setMembers([...members, newMember]);

        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${data.email}.`,
        });
      }

      form.reset();
    }, 1000);
  }

  function handleResendInvite(email: string) {
    toast({
      title: "Invitation resent",
      description: `A new invitation has been sent to ${email}.`,
    });
  }

  function handleRevokeAccess(id: number) {
    setMembers(members.filter(member => member.id !== id));
    toast({
      title: "Access revoked",
      description: "The team member has been removed from your project.",
    });
  }

  function handleEdit(member: typeof teamMembers[0]) {
    setEditingMember(member);
    form.setValue("email", member.email);
    form.setValue("role", member.role);
    setInviteDialogOpen(true);
  }

  function getRoleName(roleId: string) {
    return roles.find(r => r.id === roleId)?.name || roleId;
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-900";
      case "editor":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-900";
      case "developer":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-400 dark:hover:bg-purple-900";
      case "viewer":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-700";
      default:
        return "";
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoleName(member.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ClientWrapper fallback={
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team and their access permissions
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FiUsers className="h-5 w-5" />
                    <span>Team Members</span>
                  </CardTitle>
                  <CardDescription>
                    Manage who has access to your project
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search team members..."
                      className="pl-8 w-full sm:w-[240px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <FiUserPlus className="h-4 w-4" />
                        <span>Add Member</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingMember ? "Edit Team Member" : "Invite Team Member"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingMember
                            ? "Update this team member's information and role."
                            : "Add a new member to your team by sending them an invitation."}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter email address"
                                    disabled={editingMember !== null}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  They will receive an invitation via email
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {roles.map((role) => (
                                      <SelectItem key={role.id} value={role.id}>
                                        <div className="flex flex-col">
                                          <span>{role.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {role.description}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  This controls what actions they can perform
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter className="pt-4">
                            <Button
                              type="submit"
                              className="gap-2"
                              disabled={isSubmitting}
                            >
                              <FiSave className="h-4 w-4" />
                              {isSubmitting
                                ? (editingMember ? "Updating..." : "Sending...")
                                : (editingMember ? "Update Member" : "Send Invitation")}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No team members found.</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            {member.status === "pending" && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-900">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                        <div className="text-sm">
                          <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                            {getRoleName(member.role)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.status === "active"
                            ? `Last active: ${member.lastActive}`
                            : `Invited: ${member.invited}`}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FiMoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(member)}>
                              <FiEdit className="mr-2 h-4 w-4" />
                              <span>Edit Member</span>
                            </DropdownMenuItem>
                            {member.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleResendInvite(member.email)}>
                                <FiMail className="mr-2 h-4 w-4" />
                                <span>Resend Invite</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                  <FiUserX className="mr-2 h-4 w-4" />
                                  <span>Revoke Access</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will revoke {member.name}'s access to your project. They will no longer be able to view or make changes.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleRevokeAccess(member.id)}
                                  >
                                    Revoke Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiShield className="h-5 w-5" />
                <span>Team Roles</span>
              </CardTitle>
              <CardDescription>
                Learn about the different roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className={`mt-0.5 rounded-full p-2 ${
                      role.id === "admin"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : role.id === "editor"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : role.id === "developer"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {role.id === "admin" ? (
                        <FiShield className="h-4 w-4" />
                      ) : role.id === "editor" ? (
                        <FiEdit className="h-4 w-4" />
                      ) : role.id === "developer" ? (
                        <FiUsers className="h-4 w-4" />
                      ) : (
                        <FiUsers className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{role.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </p>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {[
                          { permission: "View resources", allowed: true },
                          { permission: "Create resources", allowed: role.id !== "viewer" },
                          { permission: "Edit resources", allowed: role.id !== "viewer" },
                          { permission: "Delete resources", allowed: role.id === "admin" },
                          { permission: "Manage team", allowed: role.id === "admin" },
                          { permission: "API access", allowed: role.id === "admin" || role.id === "developer" },
                        ].map((perm, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className={`rounded-full p-1 ${
                              perm.allowed
                                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                            }`}>
                              {perm.allowed ? (
                                <FiCheck className="h-3 w-3" />
                              ) : (
                                <FiUserX className="h-3 w-3" />
                              )}
                            </div>
                            <span>{perm.permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientWrapper>
  );
}
