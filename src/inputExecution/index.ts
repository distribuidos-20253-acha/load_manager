import type NetAdapter from "../net/NetAdapter.ts"
import ClientZeroMQAdapter from "../net/adapters/ClientZeroMQAdapter.ts"
import PubSubZeroMQAdapter from "../net/adapters/PubSubZeroMQAdapter.ts"
import 'dotenv/config'
import colors from 'chalk'
import { send, sock } from "../lib/ServerApp.ts"
import type { BibInput } from "@acha/distribuidos/schemas/InputSchema"
import { logVerbose, writeLog } from "@acha/distribuidos"


const netPUBSUB: NetAdapter = new PubSubZeroMQAdapter({
  host: process.env.ACTORS_PUB_SUB_HOST!,
  port: process.env.ACTORS_PUB_SUB_PORT!
})
const netCS: NetAdapter = new ClientZeroMQAdapter({
  host: process.env.ACTORS_CLIENT_SERVER_HOST!,
  port: process.env.ACTORS_CLIENT_SERVER_PORT!
})

let initStep = 0;
try {
  initStep++;
  await writeLog("Trying to init PubSubZeroMQAdapter")
  await netPUBSUB.init();
  await writeLog("Succesfully inited PubSubZeroMQAdapter")

  initStep++;
  await writeLog("Trying to init ClientZeroMQAdapter")
  await netCS.init();
  await writeLog("Succesfully inited ClientZeroMQAdapter")
} catch (err) {
  await writeLog(`Error Trying to init ${initStep == 2 ? "ClientZeroMQAdapter" : "PubSubZeroMQAdapter"}`)
  console.error(err)
}

export default async ({ body }: {
  body: BibInput
}) => {
  logVerbose(JSON.stringify(body, null, 2))
  process.stdout.write(`${colors.cyan(body.operation)} > ${colors.yellow('user:')} ${body.user_id} > ${colors.yellow(`${body.copy_id ? "copy_id" : "book_id"}:`)} ${body.copy_id ?? body.book_id}`);
  process.stdout.write(`${colors.cyan(" ...")}`);

  let req;

  await writeLog(`Operation ${body.operation}`)
  switch (body.operation) {
    case "renew":
      req = netPUBSUB.sendRenew({ body })
      await send({ ok: true })
      await writeLog(`Operation resolved to client`)
      break;
    case "return":
      req = netPUBSUB.sendReturn({ body })
      await send({ ok: true })
      await writeLog(`Operation resolved to client`)
      break;

    case "reserve":
      req = netCS.sendReserve({ body })
      try {
        await writeLog(`I have to wait for an Actor Response`)
        const resp = await req;
        await writeLog(`Response from Actor received`)
        await writeLog(resp);
        await sock.send(JSON.stringify(resp))
        await writeLog(`Operation resolved to client`)
      } catch (err) {
        console.log(err)
        await sock.send("ERROR");
      }
      break;
  }

  await writeLog("I'll wait if the request promise is not resolved")
  await req;
  await writeLog("Request Promise resolved")

  process.stdout.write(colors.green('\x1b[4D done\n'));

}