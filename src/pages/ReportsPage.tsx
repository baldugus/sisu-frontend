import { useEffect, useState } from "react";
import {
  EmailPDF,
  EnrollmentPDF,
  FetchApprovedSelection,
  FetchRollCalls,
  SaveFileDialog,
  TeacherPDF,
  WebsitePDF,
} from "../../wailsjs/go/main/App";
import Divider from "../components/CallDataTable/Divider";

interface IPeriod {
  value: string;
  label: string;
}

const PERIODS: IPeriod[] = [
  { value: "morning", label: "Matutino" },
  { value: "evening", label: "Noturno" },
];

interface ICalls {
  ID: number;
  Status: string;
  Number: number;
}

const ReportsPage = () => {
  const [rowsCalls, setRowsCalls] = useState<Array<ICalls>>();
  const [year, setYear] = useState<number>(0);
  const [semester, setSemester] = useState<number>(0);

  useEffect(() => {
    FetchRollCalls().then((res) => setRowsCalls(res.data));
    FetchApprovedSelection().then((res) => {
      if (res.data) {
        setYear(res.data.Year);
        setSemester(res.data.Semester);
      }
    });
  }, []);

  const handleExportWebsite = async (callId: number, period: string, callNumber: number, periodLabel: string) => {
    const filename = `website-${periodLabel.toLowerCase()}-chamada-${callNumber}-${year}-${semester}.pdf`;
    const filePath = await SaveFileDialog("Salvar PDF Website", filename, "*.pdf", "PDF Files");
    if (filePath) {
      WebsitePDF(callId, period, filePath);
    }
  };
  const handleEnrollmentPDF = async (callId: number, period: string, callNumber: number, periodLabel: string) => {
    const filename = `convocados-${periodLabel.toLowerCase()}-chamada-${callNumber}-${year}-${semester}.pdf`;
    const filePath = await SaveFileDialog("Salvar PDF Convocados", filename, "*.pdf", "PDF Files");
    if (filePath) {
      EnrollmentPDF(callId, period, filePath);
    }
  };
  const handleTeacherPDF = async (period: string, periodLabel: string) => {
    const filename = `professor-${periodLabel.toLowerCase()}-${year}-${semester}.pdf`;
    const filePath = await SaveFileDialog("Salvar PDF Professor", filename, "*.pdf", "PDF Files");
    if (filePath) {
      TeacherPDF(period, filePath);
    }
  };
  const handleEmailPDF = async (callId: number, period: string, callNumber: number, periodLabel: string) => {
    const filename = `emails-${periodLabel.toLowerCase()}-chamada-${callNumber}-${year}-${semester}.pdf`;
    const filePath = await SaveFileDialog("Salvar PDF Emails", filename, "*.pdf", "PDF Files");
    if (filePath) {
      EmailPDF(callId, period, filePath);
    }
  };

  return (
    <section className="px-4 w-full  h-[calc(100vh-82px)] overflow-auto lg:rounded-tl-3xl">
      <h1 className="text-3xl font-bold border-b-2 border-black py-4">
        Relatórios
      </h1>
      <Divider>Exportar para o Website</Divider>
      {rowsCalls &&
        rowsCalls.map((callElement) =>
          PERIODS.map((periodElement) => (
            <div
              key={`website-${callElement.ID}-${periodElement.value}`}
              className="px-4 border justify-between hover:bg-blue-gray-50 border-blue-600 cursor-pointer shadow-lg flex gap-2 text-1xl  py-4 items-center bg-gray-100 rounded-xl my-4"
              onClick={() =>
                handleExportWebsite(callElement.ID, periodElement.value, callElement.Number, periodElement.label)
              }
            >
              <div className="flex gap-4 items-center">
                Exportar Arquivo Website {periodElement.label}{" "}
                {callElement.Number}ª Chamada
              </div>
              <div className="flex gap-4 items-center"></div>
            </div>
          ))
        )}
      <Divider>Exportar Convocados</Divider>
      {rowsCalls &&
        rowsCalls.map((callElement) =>
          PERIODS.map((periodElement) => (
            <div
              key={`enrollment-${callElement.ID}-${periodElement.value}`}
              className="px-4 border justify-between hover:bg-blue-gray-50 border-blue-600 cursor-pointer shadow-lg flex gap-2 text-1xl  py-4 items-center bg-gray-100 rounded-xl my-4"
              onClick={() =>
                handleEnrollmentPDF(callElement.ID, periodElement.value, callElement.Number, periodElement.label)
              }
            >
              <div className="flex gap-4 items-center">
                Exportar Arquivo Convocados {periodElement.label}{" "}
                {callElement.Number}ª Chamada
              </div>
              <div className="flex gap-4 items-center"></div>
            </div>
          ))
        )}
      <Divider>Exportar Emails</Divider>
      {rowsCalls &&
        rowsCalls.map((callElement) =>
          PERIODS.map((periodElement) => (
            <div
              key={`email-${callElement.ID}-${periodElement.value}`}
              className="px-4 border justify-between hover:bg-blue-gray-50 border-blue-600 cursor-pointer shadow-lg flex gap-2 text-1xl  py-4 items-center bg-gray-100 rounded-xl my-4"
              onClick={() =>
                handleEmailPDF(callElement.ID, periodElement.value, callElement.Number, periodElement.label)
              }
            >
              <div className="flex gap-4 items-center">
                Exportar Arquivo Emails {periodElement.label}{" "}
                {callElement.Number}ª Chamada
              </div>
              <div className="flex gap-4 items-center"></div>
            </div>
          ))
        )}
      <Divider>Exportar Pdf do Professor</Divider>
      {PERIODS.map((periodElement) => (
        <div
          key={`teacher-${periodElement.value}`}
          className="px-4 border justify-between hover:bg-blue-gray-50 border-blue-600 cursor-pointer shadow-lg flex gap-2 text-1xl  py-4 items-center bg-gray-100 rounded-xl my-4"
          onClick={() => handleTeacherPDF(periodElement.value, periodElement.label)}
        >
          <div className="flex gap-4 items-center">
            Exportar Arquivo Convocados {periodElement.label} Turno
          </div>
          <div className="flex gap-4 items-center"></div>
        </div>
      ))}
    </section>
  );
};

export default ReportsPage;
