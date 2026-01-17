// frontend/src/pages/components/ApprovedImportModal.tsx
import { useRef, useState } from "react";
import { wailsCall } from "../../lib/wailsCall";
import { LoadApprovedSelection } from "../../../wailsjs/go/main/App";

type Props = {
  onClose: () => void;
  onSuccess: (msg?: string) => void;
  onError: (msg?: string) => void;
};

const ApprovedImportModal = ({ onClose, onSuccess, onError }: Props) => {
  const [year, setYear] = useState("");
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !period) {
      onError("Preencha Ano e Período.");
      return;
    }
    const file = fileRef.current?.files?.[0];
    if (!file) {
      onError("Selecione um arquivo CSV.");
      return;
    }

    try {
      setLoading(true);
      const buffer = await file.arrayBuffer();
      // chama o Go: (year, period, filename, bytes)
      const res = await wailsCall(LoadApprovedSelection, year, period, file.name, new Uint8Array(buffer));
      onSuccess(res.msg);
    } catch (err: any) {
      onError(err?.message || "Erro ao importar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal card */}
      <form
        onSubmit={onSubmit}
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg"
      >
        <h3 className="text-xl font-bold mb-4">Importar Aprovados</h3>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Ano</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="2024"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Período</span>
            <input
              type="text"
              placeholder="1"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 mt-4">
          <span className="text-sm font-medium">Arquivo CSV</span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="border rounded-lg px-3 py-2"
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold"
          >
            {loading ? "Importando..." : "Importar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApprovedImportModal;
