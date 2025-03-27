'use client';

import { useState, useEffect } from 'react';
import { BaseOperationEditor, BaseOperationEditorProps } from './base-operation-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, BellRing, Clock } from 'lucide-react';
import { EntityAutocomplete, EntityItem } from '@/components/gsb';
import { 
  GsbContact, 
  GsbGroup, 
  GsbRole 
} from '@/lib/gsb/models/gsb-organization.model';
import { GsbUser } from '@/lib/gsb/models/gsb-user.model';
import { NotificationDto, GsbNotificationOpRecipients } from '@/lib/gsb/models/gsb-function.model';
import { EntityUiService } from '@/lib/services/ui/entity-ui.service';

export function NotificationOperationEditor({ operation, onChange }: BaseOperationEditorProps) {
  const entityUiService = EntityUiService.getInstance();
  
  // State for entities
  const [contacts, setContacts] = useState<GsbContact[]>([]);
  const [users, setUsers] = useState<GsbUser[]>([]);
  const [roles, setRoles] = useState<GsbRole[]>([]);
  const [groups, setGroups] = useState<GsbGroup[]>([]);
  
  // Loading states
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  
  // Load initial data
  useEffect(() => {
    fetchContacts();
    fetchUsers();
    fetchRoles();
    fetchGroups();
  }, []);
  
  // Fetch contacts
  const fetchContacts = async (searchTerm?: string) => {
    setIsLoadingContacts(true);
    try {
      const items = await entityUiService.getContacts(searchTerm);
      setContacts(items as GsbContact[]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };
  
  // Fetch users
  const fetchUsers = async (searchTerm?: string) => {
    setIsLoadingUsers(true);
    try {
      const items = await entityUiService.getUsers(searchTerm);
      setUsers(items as GsbUser[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Fetch roles
  const fetchRoles = async (searchTerm?: string) => {
    setIsLoadingRoles(true);
    try {
      const items = await entityUiService.getRoles(searchTerm);
      setRoles(items as GsbRole[]);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };
  
  // Fetch groups
  const fetchGroups = async (searchTerm?: string) => {
    setIsLoadingGroups(true);
    try {
      const items = await entityUiService.getGroups(searchTerm);
      setGroups(items as GsbGroup[]);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Get notification configuration from operation or initialize
  const [notificationConfig, setNotificationConfig] = useState<NotificationDto>(() => {
    const defaultConfig: NotificationDto = {
      title: '',
      message: '',
      recipients: {
        contacts: [],
        users: [],
        roles: [],
        groups: [],
        excludeUsers: [],
        excludeSender: false
      },
      priority: 1,
      category: 'system',
      expiryDate: undefined
    };
    
    // Initialize with data from operation if available
    if (operation.notification) {
      // Make sure recipients subproperties are properly initialized as arrays
      const mergedRecipients = {
        ...defaultConfig.recipients,
        ...operation.notification.recipients,
        contacts: Array.isArray(operation.notification.recipients?.contacts) 
          ? operation.notification.recipients.contacts 
          : [],
        users: Array.isArray(operation.notification.recipients?.users) 
          ? operation.notification.recipients.users 
          : [],
        roles: Array.isArray(operation.notification.recipients?.roles) 
          ? operation.notification.recipients.roles 
          : [],
        groups: Array.isArray(operation.notification.recipients?.groups) 
          ? operation.notification.recipients.groups 
          : [],
        excludeUsers: Array.isArray(operation.notification.recipients?.excludeUsers) 
          ? operation.notification.recipients.excludeUsers 
          : []
      };
      
      return {
        ...defaultConfig,
        ...operation.notification,
        recipients: mergedRecipients
      };
    }
    
    return defaultConfig;
  });

  // Recipients management
  const [recipientsTab, setRecipientsTab] = useState('contacts');

  // Update operation when config changes
  useEffect(() => {
    const updatedOperation = {
      ...operation,
      notification: notificationConfig
    };
    
    onChange(updatedOperation);
  }, [notificationConfig]);

  // Handle adding a recipient
  const handleAddRecipient = (id: string, type: keyof GsbNotificationOpRecipients) => {
    if (!id || typeof type !== 'string') return;
    
    // Find the entity
    let entity: any = null;
    switch(type) {
      case 'contacts':
        entity = contacts.find(c => c.id === id);
        break;
      case 'users':
        entity = users.find(u => u.id === id);
        break;
      case 'roles':
        entity = roles.find(r => r.id === id);
        break;
      case 'groups':
        entity = groups.find(g => g.id === id);
        break;
      case 'excludeUsers':
        entity = users.find(u => u.id === id);
        break;
    }
    
    if (!entity) return;
    
    // Add to recipients if not already added
    if (Array.isArray(notificationConfig.recipients[type]) && 
        !notificationConfig.recipients[type].some((r: any) => r.id === id)) {
      setNotificationConfig(prev => ({
        ...prev,
        recipients: {
          ...prev.recipients,
          [type]: [...(prev.recipients[type] as any[]), entity]
        }
      }));
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (id: string, type: keyof GsbNotificationOpRecipients) => {
    setNotificationConfig(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        [type]: (prev.recipients[type] as any[]).filter((r: any) => r.id !== id)
      }
    }));
  };

  // Handle title change
  const handleTitleChange = (value: string) => {
    setNotificationConfig(prev => ({
      ...prev,
      title: value
    }));
  };

  // Handle message change
  const handleMessageChange = (value: string) => {
    setNotificationConfig(prev => ({
      ...prev,
      message: value
    }));
  };

  // Handle priority change
  const handlePriorityChange = (value: string) => {
    setNotificationConfig(prev => ({
      ...prev,
      priority: parseInt(value)
    }));
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setNotificationConfig(prev => ({
      ...prev,
      category: value
    }));
  };

  // Handle exclude sender toggle
  const handleExcludeSenderChange = (value: boolean) => {
    setNotificationConfig(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        excludeSender: value
      }
    }));
  };

  return (
    <BaseOperationEditor operation={operation} onChange={onChange}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notificationTitle">Title</Label>
          <Input
            id="notificationTitle"
            value={notificationConfig.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Notification title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notificationMessage">Message</Label>
          <Textarea
            id="notificationMessage"
            value={notificationConfig.message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Notification message content"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="notificationPriority">Priority</Label>
            <Select 
              value={notificationConfig.priority?.toString()} 
              onValueChange={handlePriorityChange}
            >
              <SelectTrigger id="notificationPriority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Low</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">High</SelectItem>
                <SelectItem value="4">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notificationCategory">Category</Label>
            <Select 
              value={notificationConfig.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="notificationCategory">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="info">Information</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Recipients</Label>
          <Tabs value={recipientsTab} onValueChange={setRecipientsTab}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="exclude">Exclude</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contacts" className="space-y-4">
              <EntityAutocomplete
                entities={contacts}
                placeholder="Select contact"
                onValueChange={(id) => handleAddRecipient(id, 'contacts')}
                displayField="name"
              />
              
              <div className="flex flex-wrap gap-2">
                {notificationConfig.recipients.contacts.map((contact: GsbContact) => (
                  <Badge key={contact.id} variant="secondary" className="flex items-center gap-1">
                    <BellRing className="h-3 w-3" />
                    {contact.name}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveRecipient(contact.id, 'contacts')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {notificationConfig.recipients.contacts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No contacts selected.</p>
                )}
              </div>
            </TabsContent>
            
            {/* Similar TabsContent blocks for users, roles, groups, and exclude */}
            <TabsContent value="users" className="space-y-4">
              <EntityAutocomplete
                entities={users}
                placeholder="Select user"
                onValueChange={(id) => handleAddRecipient(id, 'users')}
                displayField="name"
              />
              
              <div className="flex flex-wrap gap-2">
                {notificationConfig.recipients.users.map((user: GsbUser) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                    {user.name}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveRecipient(user.id, 'users')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {notificationConfig.recipients.users.length === 0 && (
                  <p className="text-sm text-muted-foreground">No users selected.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="roles" className="space-y-4">
              <EntityAutocomplete
                entities={roles}
                placeholder="Select role"
                onValueChange={(id) => handleAddRecipient(id, 'roles')}
                displayField="name"
              />
              
              <div className="flex flex-wrap gap-2">
                {notificationConfig.recipients.roles.map((role: GsbRole) => (
                  <Badge key={role.id} variant="secondary" className="flex items-center gap-1">
                    {role.name}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveRecipient(role.id, 'roles')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {notificationConfig.recipients.roles.length === 0 && (
                  <p className="text-sm text-muted-foreground">No roles selected.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="groups" className="space-y-4">
              <EntityAutocomplete
                entities={groups}
                placeholder="Select group"
                onValueChange={(id) => handleAddRecipient(id, 'groups')}
                displayField="name"
              />
              
              <div className="flex flex-wrap gap-2">
                {notificationConfig.recipients.groups.map((group: GsbGroup) => (
                  <Badge key={group.id} variant="secondary" className="flex items-center gap-1">
                    {group.name}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveRecipient(group.id, 'groups')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {notificationConfig.recipients.groups.length === 0 && (
                  <p className="text-sm text-muted-foreground">No groups selected.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="exclude" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="excludeSender"
                  checked={notificationConfig.recipients.excludeSender}
                  onChange={(e) => handleExcludeSenderChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="excludeSender" className="font-normal">
                  Exclude current user (sender)
                </Label>
              </div>
              
              <EntityAutocomplete
                entities={users}
                placeholder="Select user to exclude"
                onValueChange={(id) => handleAddRecipient(id, 'excludeUsers')}
                displayField="name"
              />
              
              <div className="flex flex-wrap gap-2">
                {notificationConfig.recipients.excludeUsers.map((user: GsbUser) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {user.name}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveRecipient(user.id, 'excludeUsers')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {notificationConfig.recipients.excludeUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No excluded users.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BaseOperationEditor>
  );
} 