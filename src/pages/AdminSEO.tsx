import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEOManager } from "@/components/admin/SEOManager";

const AdminSEOPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="madrid-container py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au panneau admin
          </Button>
        </div>
        <SEOManager />
      </div>
    </div>
  );
};

export default AdminSEOPage;
