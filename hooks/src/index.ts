import express from "express"
import {PrismaClient} from '@prisma/client'

const client = new PrismaClient()

const app = express();

app.use(express.json());
// zapier webhook api format
// secret logic - so that not anyone can hit it with some data

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    //when the trigger happens => zap Runs, atomically put the zap to run in the zapRun Table and the zapRunOutbox  
    try{
        await client.$transaction(async tx => {
            const run =  await tx.zapRun.create({
                data: {
                    zapId: zapId,
                    metadata: body
                }
            })
            await tx.zapRunOutbox.create({
                data: {
                    zapRunId: run.id
                }
            })
            res.status(200).json({success: "Zap actions ready for execution now"})
        })
    }
    catch(err){
        res.status(500).json({error: "Failed to record Zap run"})
    }

    // store in db a new trigger
    // push it onto a queue (kafka/redis)
})

app.listen(3000, () => console.log("server started at 3000"))