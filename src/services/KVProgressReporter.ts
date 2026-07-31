import type { ProgressReporter } from "./ProgressReporter";

import type { UploadProgress } from "../types/progress";

export class KVProgressReporter
    implements ProgressReporter
{
    constructor(

        private env: Env,

        private jobId: string

    ) {}

    async update(progress: UploadProgress) {

        await this.env.UPLOAD_JOBS.put(

            this.jobId,

            JSON.stringify(progress)

        );

    }
}