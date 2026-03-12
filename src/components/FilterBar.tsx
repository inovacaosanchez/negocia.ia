import { FiltrosGlobais } from "@/types/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface FilterBarProps {
  filtros: FiltrosGlobais;
  onFiltrosChange: (filtros: FiltrosGlobais) => void;
  tabulacoes: string[];
  operadores: string[];
}

const FilterBar = ({ filtros, onFiltrosChange, tabulacoes, operadores }: FilterBarProps) => {
  const handleClear = () => {
    onFiltrosChange({});
  };

  const hasFilters = Object.values(filtros).some((v) => v !== undefined && v !== null && v !== "");

  // Função auxiliar: converte YYYY-MM-DD para DD/MM/YYYY
  const formatDateBR = (isoDate?: string) => {
    if (!isoDate) return "";
    const [ano, mes, dia] = isoDate.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // Função auxiliar: converte DD/MM/YYYY para YYYY-MM-DD (para exibir no input type="date")
  const formatDateISO = (brDate?: string) => {
    if (!brDate) return "";
    const [dia, mes, ano] = brDate.split("/");
    return `${ano}-${mes}-${dia}`;
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Filtros Globais</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Data Início */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Data Início</Label>
          <Input
            type="date"
            value={formatDateISO(filtros.dataInicio)}
            onChange={(e) => {
              const [ano, mes, dia] = e.target.value.split("-");
              onFiltrosChange({ ...filtros, dataInicio: `${dia}/${mes}/${ano}` });
            }}
            className="bg-secondary border-border"
          />
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Data Fim</Label>
          <Input
            type="date"
            value={formatDateISO(filtros.dataFim)}
            onChange={(e) => {
              const [ano, mes, dia] = e.target.value.split("-");
              onFiltrosChange({ ...filtros, dataFim: `${dia}/${mes}/${ano}` });
            }}
            className="bg-secondary border-border"
          />
        </div>

        {/* Tabulação */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Tabulação</Label>
          <Select
            value={filtros.tabulacao || "all"}
            onValueChange={(v) => onFiltrosChange({ ...filtros, tabulacao: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {tabulacoes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ID Operador */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">ID Operador</Label>
          <Select
            value={filtros.idOperador || "all"}
            onValueChange={(v) => onFiltrosChange({ ...filtros, idOperador: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {operadores.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ID Ligação */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">ID Ligação</Label>
          <Input
            type="text"
            placeholder="Ex: LIG001"
            value={filtros.idLigacao || ""}
            onChange={(e) => onFiltrosChange({ ...filtros, idLigacao: e.target.value || undefined })}
            className="bg-secondary border-border"
          />
        </div>

        {/* Acordo */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Acordo</Label>
          <Select
            value={filtros.acordo === true ? "sim" : filtros.acordo === false ? "nao" : "all"}
            onValueChange={(v) => onFiltrosChange({ 
              ...filtros, 
              acordo: v === "sim" ? true : v === "nao" ? false : null 
            })}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
