import * as zmq from "zeromq"
import "dotenv/config"

export const sock = new zmq.Reply()
const [HOST, PORT] = [
  process.env.LOAD_MANAGER_HOST,
  process.env.LOAD_MANAGER_PORT
]

export const init = async () => {
  try {
    await sock.bind(`${HOST}:${PORT}`)

    setTimeout(async () => {
      await new Promise((resolve, reject) => {
        resolve(true)
        console.log("Listening in " + `${HOST}:${PORT}`)
      })
    }, 500);
  } catch (err) {
    console.log(err)
  }
}