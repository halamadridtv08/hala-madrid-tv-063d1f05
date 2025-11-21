import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, BellOff, Check, Plus, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AlertThreshold {
  id: string;
  stat_type: string;
  threshold_value: number;
  alert_message: string;
  is_active: boolean;
}

interface PlayerAlert {
  id: string;
  player_id: string;
  stat_type: string;
  current_value: number;
  threshold_value: number;
  alert_message: string;
  is_acknowledged: boolean;
  triggered_at: string;
  players: {
    name: string;
    image_url: string;
  };
}

export const PlayerStatsAlerts = () => {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [alerts, setAlerts] = useState<PlayerAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New threshold form
  const [newStatType, setNewStatType] = useState<string>("goals");
  const [newThresholdValue, setNewThresholdValue] = useState<string>("10");
  const [newAlertMessage, setNewAlertMessage] = useState<string>("{player} a atteint {value} buts !");

  useEffect(() => {
    loadThresholds();
    loadAlerts();
    
    // Set up real-time subscription for alerts
    const alertsChannel = supabase
      .channel('player_alerts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'player_alerts' },
        () => loadAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  const loadThresholds = async () => {
    try {
      const { data, error } = await supabase
        .from('player_alert_thresholds')
        .select('*')
        .order('stat_type', { ascending: true });

      if (error) throw error;
      setThresholds(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des seuils:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('player_alerts')
        .select(`
          *,
          players (
            name,
            image_url
          )
        `)
        .eq('is_acknowledged', false)
        .order('triggered_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    }
  };

  const handleAddThreshold = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('player_alert_thresholds')
        .insert({
          stat_type: newStatType,
          threshold_value: parseInt(newThresholdValue),
          alert_message: newAlertMessage
        });

      if (error) throw error;

      toast.success("Seuil d'alerte ajouté avec succès");
      loadThresholds();
      
      // Reset form
      setNewThresholdValue("10");
      setNewAlertMessage("{player} a atteint {value} buts !");
    } catch (error) {
      console.error('Erreur lors de l\'ajout du seuil:', error);
      toast.error("Erreur lors de l'ajout du seuil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleThreshold = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('player_alert_thresholds')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast.success(isActive ? "Seuil désactivé" : "Seuil activé");
      loadThresholds();
    } catch (error) {
      console.error('Erreur lors de la modification du seuil:', error);
      toast.error("Erreur lors de la modification du seuil");
    }
  };

  const handleDeleteThreshold = async (id: string) => {
    try {
      const { error } = await supabase
        .from('player_alert_thresholds')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Seuil supprimé");
      loadThresholds();
    } catch (error) {
      console.error('Erreur lors de la suppression du seuil:', error);
      toast.error("Erreur lors de la suppression du seuil");
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('player_alerts')
        .update({ 
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success("Alerte acquittée");
      loadAlerts();
    } catch (error) {
      console.error('Erreur lors de l\'acquittement:', error);
      toast.error("Erreur lors de l'acquittement");
    }
  };

  const handleCheckAlerts = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('check_player_stats_alerts');

      if (error) throw error;

      toast.success("Vérification des alertes effectuée");
      loadAlerts();
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes:', error);
      toast.error("Erreur lors de la vérification des alertes");
    } finally {
      setIsLoading(false);
    }
  };

  const statTypeLabels: Record<string, string> = {
    goals: "Buts",
    assists: "Passes Décisives",
    yellow_cards: "Cartons Jaunes",
    red_cards: "Cartons Rouges"
  };

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertCircle className="h-5 w-5" />
              Alertes Actives ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {alert.players?.image_url && (
                    <img 
                      src={alert.players.image_url} 
                      alt={alert.players.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{alert.alert_message}</p>
                    <p className="text-sm text-muted-foreground">
                      {statTypeLabels[alert.stat_type]}: {alert.current_value} (seuil: {alert.threshold_value})
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Acquitter
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Threshold Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configuration des Alertes
            </CardTitle>
            <Button onClick={handleCheckAlerts} disabled={isLoading} size="sm">
              Vérifier les alertes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new threshold */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Ajouter un nouveau seuil</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statistique</label>
                <Select value={newStatType} onValueChange={setNewStatType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goals">Buts</SelectItem>
                    <SelectItem value="assists">Passes Décisives</SelectItem>
                    <SelectItem value="yellow_cards">Cartons Jaunes</SelectItem>
                    <SelectItem value="red_cards">Cartons Rouges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seuil</label>
                <Input 
                  type="number" 
                  value={newThresholdValue}
                  onChange={(e) => setNewThresholdValue(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Input 
                  value={newAlertMessage}
                  onChange={(e) => setNewAlertMessage(e.target.value)}
                  placeholder="{player} a atteint {value}..."
                />
              </div>
            </div>
            <Button onClick={handleAddThreshold} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le seuil
            </Button>
          </div>

          {/* Existing thresholds */}
          <div className="space-y-2">
            <h3 className="font-medium">Seuils configurés</h3>
            {thresholds.map(threshold => (
              <div key={threshold.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={threshold.is_active ? "default" : "secondary"}>
                    {statTypeLabels[threshold.stat_type]}
                  </Badge>
                  <span className="font-medium">{threshold.threshold_value}</span>
                  <span className="text-sm text-muted-foreground">{threshold.alert_message}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleThreshold(threshold.id, threshold.is_active)}
                  >
                    {threshold.is_active ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteThreshold(threshold.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
