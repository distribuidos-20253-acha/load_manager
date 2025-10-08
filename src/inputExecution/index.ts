import type NetAdapter from "../net/NetAdapter.ts"
import ClientZeroMQAdapter from "../net/adapters/ClientZeroMQAdapter.ts"
import PubSubZeroMQAdapter from "../net/adapters/PubSubZeroMQAdapter.ts"
import 'dotenv/config'
import colors from 'chalk'
import { sock } from "../lib/ServerApp.ts"
import type { BibInput } from "../schemas/InputSchema.ts"

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

  process.stdout.write(`${colors.cyan(body.operation)} > ${colors.yellow('user:')} ${body.user_id} > ${colors.yellow(`${body.copy_id ? "copy_id" : "book_id"}:`)} ${body.copy_id ?? body.book_id}`);
  process.stdout.write(`${colors.cyan(" ...")}`);

  let req;

  switch (body.operation) {
    case "renew":
      await sock.send("OK");
      req = netPUBSUB.sendRenew({ body })
      break;
    case "return":
      await sock.send("OK");
      req = netPUBSUB.sendReturn({ body })
      break;

    case "reserve":
      req = netCS.sendReserve({ body })
      const response = await req;

      if (response.ok)
        await sock.send("OK")
      else await sock.send(`NO - ${response.body?.toString()}`)

      break;
  }



  process.stdout.write(colors.green('\x1b[4D done\n'));

}