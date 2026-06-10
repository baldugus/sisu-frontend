// frontend/src/pages/components/ApprovedImportModal.tsx
import { useState } from "react";
import { wailsCall } from "../../lib/wailsCall";
import { LoadApprovedSelection, OpenFileDialog } from "../../../wailsjs/go/main/App";

type Props = {
  onClose: () => void;
  onSuccess: (msg?: string) => void;
  onError: (msg?: string) => void;
};

const ApprovedImportModal = ({ onClose, onSuccess, onError }: Props) => {
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState("");

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
    if (!year) {
      onError("Preencha o Ano.");
      return;
    }
    if (!filePath) {
      onError("Selecione um arquivo CSV.");
      return;
    }

    try {
      setLoading(true);
      const res = await wailsCall(LoadApprovedSelection, parseInt(year), filePath);
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
        <h3 className="text-xl font-bold mb-4">Importar Aprovados</h3>

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

        <div className="flex flex-col gap-1 mt-4">
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
