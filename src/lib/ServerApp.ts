import * as zmq from "zeromq"
import "dotenv/config"
import { writeLog, writeLogSync } from "@acha/distribuidos"
import type { BibResponse } from "@acha/distribuidos/schemas/InputSchema"

export const sock = new zmq.Reply()
const [HOST, PORT] = [
  process.env.LOAD_MANAGER_HOST,
  process.env.LOAD_MANAGER_PORT
]

export const init = async () => {
  await writeLog(`Trying to init load manager network with params [load_manager_host=${HOST}, load_manager_port=${PORT}]`)
  try {
    await sock.bind(`${HOST}:${PORT}`)

    setTimeout(async () => {
      await new Promise((resolve, reject) => {
        writeLogSync(`Sock binded [${HOST}:${PORT}]`)
        console.log("Listening in " + `${HOST}:${PORT}`)
        resolve(true)
      })
    }, 500);
  } catch (err) {
    console.log(err)
  }
}

export const send = async (response: BibResponse) => {
  await writeLog("Sending response to client")
  await writeLog(response)

  try {
    await sock.send(JSON.stringify(response));
    await writeLog("Response sent")
  } catch (err) {
    await writeLog(`Something bad happened trying to send the response, ${err?.toString()}`)
    console.error(err)
  }
}