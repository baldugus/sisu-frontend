import { FetchInterestedSelection, FetchRegistration, FetchRegistrationsBySelectionID } from "../../wailsjs/go/main/App";
import { CallDataTable } from "../components";

const SubscribePage = () => {
  const handleGetData = async () => {
    const selectionRes = await FetchInterestedSelection();
    if (!selectionRes.data) {
      return [];
    }
    const registrationsRes = await FetchRegistrationsBySelectionID(selectionRes.data.ID);
    const registrations = registrationsRes.data || [];

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
        Status: reg?.Status?.toUpperCase() || "WAITLISTED",
        EnrollmentID: reg?.EnrollmentID,
        Ranking: reg?.Ranking,
      };
    });
  };

  return (
    <section className="px-4 w-full  h-[calc(100vh-82px)] overflow-auto lg:rounded-tl-3xl">
      <h1 className="text-3xl font-bold border-b-2 border-black py-4">
        Em espera
      </h1>

      <CallDataTable handleGetData={handleGetData} hasSelector={false} />
    </section>
  );
};

export default SubscribePage;
