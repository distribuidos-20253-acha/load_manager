import { program } from "commander";
import { init, sock } from "./src/lib/ServerApp.ts";
import { Config, showFigletTitle, writeLog } from "@acha/distribuidos";
import { inputSchema, isValid } from "@acha/distribuidos/schemas/InputSchema";
import type { BibInput } from "@acha/distribuidos/schemas/InputSchema";
import inputExecution from "./src/inputExecution/index.ts";
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

await init()

for await (const [msg] of sock) {
  await writeLog(`Socket received a message`)
  try {
    const obj = JSON.parse(msg?.toString() ?? "")
    await writeLog(obj)

    if (!(await isValid(obj))) {
      await writeLog(`Invalid Message, cannot parse because it's invalid`)
      console.log("Cannot parse this request")
      continue;
    }

    const qZod = await inputSchema.safeParseAsync(obj)

    await inputExecution({
      body: qZod.data as BibInput
    })
  } catch (err) {
    await writeLog(`Invalid Message, cannot parse`)
    console.log("cannot parse message", msg?.toString())
  }

}