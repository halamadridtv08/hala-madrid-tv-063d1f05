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
import { Input } from "@/components/ui/input";
import { Shield, UserCog, History, Search, Filter, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserRole {
  user_id: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

interface RoleHistory {
  id: string;
  user_id: string;
  user_email: string;
  old_role: 'admin' | 'moderator' | 'user' | null;
  new_role: 'admin' | 'moderator' | 'user';
  changed_by: string;
  changed_by_email: string;
  reason: string | null;
  created_at: string;
}

export const UserRolesManager = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<UserRole[]>([]);
  const [roleHistory, setRoleHistory] = useState<RoleHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "email">("date");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRoles();
    fetchRoleHistory();
  }, []);

  useEffect(() => {
    filterAndSortRoles();
  }, [userRoles, searchTerm, roleFilter, sortBy]);

  const fetchRoleHistory = async () => {
    try {
      const { data, error } = await supabase.rpc('get_role_history', {
        p_user_id: null
      });

      if (error) throw error;
      setRoleHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching role history:', error);
    }
  };

  const filterAndSortRoles = () => {
    let filtered = [...userRoles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role - by default only show admin and moderator
    if (roleFilter === "all") {
      filtered = filtered.filter(role => role.role === 'admin' || role.role === 'moderator');
    } else {
      filtered = filtered.filter(role => role.role === roleFilter);
    }

    // Role priority: admin > moderator > user
    const rolePriority: Record<string, number> = {
      admin: 0,
      moderator: 1,
      user: 2,
    };

    // Sort by role priority first, then by secondary sort
    filtered.sort((a, b) => {
      const priorityDiff = rolePriority[a.role] - rolePriority[b.role];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary sort
      if (sortBy === "email") {
        return a.email.localeCompare(b.email);
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredRoles(filtered);
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_users_with_roles');

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

      await fetchUserRoles();
      await fetchRoleHistory();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const restoreRole = async (historyId: string, userId: string, oldRole: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: oldRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Rôle restauré",
        description: `Le rôle a été restauré à ${getRoleLabel(oldRole)}.`,
      });

      await fetchUserRoles();
      await fetchRoleHistory();
      setShowHistory(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const viewUserHistory = (userId: string) => {
    setSelectedUserId(userId);
    setShowHistory(true);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  const filteredHistory = selectedUserId 
    ? roleHistory.filter(h => h.user_id === selectedUserId)
    : roleHistory;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Gestion des Rôles Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="moderator">Modérateur</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: "date" | "email") => setSortBy(v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Trier par date</SelectItem>
                <SelectItem value="email">Trier par email</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUserId(null);
                setShowHistory(true);
              }}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Historique complet
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle actuel</TableHead>
                  <TableHead>Modifier le rôle</TableHead>
                  <TableHead>Date d'attribution</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((userRole) => (
                  <TableRow key={userRole.user_id}>
                    <TableCell className="font-medium">
                      {userRole.email}
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
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewUserHistory(userRole.user_id)}
                        className="gap-2"
                      >
                        <History className="h-4 w-4" />
                        Historique
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || roleFilter !== "all"
                ? "Aucun utilisateur ne correspond aux critères de recherche"
                : "Aucun rôle utilisateur défini"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {selectedUserId 
                ? `Historique de ${userRoles.find(r => r.user_id === selectedUserId)?.email}`
                : "Historique complet des changements"}
            </DialogTitle>
            <DialogDescription>
              Consultez l'historique des modifications de rôles et restaurez si nécessaire
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((history) => (
                <Card key={history.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{history.user_email}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(history.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {history.old_role && (
                            <>
                              <Badge variant={getRoleBadgeVariant(history.old_role)}>
                                {getRoleLabel(history.old_role)}
                              </Badge>
                              <span>→</span>
                            </>
                          )}
                          <Badge variant={getRoleBadgeVariant(history.new_role)}>
                            {getRoleLabel(history.new_role)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Modifié par: {history.changed_by_email}
                        </div>
                        {history.reason && (
                          <div className="text-sm">
                            Raison: {history.reason}
                          </div>
                        )}
                      </div>
                      {history.old_role && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreRole(history.id, history.user_id, history.old_role!)}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restaurer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun historique disponible
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
