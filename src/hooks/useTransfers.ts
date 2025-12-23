import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Transfer {
  id: string;
  player_name: string;
  player_image: string | null;
  from_team: string;
  from_team_logo: string | null;
  to_team: string;
  to_team_logo: string | null;
  transfer_type: 'loan' | 'permanent' | 'free' | 'return';
  transfer_fee: string | null;
  is_official: boolean;
  is_published: boolean;
  description: string | null;
  transfer_date: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useTransfers = (publishedOnly: boolean = true) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("transfers")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (publishedOnly) {
        query = query.eq("is_published", true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setTransfers((data as Transfer[]) || []);
    } catch (err) {
      console.error("Error fetching transfers:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [publishedOnly]);

  return { transfers, loading, error, refetch: fetchTransfers };
};
