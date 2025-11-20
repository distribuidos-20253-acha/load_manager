import { program } from "commander";
import { Config, showFigletTitle, writeLog } from "@acha/distribuidos";
import inputExecution from "./src/inputExecution/index.ts";
import type { ZMQReceiver } from "@acha/distribuidos/zeromq/ZMQReceiver";
import ZMQSyncReply from "./src/net/ZMQSyncReply.ts";
import { OperationFactory } from "@acha/distribuidos/schemas/BibOperation";
const config = Config.getInstance();
config.setVersion("0.1.15")

program
  .option('-v, --verbose')

program.showHelpAfterError(true)
program.parse()

const {
  verbose: VERBOSE
} = program.opts()
config.setVerbose(Boolean(VERBOSE));

showFigletTitle("load_manager")

const replier: ZMQReceiver = ZMQSyncReply.getInstance();

for await (const [msg] of replier.sock) {
  await writeLog(`Socket received a message`)
  try {
    const obj = JSON.parse(msg?.toString() ?? "")
    await writeLog(obj)

    const op = await OperationFactory.parseOperation(obj);

    await inputExecution(op)
  } catch (err) {
    await writeLog(`Invalid Message, cannot parse`)
    console.log("cannot parse message", msg?.toString())
  }

}