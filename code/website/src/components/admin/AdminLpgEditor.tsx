import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw, Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { siteSettingsService, type LpgFeatures, type LpgFeatureCard } from "@/services/siteSettingsService";
import { DEFAULT_LPG_FEATURES } from "@/data/contentDefaults";
import { useQueryClient } from "@tanstack/react-query";

const inputClass = "kraakman-input";

interface Props {
  initial?: LpgFeatures;
}

const AdminLpgEditor = ({ initial }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [data, setData] = useState<LpgFeatures>(
    initial ?? DEFAULT_LPG_FEATURES
  );

  useEffect(() => {
    if (initial) setData(initial);
  }, [initial]);

  const updateCard = (index: number, updates: Partial<LpgFeatureCard>) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) => (i === index ? { ...card, ...updates } : card)),
    }));
  };

  const updateFeature = (cardIdx: number, featureIdx: number, value: string) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, ci) =>
        ci === cardIdx
          ? {
              ...card,
              features: card.features.map((f, fi) =>
                fi === featureIdx ? value : f
              ),
            }
          : card
      ),
    }));
  };

  const addFeature = (cardIdx: number) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, ci) =>
        ci === cardIdx
          ? { ...card, features: [...card.features, ""] }
          : card
      ),
    }));
  };

  const removeFeature = (cardIdx: number, featureIdx: number) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, ci) =>
        ci === cardIdx
          ? { ...card, features: card.features.filter((_, fi) => fi !== featureIdx) }
          : card
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await siteSettingsService.update("lpg_features", data);
    if (error) {
      toast({ title: "Fout", description: "Kon LPG content niet opslaan.", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Opgeslagen", description: "LPG content bijgewerkt." });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setData(DEFAULT_LPG_FEATURES);
    setExpandedCard(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold block">LPG Kaarten ({data.cards.length})</Label>

        {data.cards.map((card, cardIdx) => {
          const isExpanded = expandedCard === cardIdx;
          return (
            <div key={cardIdx} className="border border-border">
              <button
                onClick={() => setExpandedCard(isExpanded ? null : cardIdx)}
                className="w-full flex items-center justify-between p-4 text-left font-medium"
                style={{ backgroundColor: isExpanded ? "var(--color-primary)" : "transparent", color: isExpanded ? "var(--color-background)" : "var(--color-secondary)" }}
              >
                <span>{card.title || `Kaart ${cardIdx + 1}`}</span>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4 border-t border-border">
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Titel</Label>
                    <Input
                      className={inputClass}
                      value={card.title}
                      onChange={(e) => updateCard(cardIdx, { title: e.target.value })}
                      style={{ lineHeight: "24px" }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Beschrijving</Label>
                    <p className="text-xs text-muted-foreground mb-1">Gebruik een lege regel voor een nieuwe alinea</p>
                    <Textarea
                      className="kraakman-textarea"
                      value={card.description}
                      onChange={(e) => updateCard(cardIdx, { description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Checklist Titel</Label>
                    <Input
                      className={inputClass}
                      value={card.checklistTitle}
                      onChange={(e) => updateCard(cardIdx, { checklistTitle: e.target.value })}
                      style={{ lineHeight: "24px" }}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Checklist Items ({card.features.length})</Label>
                    <div className="space-y-2">
                      {card.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex gap-2 items-start">
                          <Input
                            className={inputClass}
                            value={feature}
                            onChange={(e) => updateFeature(cardIdx, featureIdx, e.target.value)}
                            placeholder="Checklist item"
                            style={{ lineHeight: "24px", flex: "1" }}
                          />
                          <button
                            onClick={() => removeFeature(cardIdx, featureIdx)}
                            className="p-2 shrink-0 mt-2"
                            style={{ color: "var(--color-secondary)" }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button variant="default" size="sm" onClick={() => addFeature(cardIdx)} className="mt-2">
                      <Plus className="w-3 h-3 mr-1" /> Item toevoegen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          LPG content opslaan
        </Button>
        <Button variant="default" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset naar standaard
        </Button>
      </div>
    </div>
  );
};

export default AdminLpgEditor;
