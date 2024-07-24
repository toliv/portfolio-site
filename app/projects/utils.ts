import { getMDXData } from "app/utils/utils";
import path from "path";

export function getProjectsPosts() {
  return getMDXData(path.join(process.cwd(), "app", "projects", "projects"));
}
