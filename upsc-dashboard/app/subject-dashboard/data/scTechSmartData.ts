import { RAW_D as BASE_RAW_D } from "./scTechData";
import { buildSmartModeData } from "./smartModeData";

export const RAW_D = buildSmartModeData(BASE_RAW_D, {
  subjectName: "Science & Technology",
});
