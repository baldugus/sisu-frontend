import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FetchApprovedSelection,
  FetchRegistration,
  FetchRegistrationsBySelectionID,
} from "../../wailsjs/go/main/App";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Copy,
  GraduationCap,
  MoreHorizontal,
  PhoneOutgoing,
  UserCheck,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants (reused verbatim from CallDataTable)
// ---------------------------------------------------------------------------

const COTA_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "AC", value: "Ampla concorrência" },
  {
    label: "C1",
    value:
      "Candidatos Negros ou Indígenas com comprovação de carência socioeconômica",
  },
  {
    label: "C2",
    value:
      "Candidatos com deficiência ou filhos de policiais militares, bombeiros militares, inspetores de segurança e administração penitenciária, mortos ou incapacitados em razão do serviço, com comprovação de carência socioeconômica",
  },
  {
    label: "C3",
    value:
      "Candidatos que tenham cursado na rede pública os últimos quatro anos do ensino fundamental e todo o ensino médio e com comprovação de carência socioeconômica",
  },
];

const COTA_LABEL: Record<string, string> = Object.fromEntries(
  COTA_OPTIONS.slice(1).map((o) => [o.value, o.label])
);

const STATUS_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Convocado(a)", value: "APPROVED" },
  { label: "Matriculado(a)", value: "ENROLLED" },
  { label: "Faltoso(a)", value: "ABSENT" },
  { label: "Em espera", value: "WAITLISTED" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Convocado(a)",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  ENROLLED: {
    label: "Matriculado(a)",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  ABSENT: {
    label: "Faltoso(a)",
    className: "bg-red-100 text-red-800 border-red-300",
  },
  WAITLISTED: {
    label: "Em espera",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  DECLINED_PROMOTION: {
    label: "Declinou promoção",
    className: "bg-orange-100 text-orange-800 border-orange-300",
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ApprovedRow = {
  ID: number;
  Name: string;
  CPF: string;
  Period: string;
  Quota: string;
  Status: string;
  Ranking: number;
  Email: string;
  SemesterID: number | null;
  EnrollmentID: string;
};

type SelectionInfo = {
  Institution: string;
  Degree: string;
  Year: number;
};

// ---------------------------------------------------------------------------
// Helper: flatten detail for the dialog (mirrors DialogDataShow)
// ---------------------------------------------------------------------------

function flattenDetail(detail: any): Record<string, string> {
  if (!detail) return {};
  const flat: Record<string, string> = {};

  if (detail.Registration) {
    const reg = detail.Registration;
    flat["Inscrição ENEM"] = reg.EnrollmentID ?? "";
    flat["Opção"] = reg.Option ?? "";
    flat["Nota Linguagens"] = reg.LanguagesScore?.Value ?? "";
    flat["Nota Humanas"] = reg.HumanitiesScore?.Value ?? "";
    flat["Nota Natureza"] = reg.NaturalSciencesScore?.Value ?? "";
    flat["Nota Matemática"] = reg.MathematicsScore?.Value ?? "";
    flat["Nota Redação"] = reg.EssayScore?.Value ?? "";
    flat["Nota Final"] = reg.CompositeScore?.Value ?? "";
    flat["Classificação"] = reg.Ranking ?? "";

    if (reg.Candidate) {
      const c = reg.Candidate;
      flat["Nome"] = c.Name ?? "";
      flat["Nome Social"] = c.SocialName ?? "";
      flat["CPF"] = c.CPF ?? "";
      flat["Data de Nascimento"] = c.BirthDate ?? "";
      flat["Sexo"] = c.Sex ?? "";
      flat["Nome da Mãe"] = c.MotherName ?? "";
      flat["Endereço"] = c.AddressLine ?? "";
      flat["Complemento"] = c.AddressLine2 ?? "";
      flat["Número"] = c.HouseNumber ?? "";
      flat["Bairro"] = c.Neighborhood ?? "";
      flat["Município"] = c.Municipality ?? "";
      flat["Estado"] = c.State ?? "";
      flat["CEP"] = c.CEP ?? "";
      flat["Email"] = c.Email ?? "";
      flat["Telefone 1"] = c.Phone1 ?? "";
      flat["Telefone 2"] = c.Phone2 ?? "";
    }
  }

  if (detail.Course) {
    flat["Turno"] =
      detail.Course.Period === "morning" ? "Matutino" : "Noturno";
    flat["Cota"] = detail.Course.Quota ?? "";
    flat["Vagas"] = detail.Course.Seats ?? "";
  }

  if (detail.Call) {
    flat["Chamada"] = detail.Call.Number ?? "";
  }

  return flat;
}

// ---------------------------------------------------------------------------
// Sub-component: ApprovedDetailDialog
// ---------------------------------------------------------------------------

type ApprovedDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  registrationID: number | null;
};

const ApprovedDetailDialog = ({
  open,
  onClose,
  registrationID,
}: ApprovedDetailDialogProps) => {
  const [detail, setDetail] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && registrationID != null) {
      setLoading(true);
      FetchRegistration(registrationID)
        .then((res) => {
          if (res.data) setDetail(flattenDetail(res.data));
        })
        .finally(() => setLoading(false));
    } else {
      setDetail({});
    }
  }, [open, registrationID]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detail["Nome"] || "Detalhes do candidato"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Carregando...</p>
        ) : (
          <div className="space-y-1">
            {Object.entries(detail)
              .filter(([, v]) => v !== "" && v != null)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex gap-2 border-b py-1 text-sm"
                >
                  <span className="text-muted-foreground min-w-[140px]">
                    {key}:
                  </span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const ApprovedPage = () => {
  const [rows, setRows] = useState<ApprovedRow[]>([]);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [semester, setSemester] = useState("all");
  const [turno, setTurno] = useState("all");
  const [cota, setCota] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Detail dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogID, setDialogID] = useState<number | null>(null);

  // -------------------------------------------------------------------------
  // Fetch data
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const selRes = await FetchApprovedSelection();
      if (!selRes.data || cancelled) {
        setLoading(false);
        return;
      }

      const sel = selRes.data;
      setSelection({
        Institution: sel.Institution,
        Degree: sel.Degree,
        Year: sel.Year,
      });

      const regsRes = await FetchRegistrationsBySelectionID(sel.ID);
      const regs: any[] = regsRes.data || [];

      const details = await Promise.all(
        regs.map((r: any) => FetchRegistration(r.ID))
      );

      if (cancelled) return;

      const mapped: ApprovedRow[] = details.map((res: any) => {
        const d = res.data;
        const reg = d?.Registration;
        const course = d?.Course;
        const candidate = reg?.Candidate;

        let period = "";
        if (course?.Period === "morning") period = "Matutino";
        else if (course?.Period === "evening") period = "Noturno";

        const rawStatus: string = reg?.Status ?? "approved";
        const normalised = rawStatus.toUpperCase().replace(/-/g, "_");

        return {
          ID: reg?.ID,
          Name: candidate?.Name ?? "",
          CPF: candidate?.CPF ?? "",
          Period: period,
          Quota: course?.Quota ?? "",
          Status: normalised,
          Ranking: reg?.Ranking ?? 0,
          Email: candidate?.Email ?? "",
          SemesterID: reg?.SemesterID ?? null,
          EnrollmentID: reg?.EnrollmentID ?? "",
        };
      });

      setRows(mapped);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const totalCount = rows.length;
  const enrolledCount = rows.filter((r) => r.Status === "ENROLLED").length;
  const approvedCount = rows.filter((r) => r.Status === "APPROVED").length;
  const absentCount = rows.filter((r) => r.Status === "ABSENT").length;
  const enrolledPct = totalCount > 0 ? (enrolledCount / totalCount) * 100 : 0;

  const filtered = rows.filter((row) => {
    if (semester !== "all") {
      const semNum = semester === "1" ? 1 : 2;
      if (row.SemesterID !== semNum) return false;
    }
    if (turno !== "all" && row.Period !== turno) return false;
    if (cota !== "all" && row.Quota !== cota) return false;
    if (status !== "all" && row.Status !== status) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (
        !row.Name.toLowerCase().includes(q) &&
        !row.CPF.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      toast.success("Email copiado");
    });
  };

  const handleOpenDetail = (id: number) => {
    setDialogID(id);
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderStatusBadge = (s: string) => {
    const cfg = STATUS_CONFIG[s];
    return (
      <Badge
        variant="outline"
        className={cn("text-xs", cfg?.className ?? "bg-gray-100 text-gray-700")}
      >
        {cfg?.label ?? s}
      </Badge>
    );
  };

  const renderCotaLabel = (quota: string) =>
    COTA_LABEL[quota] ?? quota;

  // -------------------------------------------------------------------------
  // Loading / empty states
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Aprovados
        </h2>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!selection) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Aprovados
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Nenhum arquivo de aprovados importado. Vá até a página{" "}
              <span className="font-medium text-foreground">Dados</span> para
              importar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Aprovados
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selection.Institution} · {selection.Degree} · {selection.Year} ·{" "}
            {totalCount} aprovados
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total aprovados
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">candidatos aprovados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matriculados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCount}</div>
            <Progress value={enrolledPct} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {enrolledPct.toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Convocados aguardando
            </CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              aprovados, ainda não matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faltosos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentCount}</div>
            <p className="text-xs text-muted-foreground">
              não compareceram
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roster card */}
      <Card>
        <CardContent className="pt-4">
          {/* Semester tabs */}
          <Tabs
            value={semester}
            onValueChange={setSemester}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="1">Semestre 1</TabsTrigger>
              <TabsTrigger value="2">Semestre 2</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
            >
              <option value="all">Turno: Todos</option>
              <option value="Matutino">Matutino</option>
              <option value="Noturno">Noturno</option>
            </select>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={cota}
              onChange={(e) => setCota(e.target.value)}
            >
              {COTA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.value === "all" ? "Cota: Todos" : o.label}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.value === "all" ? "Status: Todos" : o.label}
                </option>
              ))}
            </select>

            <Input
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56"
            />

            <span className="ml-auto self-center text-sm text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Cota</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.ID}>
                      <TableCell className="text-muted-foreground">
                        {row.Ranking}
                      </TableCell>
                      <TableCell className="font-medium">{row.Name}</TableCell>
                      <TableCell>{row.Period}</TableCell>
                      <TableCell>{renderCotaLabel(row.Quota)}</TableCell>
                      <TableCell>{renderStatusBadge(row.Status)}</TableCell>
                      <TableCell>
                        {row.Email ? (
                          <button
                            onClick={() => handleCopyEmail(row.Email)}
                            className="flex items-center gap-1 text-sm text-primary hover:underline focus:outline-none"
                            title="Clique para copiar"
                          >
                            <span className="max-w-[180px] truncate">
                              {row.Email}
                            </span>
                            <Copy className="h-3 w-3 shrink-0 text-muted-foreground" />
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleOpenDetail(row.ID)}
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent focus:outline-none"
                          title="Ver detalhes"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <ApprovedDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        registrationID={dialogID}
      />
    </div>
  );
};

export default ApprovedPage;
