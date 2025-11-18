import * as zmq from "zeromq"
import "dotenv/config"
import { writeLog, writeLogSync } from "@acha/distribuidos"

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
        resolve(true)
        writeLogSync(`Sock binded [${HOST}:${PORT}]`)
        console.log("Listening in " + `${HOST}:${PORT}`)
      })
    }, 500);
  } catch (err) {
    console.log(err)
  }
}