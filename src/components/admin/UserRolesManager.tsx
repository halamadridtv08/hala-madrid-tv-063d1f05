import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, UserCog } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  email?: string;
}

export const UserRolesManager = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRoles();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rôles utilisateurs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      const existingRole = userRoles.find(r => r.user_id === userId);

      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast({
        title: "Rôle mis à jour",
        description: `Le rôle a été changé en ${getRoleLabel(newRole)}.`,
      });

      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrateur",
      moderator: "Modérateur",
      user: "Utilisateur",
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, any> = {
      admin: "destructive",
      moderator: "default",
      user: "secondary",
    };
    return variants[role] || "outline";
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || userId;
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Gestion des Rôles Utilisateurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rôle actuel</TableHead>
              <TableHead>Modifier le rôle</TableHead>
              <TableHead>Date d'attribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((userRole) => (
              <TableRow key={userRole.id}>
                <TableCell className="font-medium">
                  {getUserEmail(userRole.user_id)}
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(userRole.role)}>
                    {getRoleLabel(userRole.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={userRole.role}
                    onValueChange={(value: 'admin' | 'moderator' | 'user') =>
                      updateUserRole(userRole.user_id, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="moderator">Modérateur</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(userRole.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {userRoles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun rôle utilisateur défini
          </div>
        )}
      </CardContent>
    </Card>
  );
};
