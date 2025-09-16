import toast from "react-hot-toast";
import { BtnTrash, CardWrapper, DataImportBox, InfoCard } from "../components";
import {
  Backup,
  Destroy,
  ExportCSV,
  LoadApprovedSelection,
  LoadInterestedSelection,
  Restore,
} from "../../wailsjs/go/main/App";
import { CiImport, CiExport } from "react-icons/ci";
import { BsFillTrashFill } from "react-icons/bs";
import { useState } from "react";
import { wailsCall } from "../lib/wailsCall";

const HomePage = () => {
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [loadingInterested, setLoadingInterested] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleImportApproved = async () => {
    setLoadingApproved(true);
    setFeedback(null);
    try {
      const res = await wailsCall(LoadApprovedSelection);
      toast.success(res.msg || "Aprovados importados com sucesso!");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao importar aprovados.");
    } finally {
      setLoadingApproved(false);
    }
  };

  const handleImportInterested = async () => {
    setLoadingInterested(true);
    setFeedback(null);
    try {
      const res = await wailsCall(LoadInterestedSelection);
      toast.success(res.msg || "Inscritos importados com sucesso.");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao importar inscritos.");
    } finally {
      setLoadingInterested(false);
    }
  };

  return (
    <section className="px-4 w-full  h-[calc(100vh-82px)] overflow-auto lg:rounded-tl-3xl">
      <h1 className="text-3xl font-bold border-b-2 border-black py-4">
        Início
      </h1>
      <InfoCard
        text="Como passo inicial, adicione os CSVs, aos respectivos campos abaixo."
        type="info"
      />
      <div className=" flex gap-4">
        <DataImportBox
          actionfunction={handleImportApproved}
          dataType="aprovados"
          text={loadingApproved ? "Importando aprovados..." : "Aprovados"}
          mockHasData={loadingApproved}
        />
        <DataImportBox
          actionfunction={handleImportInterested}
          dataType="inscritos"
          text={loadingInterested ? "Importando Em Espera..." : "Em Espera"}
          mockHasData={loadingInterested}
        />
      </div>
      <InfoCard
        text={
          <>
            Atenção! O botão <BtnTrash /> apagará os dados armazenados em sua
            máquina, utilize-o caso não necessite mais dos dados armazenados.
          </>
        }
        type="warning"
      />
      <div className=" flex gap-4"></div>
      <InfoCard text={<>Banco de dados & CSV</>} type="info" />
      <div className=" flex gap-4">
        <CardWrapper>
          <div className="flex gap-2">
            <span className="bg-gray-300 p-1 rounded-full text-white ">
              <CiImport className="text-2xl" />
            </span>
            <h4 className="text-lg font-bold">Importar banco de dados:</h4>
          </div>
          <div className="flex mt-4  gap-2 ">
            <button
              onClick={Restore}
              className="shadow-md  py-1 gap-5 disabled:bg-gray-400 bg-white cursor-pointer text-black font-bold  px-4 rounded-full inline-flex items-center disabled:shadow-none disabled:text-gray-200"
            >
              <CiImport className="text-md" /> Importar
            </button>
          </div>
        </CardWrapper>
        <CardWrapper>
          <div className="flex gap-2">
            <span className="bg-gray-300 p-1 rounded-full text-white ">
              <CiExport className="text-2xl" />
            </span>
            <h4 className="text-lg font-bold">Exportar banco de dados:</h4>
          </div>
          <div className="flex mt-4  gap-2 ">
            <button
              onClick={Backup}
              className="shadow-md  py-1 gap-5 disabled:bg-gray-400 bg-white cursor-pointer text-black font-bold  px-4 rounded-full inline-flex items-center disabled:shadow-none disabled:text-gray-200"
            >
              <CiExport className="text-md" /> Exportar
            </button>
          </div>
        </CardWrapper>
        <CardWrapper>
          <div className="flex gap-2">
            <span className="bg-gray-300 p-1 rounded-full text-white ">
              <CiExport className="text-2xl" />
            </span>
            <h4 className="text-lg font-bold">Exportar CSV de matriculados:</h4>
          </div>
          <div className="flex mt-4  gap-2 ">
            <button
              onClick={ExportCSV}
              className="shadow-md  py-1 gap-5 disabled:bg-gray-400 bg-white cursor-pointer text-black font-bold  px-4 rounded-full inline-flex items-center disabled:shadow-none disabled:text-gray-200"
            >
              <CiExport className="text-md" /> Exportar
            </button>
          </div>
        </CardWrapper>
      </div>

      <InfoCard
        text={
          <>
            Atenção! O botão Abaixo apagará os dados armazenados em sua máquina,
            utilize-o caso não necessite mais dos dados armazenados.
          </>
        }
        type="warning"
      />
      <div className=" flex gap-4">
        <CardWrapper>
          <div className="flex gap-2">
            <span className="bg-gray-300 p-1 rounded-full text-white ">
              <BsFillTrashFill className="text-2xl" />
            </span>
            <h4 className="text-lg font-bold">DESTRUIR TODOS OS DADOS:</h4>
          </div>
          <div className="flex mt-4  gap-2 ">
            <button
              onClick={Destroy}
              className="shadow-md  py-1 gap-5 disabled:bg-gray-400 bg-white cursor-pointer text-black font-bold  px-4 rounded-full inline-flex items-center disabled:shadow-none disabled:text-gray-200"
            >
              <BsFillTrashFill className="text-md" /> Destruir
            </button>
          </div>
        </CardWrapper>
      </div>

      {/* <InfoCard text="Não há dados disponíveis, retorne à página inicial e importe o .csv de aprovados." type="sad"/> */}
    </section>
  );
};

export default HomePage;
