import redis from "./redisService.js";

const QUEUE_NAME = "dataset_jobs";

/* Add job to queue*/
export const enqueueJob = async (jobData) => {
  try {
    await redis.lpush(QUEUE_NAME, JSON.stringify(jobData));
    console.log("📥 Job added to queue:", jobData.job_id);
  } catch (error) {
    console.error("❌ Queue error:", error);
    throw error;
  }
};


/* Worker will use this later*/
export const dequeueJob = async () => {
  const job = await redis.rpop(QUEUE_NAME);
  return job ? JSON.parse(job) : null;
};