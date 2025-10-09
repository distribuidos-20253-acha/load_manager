import { program } from "commander";
import { config } from "./config.ts";
import { init, sock } from "./src/lib/ServerApp.ts";
import colors from "chalk";
import figlet from "figlet";
import { inputSchema, isValid, type BibInput } from "./src/schemas/InputSchema.ts"
import inputExecution from "./src/inputExecution/index.ts";

program
  .option('-v, --verbose')

program.showHelpAfterError(true)
program.parse()

const {
  verbose: VERBOSE
} = program.opts()
config.VERBOSE = VERBOSE

console.clear()
console.log(
  colors.red.bold(await figlet("LOAD_MANAGER")),
  '\nv 0.0.2 -', colors.yellow('created by acha')
)

await init()

for await (const [msg] of sock) {
  try {
    const obj = JSON.parse(msg?.toString() ?? "")

    if (!(await isValid(obj))) {
      console.log("Cannot parse this request")
      continue;
    }

    const qZod = await inputSchema.safeParseAsync(obj)

    await inputExecution({
      body: qZod.data as BibInput
    })
  } catch (err) {
    console.log("cannot parse message", msg?.toString())
  }

}