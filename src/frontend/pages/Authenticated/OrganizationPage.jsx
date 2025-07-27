// src/frontend/pages/Authenticated/OrganizationPage.jsx
import React, { useEffect, useState,useCallback } from 'react';
import { useUserStore } from '../../store/userStore';
import { getData, postData } from '../../utils/BackendRequestHelper';
import { Building, UserPlus, Loader2, AlertCircle, Shield, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';

const getInitials = (firstName = '', lastName = '') => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase();
}

const InviteMemberDialog = ({ onInviteSent }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInvite = async () => {
        setError('');
        if (!email || !role) {
            setError('Please provide a valid email and select a role.');
            return;
        }
        setLoading(true);
        try {
            await postData('/invitations', { email, role });
            toast({
                title: 'Invitation Sent!',
                description: `${email} has been invited to join your organization.`,
            });
            setOpen(false);
            setEmail('');
            setRole('member');
            if (onInviteSent) onInviteSent(); // Callback to refresh member list
        } catch (err) {
            setError(err.message || 'Failed to send invitation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite a New Team Member</DialogTitle>
                    <DialogDescription>
                        Enter their email and assign a role. They'll receive an email to sign up and join.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="new.member@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const OrganizationPage = () => {
    const { organization, role } = useUserStore();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const memberData = await getData('/organizations/my-organization/members');
            setMembers(memberData);
        } catch (err) {
            setError('Failed to load team members. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (organization?.organization_id) {
            fetchMembers();
        } else {
            setLoading(false);
        }
    }, [organization, fetchMembers]);

    const isAdmin = role === 'admin';

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-muted rounded-lg"><Building className="h-8 w-8 text-primary" /></div>
                    <div>
                        <h1 className="text-3xl font-bold">{organization?.name || 'Organization'}</h1>
                        <p className="text-muted-foreground">Manage your team members and organization settings.</p>
                    </div>
                </div>
            </motion.div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''} in your organization.</CardDescription>
                    </div>
                    {isAdmin && <InviteMemberDialog onInviteSent={fetchMembers} />}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : error ? (
                        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
                    ) : (
                        <div className="space-y-2">
                            {members.map((member, index) => (
                                <React.Fragment key={member.user_id}>
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                                            <div className="flex items-center space-x-4">
                                                <Avatar><AvatarImage src={member.avatar_url} /><AvatarFallback>{getInitials(member.first_name, member.last_name)}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="font-semibold">{member.first_name && member.last_name ? `${member.first_name} ${member.last_name}` : member.email}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {member.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                                                {member.role}
                                            </Badge>
                                        </div>
                                    </motion.div>
                                    {index < members.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};