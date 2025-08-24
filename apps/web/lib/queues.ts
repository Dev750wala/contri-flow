import { Queue, QueueOptions } from "bullmq"

const connection: QueueOptions = {
    connection: {
        host: process.env.REDIS_HOST_URL,
        port: Number(process.env.REDIS_HOST_PORT),
        password: process.env.REDIS_HOST_PASSWORD,
    }
}

export const commentParseQueue = new Queue("comment_parse", { connection })
export const onChainQueue = new Queue("on_chain", { connection })