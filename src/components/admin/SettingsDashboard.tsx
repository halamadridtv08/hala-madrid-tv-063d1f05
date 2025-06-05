
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Database, Globe } from "lucide-react";

const SettingsDashboard = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration générale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mode maintenance</h4>
              <p className="text-sm text-gray-600">Activer le mode maintenance du site</p>
            </div>
            <Badge variant="secondary">Désactivé</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications push</h4>
              <p className="text-sm text-gray-600">Envoyer des notifications aux utilisateurs</p>
            </div>
            <Badge variant="default">Activé</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Authentification à deux facteurs</h4>
              <p className="text-sm text-gray-600">Protection supplémentaire pour les administrateurs</p>
            </div>
            <Button variant="outline" size="sm">Configurer</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Logs de sécurité</h4>
              <p className="text-sm text-gray-600">Consulter les tentatives de connexion</p>
            </div>
            <Button variant="outline" size="sm">Voir les logs</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sauvegarde automatique</h4>
              <p className="text-sm text-gray-600">Dernière sauvegarde: il y a 2 heures</p>
            </div>
            <Badge variant="default">Activé</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Optimisation</h4>
              <p className="text-sm text-gray-600">Optimiser les performances de la base</p>
            </div>
            <Button variant="outline" size="sm">Optimiser</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site web
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cache du site</h4>
              <p className="text-sm text-gray-600">Vider le cache pour appliquer les changements</p>
            </div>
            <Button variant="outline" size="sm">Vider le cache</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SEO</h4>
              <p className="text-sm text-gray-600">Configuration du référencement</p>
            </div>
            <Button variant="outline" size="sm">Configurer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsDashboard;
