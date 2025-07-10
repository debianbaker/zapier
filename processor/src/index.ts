import {PrismaClient} from '@prisma/client'
import {Kafka} from 'kafkajs'

const client = new PrismaClient();

const TOPIC_NAME = "zap-events"

const kafka = new Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092']
})
async function main(){

    const producer = kafka.producer();
    await producer.connect();

    function sleep(ms: number){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    while(1){
        const pendingRows = await client.zapRunOutbox.findMany({
            where:{},
            orderBy: {createdAt: 'asc'},
            take: 10,
        })
        
        if(pendingRows.length > 0){
            await producer.send({
                topic: TOPIC_NAME,
                messages: pendingRows.map(r => ({
                    value: r.zapRunId
                }))
            })

            await client.zapRunOutbox.deleteMany({
                where:{
                    id : {in: pendingRows.map(r => r.id)}
                }
            })

            await sleep(1000);
        }
    }
}

main();