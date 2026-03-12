import { RegistroAnalitico } from "@/types/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableIcon, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AnalyticsTableProps {
  dados: RegistroAnalitico[];
  hideSentimentoColumn?: boolean;
}

type SortField =
  | "dataLigacao"
  | "idOperador"
  | "cliente"
  | "cpfCnpj"
  | "duracaoSegundos"
  | "palavras";
type SortDirection = "asc" | "desc";

// Converte DDMMYYYY -> Date, aceitando também Date já convertido
const parseData = (data?: string | Date) => {
  if (!data) return new Date(0);
  if (data instanceof Date) return data;
  if (data.length !== 8) return new Date(0);
  const dia = parseInt(data.slice(0, 2), 10);
  const mes = parseInt(data.slice(2, 4), 10) - 1;
  const ano = parseInt(data.slice(4, 8), 10);
  return new Date(ano, mes, dia);
};

const AnalyticsTable = ({ dados }: AnalyticsTableProps) => {
  const [sortField, setSortField] = useState<SortField>("dataLigacao");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = [...dados].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "dataLigacao":
        comparison = parseData(a.dataLigacao).getTime() - parseData(b.dataLigacao).getTime();
        break;
      case "idOperador":
        comparison = a.idOperador.localeCompare(b.idOperador);
        break;
      case "cliente":
        comparison = (a.cliente || "").localeCompare(b.cliente || "");
        break;
      case "cpfCnpj":
        comparison = (a.cpfCnpj || "").localeCompare(b.cpfCnpj || "");
        break;
      case "duracaoSegundos":
        comparison = a.duracaoSegundos - b.duracaoSegundos;
        break;
      case "palavras":
        comparison = a.palavras - b.palavras;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const formatDuracao = (segundos: number) => {
    const totalSegundos = Math.floor(segundos);
    const min = Math.floor(totalSegundos / 60);
    const sec = totalSegundos % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <TableIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Analítico de Transcrições</h3>
        <span className="text-sm text-muted-foreground ml-auto">
          {dados.length} registro{dados.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-lg border border-border">
        {/* Cabeçalho fixo - sem scroll */}
        <div className="border-b border-border">
          <Table className="table-fixed w-full min-w-[1100px]">
            <TableHeader className="bg-secondary/70 backdrop-blur">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("dataLigacao")}
                    className="h-auto p-0 hover:bg-transparent whitespace-nowrap"
                  >
                    Data <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("idOperador")}
                    className="h-auto p-0 hover:bg-transparent whitespace-nowrap"
                  >
                    Operador <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[160px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("cliente")}
                    className="h-auto p-0 hover:bg-transparent whitespace-nowrap"
                  >
                    Cliente <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("cpfCnpj")}
                    className="h-auto p-0 hover:bg-transparent whitespace-nowrap"
                  >
                    CPF/CNPJ <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[160px] whitespace-nowrap">ID Ligação</TableHead>
                <TableHead className="w-[180px] whitespace-nowrap">Tabulação</TableHead>
                <TableHead className="w-[110px] whitespace-nowrap">Acordo</TableHead>
                <TableHead className="w-[110px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("duracaoSegundos")}
                    className="h-auto p-0 hover:bg-transparent whitespace-nowrap"
                  >
                    Duração <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[110px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("palavras")}
                    className="h-auto p-0 hover:bg-transparent whitespace-nowrap"
                  >
                    Palavras <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Corpo rolável em ambas as direções, com altura fixa */}
        <div className="h-[320px] overflow-auto">
          <Table className="table-fixed w-full min-w-[1100px]">
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-secondary/30">
                    <TableCell className="w-[120px] font-mono text-sm whitespace-nowrap">
                      {row.dataLigacao?.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="w-[120px] font-mono text-sm whitespace-nowrap">{row.idOperador}</TableCell>
                    <TableCell className="w-[160px] text-sm truncate">{row.cliente || "-"}</TableCell>
                    <TableCell className="w-[140px] font-mono text-sm whitespace-nowrap">
                      {row.cpfCnpj || "-"}
                    </TableCell>
                    <TableCell className="w-[160px] font-mono text-sm text-primary whitespace-nowrap">
                      {row.idLigacao}
                    </TableCell>
                    <TableCell className="w-[180px] whitespace-nowrap text-sm truncate">{row.tabulacao}</TableCell>
                    <TableCell className="w-[110px] whitespace-nowrap">
                      <Badge
                        variant={row.acordo ? "default" : "secondary"}
                        className={row.acordo ? "bg-primary/20 text-primary border-primary/30" : ""}
                      >
                        {row.acordo ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[110px] font-mono text-sm whitespace-nowrap">
                      {formatDuracao(row.duracaoSegundos)}
                    </TableCell>
                    <TableCell className="w-[110px] font-mono text-sm whitespace-nowrap">
                      {row.palavras.toLocaleString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTable;
