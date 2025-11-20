import 'dotenv/config'
import colors from 'chalk'
import { OperationType, type BibOperation } from "@acha/distribuidos/schemas/BibOperation"
import { writeLog } from "@acha/distribuidos"
import ZMQAsyncRequest from "../net/ZMQAsyncPublisher.ts"
import type { ZMQSender } from "@acha/distribuidos/zeromq/ZMQSender"
import ZMQSyncRequest from "../net/ZMQSyncRequest.ts"
import ZMQSyncReply from '../net/ZMQSyncReply.ts'

export default async (op: BibOperation) => {
  const asyncActors: ZMQSender = ZMQAsyncRequest.getInstance()
  const syncActors: ZMQSender = ZMQSyncRequest.getInstance();
  const replier = ZMQSyncReply.getInstance();

  process.stdout.write(op.toString());
  process.stdout.write(`${colors.cyan(" ...")}`);

  let req;

  await writeLog(`Operation ${op.getOperationLabel()}`)
  switch (op.getOperation()) {
    case OperationType.RENEW:
      req = asyncActors.sendRenew({
        body: op
      })
      await replier.send({ ok: true })
      await writeLog(`Operation resolved to client`)
      break;
    case OperationType.RETURN:
      req = asyncActors.sendReturn({
        body: op
      })
      await replier.send({ ok: true })
      await writeLog(`Operation resolved to client`)
      break;

    case OperationType.RESERVE:
      req = syncActors.sendReserve({
        body: op
      })
      try {
        await writeLog(`I have to wait for an Actor Response`)
        const resp = await req;
        await writeLog(`Response from Actor received`)
        await writeLog(resp);
        await replier.send(resp)
        await writeLog(`Operation resolved to client`)
      } catch (err) {
        console.log(err)
        await replier.send({
          ok: false,
          body: "UNKNOWN ERROR"
        });
      }
      break;
  }

  await writeLog("I'll wait if the request promise is not resolved")
  await req;
  await writeLog("Request Promise resolved")

  process.stdout.write(colors.green('\x1b[4D done\n'));

}