import { useParams } from "react-router-dom";
import { CallDataTable } from "../components";
import { Typography } from "@material-tailwind/react";
import { FetchApplicationsByRollCall, FetchRegistration } from "../../wailsjs/go/main/App";

const CallPage = () => {
  const { id } = useParams();
  const handleGetData = async () => {
    if (!id) return [];
    const response = await FetchApplicationsByRollCall(parseInt(id));
    const registrations = response.data || [];

    const details = await Promise.all(
      registrations.map((reg: any) => FetchRegistration(reg.ID))
    );

    return details.map((res: any) => {
      const detail = res.data;
      const reg = detail?.Registration;
      const course = detail?.Course;
      const candidate = reg?.Candidate;

      let period = "";
      if (course?.Period === "morning") period = "Matutino";
      else if (course?.Period === "evening") period = "Noturno";

      return {
        ID: reg?.ID,
        Name: candidate?.Name || "",
        CPF: candidate?.CPF || "",
        Period: period,
        Quota: course?.Quota || "",
        Status: reg?.Status?.toUpperCase() || "APPROVED",
        EnrollmentID: reg?.EnrollmentID,
        Ranking: reg?.Ranking,
      };
    });
  };

  return (
    <section className="px-4 w-full  h-[calc(100vh-82px)] overflow-auto lg:rounded-tl-3xl">
      <Typography variant="h2" className="border-b-2 border-black py-4">
        {`${id}ª Chamada`}
      </Typography>
      <CallDataTable handleGetData={handleGetData} />
    </section>
  );
};

export default CallPage;
