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
import { X, Plus, Mail } from 'lucide-react';
import { EntityAutocomplete, EntityItem } from '@/components/gsb';
import { 
  GsbContact, 
  GsbGroup, 
  GsbRole 
} from '@/lib/gsb/models/gsb-organization.model';
import { GsbUser } from '@/lib/gsb/models/gsb-user.model';
import { GsbDocTemplate } from '@/lib/gsb/models/gsb-doc-template.model';
import { GsbMailMessageOp, GsbNotificationOpRecipients } from '@/lib/gsb/models/gsb-function.model';
import { EntityUiService } from '@/lib/services/ui/entity-ui.service';

export function EmailOperationEditor({ operation, onChange }: BaseOperationEditorProps) {
  const entityUiService = EntityUiService.getInstance();
  
  // State for entities
  const [templates, setTemplates] = useState<GsbDocTemplate[]>([]);
  const [contacts, setContacts] = useState<GsbContact[]>([]);
  const [users, setUsers] = useState<GsbUser[]>([]);
  const [roles, setRoles] = useState<GsbRole[]>([]);
  const [groups, setGroups] = useState<GsbGroup[]>([]);
  
  // Loading states
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  
  // Load initial data
  useEffect(() => {
    fetchTemplates();
    fetchContacts();
    fetchUsers();
    fetchRoles();
    fetchGroups();
  }, []);
  
  // Fetch templates
  const fetchTemplates = async (searchTerm?: string) => {
    setIsLoadingTemplates(true);
    try {
      const items = await entityUiService.getDocTemplates(searchTerm);
      setTemplates(items as GsbDocTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };
  
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

  // Get email configuration from operation or initialize
  const [emailConfig, setEmailConfig] = useState<GsbMailMessageOp>(() => {
    const defaultConfig: GsbMailMessageOp = {
      toAddresses: [],
      ccAddresses: [],
      bccAddresses: [],
      subject: '',
      distinct: true,
      messageBody: { id: '', name: '' },
      attachments: []
    };
    
    // Initialize with data from operation if available
    if (operation.notification?.message) {
      defaultConfig.subject = operation.notification.title || '';
    }
    
    return defaultConfig;
  });

  // Recipients management
  const [recipientsTab, setRecipientsTab] = useState('contacts');
  
  // Initialize recipients from operation
  const [recipients, setRecipients] = useState<GsbNotificationOpRecipients>(() => {
    const defaultRecipients = {
      contacts: [],
      users: [],
      roles: [],
      groups: [],
      excludeUsers: [],
      excludeSender: false
    };
    
    // Initialize with data from operation if available
    if (operation.notification?.recipients) {
      return {
        ...defaultRecipients,
        ...operation.notification.recipients,
        contacts: Array.isArray(operation.notification.recipients.contacts) 
          ? operation.notification.recipients.contacts 
          : [],
        users: Array.isArray(operation.notification.recipients.users) 
          ? operation.notification.recipients.users 
          : [],
        roles: Array.isArray(operation.notification.recipients.roles) 
          ? operation.notification.recipients.roles 
          : [],
        groups: Array.isArray(operation.notification.recipients.groups) 
          ? operation.notification.recipients.groups 
          : [],
        excludeUsers: Array.isArray(operation.notification.recipients.excludeUsers) 
          ? operation.notification.recipients.excludeUsers 
          : []
      };
    }
    
    return defaultRecipients;
  });

  // Update operation when config changes
  useEffect(() => {
    const updatedOperation = {
      ...operation,
      notification: {
        ...operation.notification,
        title: emailConfig.subject || 'Email Notification',
        message: 'Email notification content',
        recipients: recipients
      }
    };
    
    onChange(updatedOperation);
  }, [emailConfig, recipients]);

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
    if (Array.isArray(recipients[type]) && !recipients[type].some((r: any) => r.id === id)) {
      setRecipients(prev => ({
        ...prev,
        [type]: [...(prev[type] as any[]), entity]
      }));
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (id: string, type: keyof GsbNotificationOpRecipients) => {
    setRecipients(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter((r: any) => r.id !== id)
    }));
  };

  // Handle subject change
  const handleSubjectChange = (value: string) => {
    setEmailConfig(prev => ({
      ...prev,
      subject: value
    }));
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string, item?: EntityItem) => {
    setEmailConfig(prev => ({
      ...prev,
      messageBody: { id: templateId, name: item?.name || '' }
    }));
  };

  return (
    <BaseOperationEditor operation={operation} onChange={onChange}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emailSubject">Subject</Label>
          <Input
            id="emailSubject"
            value={emailConfig.subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="Email subject"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Email Body Template</Label>
          <EntityAutocomplete
            entities={templates}
            value={emailConfig.messageBody?.id}
            onValueChange={handleTemplateChange}
            placeholder="Select email template"
            emptyMessage="No templates found."
            displayField="name"
            isLoading={isLoadingTemplates}
            onSearch={fetchTemplates}
          />
          <p className="text-xs text-muted-foreground">
            Select a template for the email body.
          </p>
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
                isLoading={isLoadingContacts}
                onSearch={fetchContacts}
              />
              
              <div className="flex flex-wrap gap-2">
                {recipients.contacts.map((contact: GsbContact) => (
                  <Badge key={contact.id} variant="secondary" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
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
                
                {recipients.contacts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No contacts selected.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <EntityAutocomplete
                entities={users}
                placeholder="Select user"
                onValueChange={(id) => handleAddRecipient(id, 'users')}
                displayField="name"
                isLoading={isLoadingUsers}
                onSearch={fetchUsers}
              />
              
              <div className="flex flex-wrap gap-2">
                {recipients.users.map((user: GsbUser) => (
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
                
                {recipients.users.length === 0 && (
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
                isLoading={isLoadingRoles}
                onSearch={fetchRoles}
              />
              
              <div className="flex flex-wrap gap-2">
                {recipients.roles.map((role: GsbRole) => (
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
                
                {recipients.roles.length === 0 && (
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
                isLoading={isLoadingGroups}
                onSearch={fetchGroups}
              />
              
              <div className="flex flex-wrap gap-2">
                {recipients.groups.map((group: GsbGroup) => (
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
                
                {recipients.groups.length === 0 && (
                  <p className="text-sm text-muted-foreground">No groups selected.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="exclude" className="space-y-4">
              <EntityAutocomplete
                entities={users}
                placeholder="Select user to exclude"
                onValueChange={(id) => handleAddRecipient(id, 'excludeUsers')}
                displayField="name"
                isLoading={isLoadingUsers}
                onSearch={fetchUsers}
              />
              
              <div className="flex flex-wrap gap-2">
                {recipients.excludeUsers.map((user: GsbUser) => (
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
                
                {recipients.excludeUsers.length === 0 && (
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