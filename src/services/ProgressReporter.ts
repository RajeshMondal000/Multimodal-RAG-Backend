import type { UploadProgress } from "../types/progress";

export interface ProgressReporter {

    update(progress: UploadProgress): Promise<void>;

}