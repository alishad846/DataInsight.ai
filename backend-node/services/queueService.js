// import { v4 as uuidv4 } from "uuid";
import { enqueueJob } from "./queueService.js";

/**
 * Create new job for dataset processing
 */
export const createJob = async ({ job_id, dataset_id, filepath }) => {
    //   const job_id = uuidv4(); // job_id is not created here. It is wrong.

    const job = {
        job_id,
        dataset_id,
        filepath,
        stage: "UPLOADED",
        created_at: new Date().toISOString(),
    };

    await enqueueJob(job);

    return job;
};