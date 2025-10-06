import { program } from "commander";
import { config } from "./config.ts";
import InputSchema from "./src/inputExecution/InputSchema.ts";
import inputExecution from "./src/inputExecution/index.ts";
import type { Input } from "./src/net/NetAdapter.ts";
import { init, sock } from "./src/lib/ServerApp.ts";

program
  .option('-v, --verbose')

program.showHelpAfterError(true)
program.parse()

const {
  verbose: VERBOSE
} = program.opts()
config.VERBOSE = VERBOSE

await init()

for await (const [msg] of sock) {
  try {
    const obj = JSON.parse(msg?.toString() ?? "")

    if (!(await InputSchema.isValid(obj))) {
      console.log("Cannot parse this request")
      continue;
    }

    const qZod = await InputSchema.inputSchema.safeParseAsync(obj)

    await inputExecution({
      body: qZod.data as Input
    })
  } catch (err) {
    console.log("cannot parse message", msg?.toString())
  }

}