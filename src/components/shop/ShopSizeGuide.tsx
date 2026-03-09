import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Info } from "lucide-react";

interface ShopSizeGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sizes = {
  jerseys: {
    label: "Maillots",
    headers: ["Taille", "Tour de poitrine (cm)", "Tour de taille (cm)", "Longueur (cm)"],
    rows: [
      ["XS", "84-88", "72-76", "68"],
      ["S", "88-96", "76-84", "70"],
      ["M", "96-104", "84-92", "72"],
      ["L", "104-112", "92-100", "74"],
      ["XL", "112-120", "100-108", "76"],
      ["XXL", "120-128", "108-116", "78"],
    ],
  },
  accessories: {
    label: "Accessoires",
    headers: ["Taille", "Tour de tête (cm)", "Correspondance"],
    rows: [
      ["S/M", "54-57", "Petit / Moyen"],
      ["L/XL", "58-62", "Grand / Très Grand"],
      ["Unique", "54-62", "Taille ajustable"],
    ],
  },
};

export const ShopSizeGuide = ({ open, onOpenChange }: ShopSizeGuideProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="font-montserrat font-black text-lg uppercase tracking-wider flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Guide des tailles
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="jerseys" className="mt-4">
          <TabsList className="w-full rounded-none bg-muted/50 h-11">
            {Object.entries(sizes).map(([key, { label }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex-1 rounded-none text-xs font-bold uppercase tracking-wider data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(sizes).map(([key, { headers, rows }]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      {headers.map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className={`px-4 py-3 text-sm ${j === 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tips */}
              <div className="mt-4 p-4 bg-muted/30 border border-border flex items-start gap-3">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Comment mesurer ?</p>
                  <p>• <strong>Poitrine :</strong> Mesurez sous les aisselles, au point le plus large</p>
                  <p>• <strong>Taille :</strong> Mesurez autour de la taille naturelle</p>
                  <p>• En cas de doute, prenez la taille au-dessus</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
