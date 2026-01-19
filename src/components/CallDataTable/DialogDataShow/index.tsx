import {
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import {
  AbsentApplication,
  ClearApplicationStatus,
  EnrollApplication,
  FetchRegistration,
} from "../../../../wailsjs/go/main/App";

const flattenRegistrationDetail = (detail: any) => {
  if (!detail) return {};

  const flat: Record<string, any> = {};

  if (detail.Registration) {
    flat["ID"] = detail.Registration.ID;
    flat["Inscrição ENEM"] = detail.Registration.EnrollmentID;
    flat["Opção"] = detail.Registration.Option;
    flat["Nota Linguagens"] = detail.Registration.LanguagesScore?.Value;
    flat["Nota Humanas"] = detail.Registration.HumanitiesScore?.Value;
    flat["Nota Natureza"] = detail.Registration.NaturalSciencesScore?.Value;
    flat["Nota Matemática"] = detail.Registration.MathematicsScore?.Value;
    flat["Nota Redação"] = detail.Registration.EssayScore?.Value;
    flat["Nota Final"] = detail.Registration.CompositeScore?.Value;
    flat["Classificação"] = detail.Registration.Ranking;
    flat["Status"] = detail.Registration.Status?.toUpperCase();

    if (detail.Registration.Candidate) {
      const c = detail.Registration.Candidate;
      flat["Nome"] = c.Name;
      flat["Nome Social"] = c.SocialName;
      flat["CPF"] = c.CPF;
      flat["Data de Nascimento"] = c.BirthDate;
      flat["Sexo"] = c.Sex;
      flat["Nome da Mãe"] = c.MotherName;
      flat["Endereço"] = c.AddressLine;
      flat["Complemento"] = c.AddressLine2;
      flat["Número"] = c.HouseNumber;
      flat["Bairro"] = c.Neighborhood;
      flat["Município"] = c.Municipality;
      flat["Estado"] = c.State;
      flat["CEP"] = c.CEP;
      flat["Email"] = c.Email;
      flat["Telefone 1"] = c.Phone1;
      flat["Telefone 2"] = c.Phone2;
    }
  }

  if (detail.Course) {
    flat["Turno"] = detail.Course.Period === "morning" ? "Matutino" : "Noturno";
    flat["Cota"] = detail.Course.Quota;
    flat["Vagas"] = detail.Course.Seats;
  }

  if (detail.Call) {
    flat["Chamada"] = detail.Call.Number;
  }

  return flat;
};

const DialogDataShow = ({
  open,
  handleOpen,
  filteredData,
  currentDataIdShow,
  setRowsTable,
  setDataCurrentStatus,
  dataCurrentStatus,
  handleGetData,
  hasSelector,
}: any) => {
  const [detailData, setDetailData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && filteredData[currentDataIdShow]?.ID) {
      setLoading(true);
      FetchRegistration(filteredData[currentDataIdShow].ID)
        .then((res) => {
          if (res.data) {
            setDetailData(flattenRegistrationDetail(res.data));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, currentDataIdShow, filteredData]);

  const handleAlterStatus = () => {
    switch (dataCurrentStatus) {
      case "APPROVED":
        ClearApplicationStatus(filteredData[currentDataIdShow].ID).then(() =>
          handleGetData().then((res: any) => setRowsTable(res))
        );
        break;
      case "ABSENT":
        AbsentApplication(filteredData[currentDataIdShow].ID).then(() =>
          handleGetData().then((res: any) => setRowsTable(res))
        );
        break;
      case "ENROLLED":
        EnrollApplication(filteredData[currentDataIdShow].ID).then(() =>
          handleGetData().then((res: any) => setRowsTable(res))
        );
        break;
      default:
        alert("Nenhum status selecionado");
    }
  };

  return (
    <Dialog open={open} handler={handleOpen}>
      <DialogHeader>{detailData["Nome"] || filteredData[currentDataIdShow]?.Name}</DialogHeader>
      <DialogBody className="h-[22rem] overflow-scroll">
        {loading ? (
          <Typography>Carregando...</Typography>
        ) : (
          Object.entries(detailData).map(([key, value]) => (
            <div key={key} className="flex gap-2 border-b-2">
              <Typography variant="small" className="font-normal">
                {key}:
              </Typography>
              <Typography variant="small">{value}</Typography>
            </div>
          ))
        )}
      </DialogBody>
      <DialogFooter className="space-x-2 flex flex-col justify-around">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {hasSelector && "Alterar Status:"}
          {detailData["Status"] || filteredData[currentDataIdShow]?.Status}
        </label>
        {hasSelector && filteredData[currentDataIdShow] && (
          <select
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e: any) => setDataCurrentStatus(e.target.value)}
            defaultValue={filteredData[currentDataIdShow].Status}
          >
            <option value="APPROVED">Convocado</option>
            <option value="ENROLLED">Matriculado</option>
            <option value="ABSENT">Faltoso</option>
          </select>
        )}
        <div className="mt-4 gap-4 flex">
          <Button variant="text" color="blue-gray" onClick={handleOpen}>
            {hasSelector ? "Cancelar" : "Voltar"}
          </Button>
          {hasSelector && (
            <Button
              variant="gradient"
              color="green"
              onClick={() => {
                handleOpen();
                handleAlterStatus();
              }}
              disabled={
                filteredData[currentDataIdShow] &&
                filteredData[currentDataIdShow].Status == dataCurrentStatus
                  ? true
                  : false
              }
            >
              Confirmar {dataCurrentStatus}
            </Button>
          )}
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default DialogDataShow;
