import type NetAdapter from "../net/NetAdapter.ts"
import ClientZeroMQAdapter from "../net/adapters/ClientZeroMQAdapter.ts"
import PubSubZeroMQAdapter from "../net/adapters/PubSubZeroMQAdapter.ts"
import 'dotenv/config'
import colors from 'chalk'
import { sock } from "../lib/ServerApp.ts"
import type { BibInput } from "../schemas/InputSchema.ts"
import logVerbose from "../utils/logVerbose.ts"

const netPUBSUB: NetAdapter = new PubSubZeroMQAdapter({
  host: process.env.ACTORS_PUB_SUB_HOST!,
  port: process.env.ACTORS_PUB_SUB_PORT!
})
const netCS: NetAdapter = new ClientZeroMQAdapter({
  host: process.env.ACTORS_CLIENT_SERVER_HOST!,
  port: process.env.ACTORS_CLIENT_SERVER_PORT!
})

try {
  await netPUBSUB.init();
  await netCS.init();
} catch (err) {
  console.error(err)
}

export default async ({ body }: {
  body: BibInput
}) => {

  logVerbose(JSON.stringify(body, null, 2))
  process.stdout.write(`${colors.cyan(body.operation)} > ${colors.yellow('user:')} ${body.user_id} > ${colors.yellow(`${body.copy_id ? "copy_id" : "book_id"}:`)} ${body.copy_id ?? body.book_id}`);
  process.stdout.write(`${colors.cyan(" ...")}`);

  let req;

  switch (body.operation) {
    case "renew":
      req = netPUBSUB.sendRenew({ body })
      await sock.send("OK");
      break;
    case "return":
      req = netPUBSUB.sendReturn({ body })
      await sock.send("OK");
      break;

    case "reserve":
      req = netCS.sendReserve({ body })
      try {
        const resp = await req;
        await sock.send(JSON.stringify(resp.body));
      } catch (err) {
        console.log(err)
        await sock.send("ERROR");
      }
      break;
  }

  await req;

  process.stdout.write(colors.green('\x1b[4D done\n'));

}