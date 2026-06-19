import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatus, STATUSES } from '@/lib/status';
import {
  FetchRegistration,
  ClearApplicationStatus,
  AbsentApplication,
  EnrollApplication,
} from '@/lib/backend';

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number;
  initialStatus: string;
  hasSelector: boolean;
  onStatusChanged: () => void;
}

function Field({ label, value, mono }: { label: string; value?: any; mono?: boolean }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex gap-2 py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <span className={cn('text-xs text-foreground', mono && 'font-mono')}>{value}</span>
    </div>
  );
}

const MUTABLE_STATUSES = STATUSES.filter(
  (s) => s.value === 'APPROVED' || s.value === 'ABSENT' || s.value === 'ENROLLED'
);

export function RegistrationDialog({
  open,
  onOpenChange,
  id,
  initialStatus,
  hasSelector,
  onStatusChanged,
}: RegistrationDialogProps) {
  const [detail, setDetail] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(initialStatus);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open || !id) return;
    setPendingStatus(initialStatus);
    setLoading(true);
    FetchRegistration(id)
      .then((res) => {
        if (!res?.data) return;
        const d = res.data;
        const reg = d.Registration;
        const c = reg?.Candidate ?? {};
        const course = d.Course ?? {};
        const call = d.Call;

        setDetail({
          Nome: c.Name,
          'Nome Social': c.SocialName,
          CPF: c.CPF,
          'Data de Nascimento': c.BirthDate,
          Sexo: c.Sex,
          'Nome da Mãe': c.MotherName,
          Endereço: [c.AddressLine, c.AddressLine2, c.HouseNumber].filter(Boolean).join(', '),
          Bairro: c.Neighborhood,
          'Município / UF': c.Municipality && c.State ? `${c.Municipality} — ${c.State}` : c.Municipality,
          CEP: c.CEP,
          Email: c.Email,
          'Telefone 1': c.Phone1,
          'Telefone 2': c.Phone2,
          _sep_ENEM: true,
          'Inscrição ENEM': reg?.EnrollmentID,
          Opção: reg?.Option,
          Classificação: reg?.Ranking,
          'Nota Linguagens': reg?.LanguagesScore?.Value,
          'Nota Humanas': reg?.HumanitiesScore?.Value,
          'Nota Natureza': reg?.NaturalSciencesScore?.Value,
          'Nota Matemática': reg?.MathematicsScore?.Value,
          'Nota Redação': reg?.EssayScore?.Value,
          'Nota Final': reg?.CompositeScore?.Value,
          _sep_COURSE: true,
          Turno: course.Period === 'morning' ? 'Matutino' : course.Period === 'evening' ? 'Noturno' : course.Period,
          Cota: course.Quota,
          Vagas: course.Seats,
          ...(call ? { Chamada: call.Number } : {}),
        });
      })
      .finally(() => setLoading(false));
  }, [open, id, initialStatus]);

  async function applyStatus() {
    setApplying(true);
    try {
      if (pendingStatus === 'APPROVED') await ClearApplicationStatus(id);
      else if (pendingStatus === 'ABSENT') await AbsentApplication(id);
      else if (pendingStatus === 'ENROLLED') await EnrollApplication(id);
      onStatusChanged();
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  }

  const statusDef = getStatus(pendingStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="font-heading text-lg font-bold truncate">
            {loading ? '...' : (detail['Nome'] ?? 'Candidato')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-24 gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : (
            <>
              {/* Personal data */}
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                Dados Pessoais
              </p>
              {Object.entries(detail)
                .filter(([k]) => !k.startsWith('_sep_'))
                .slice(0, Object.keys(detail).findIndex(([k]) => k === '_sep_ENEM') || 999)
                .map(([k, v]) => <Field key={k} label={k} value={v} mono={k === 'CPF' || k === 'CEP'} />)}

              <Separator className="my-3" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                ENEM / Notas
              </p>
              {['Inscrição ENEM', 'Opção', 'Classificação', 'Nota Linguagens', 'Nota Humanas', 'Nota Natureza', 'Nota Matemática', 'Nota Redação', 'Nota Final'].map((k) =>
                detail[k] != null ? <Field key={k} label={k} value={detail[k]} mono /> : null
              )}

              <Separator className="my-3" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                Curso
              </p>
              {['Turno', 'Cota', 'Vagas', 'Chamada'].map((k) =>
                detail[k] != null ? <Field key={k} label={k} value={detail[k]} /> : null
              )}
            </>
          )}
        </div>

        {hasSelector && !loading && (
          <div className="px-6 py-4 border-t border-border flex items-center gap-3 shrink-0">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: `var(--status-${pendingStatus.toLowerCase()}, #888)` }}
            />
            <Select value={pendingStatus} onValueChange={setPendingStatus}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MUTABLE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-8"
              disabled={pendingStatus === initialStatus || applying}
              onClick={applyStatus}
            >
              {applying ? <Loader2 className="size-3 animate-spin" /> : 'Confirmar'}
            </Button>
          </div>
        )}

        {!hasSelector && (
          <div className="px-6 py-4 border-t border-border flex items-center gap-2 shrink-0">
            <div
              className={cn('w-2.5 h-2.5 rounded-full', statusDef.color)}
            />
            <span className="text-xs text-muted-foreground">{statusDef.label}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-8"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
