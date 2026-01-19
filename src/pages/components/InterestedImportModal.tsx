// frontend/src/pages/components/InterestedImportModal.tsx
import { useState, useEffect } from "react";
import { wailsCall } from "../../lib/wailsCall";
import { LoadInterestedSelection, OpenFileDialog, FetchApprovedSelection } from "../../../wailsjs/go/main/App";

type Props = {
  onClose: () => void;
  onSuccess: (msg?: string) => void;
  onError: (msg?: string) => void;
};

const InterestedImportModal = ({ onClose, onSuccess, onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the approved selection to get year and semester
    FetchApprovedSelection().then((res) => {
      if (res.data) {
        setYear(res.data.Year);
        setSemester(res.data.Semester);
      }
    }).catch(() => {
      onError("Não foi possível buscar a seleção de aprovados. Importe primeiro a lista de aprovados.");
      onClose();
    });
  }, []);

  const handleSelectFile = async () => {
    try {
      const path = await OpenFileDialog(
        "Selecionar arquivo CSV",
        "*.csv",
        "CSV (*.csv)"
      );
      if (path) {
        setFilePath(path);
      }
    } catch (err: any) {
      onError(err?.message || "Erro ao selecionar arquivo.");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !semester) {
      onError("Não foi possível obter ano e período da seleção de aprovados.");
      return;
    }
    if (!filePath) {
      onError("Selecione um arquivo CSV.");
      return;
    }

    try {
      setLoading(true);
      const res = await wailsCall(LoadInterestedSelection, year, semester, filePath);
      onSuccess(res.msg);
    } catch (err: any) {
      onError(err?.message || "Erro ao importar.");
    } finally {
      setLoading(false);
    }
  };

  // Extract just the filename from the full path for display
  const displayFileName = filePath ? filePath.split(/[/\\]/).pop() : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal card */}
      <form
        onSubmit={onSubmit}
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg"
      >
        <h3 className="text-xl font-bold mb-4">Importar Em Espera</h3>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Usando ano <strong>{year}</strong> e período <strong>{semester}</strong> da seleção de aprovados.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Arquivo CSV</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectFile}
              className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
            >
              Selecionar arquivo
            </button>
            <span className="flex items-center text-sm text-gray-600 truncate">
              {displayFileName || "Nenhum arquivo selecionado"}
            </span>
          </div>
        </div>

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
            disabled={loading || !year || !semester}
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold disabled:bg-gray-400"
          >
            {loading ? "Importando..." : "Importar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterestedImportModal;
