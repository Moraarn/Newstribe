import { toast } from "sonner";
import { reloadPage } from "./cache";
import { AppResponse } from "./server";

export function updateUiFeed(state: AppResponse<any> | null, path?: string) {
  if (state?.success && state?.message) {
    toast.success(state?.message);
  } else if (state?.message) {
    toast.error(state?.message);
  }
  if (path !== undefined && state?.success) {
    reloadPage(path);
  }
}
