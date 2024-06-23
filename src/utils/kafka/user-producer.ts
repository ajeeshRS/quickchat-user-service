import { kafka } from "../../config/kafkaConfig"

const producer = kafka.producer()

export const produceMessage = async (topic: string, message: Record<string, any>) => {
    try {
        await producer.connect()
        await producer.send({
            topic,
            messages: [
                { value: JSON.stringify(message) }
            ]
        })
        console.log("message sent to kafka: ", message)

    } catch (err) {
        console.error("Error producing message to kafka: ", err)
        throw err
    } finally {
        await producer.disconnect()
    }
}