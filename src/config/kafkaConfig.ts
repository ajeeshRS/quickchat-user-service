import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'user-service',
    brokers: ['kafka:9092']
})