// ODIO ZEROMQ <3

import type NetAdapter from "../NetAdapter.ts";

import * as zmq from "zeromq"
import { logVerbose, writeLogSync } from "@acha/distribuidos";
import type { BibInput, BibResponse } from "@acha/distribuidos/schemas/InputSchema";

export default class ClientZeroMQAdapter implements NetAdapter {
  private host: string;
  private port: string;
  private sock: zmq.Request;

  constructor({
    host, port
  }: { host: string, port: string }) {
    this.sock = new zmq.Request()
    this.port = port;
    this.host = host;

    writeLogSync(`ClientZeroMQAdapter (REQ/REP) Instantiated with params [host=${host}, port=${port}]`)
  }

  init(): Promise<boolean> {

    return new Promise(async (resolve, reject) => {
      try {
        this.sock.connect(`${this.host}:${this.port}`)
        writeLogSync(`ClientZeroMQAdapter connected [${this.host}:${this.port}]`)
        logVerbose("Connected to " + `${this.host}:${this.port}`)
        setTimeout(() => {
          resolve(true)
        }, 500);
      } catch (err) {
        reject(false)
      }
    })
  }

  sendRenew(context: {
    body: BibInput
  }): Promise<BibResponse> {
    throw new Error("Operation Not supported")
  }

  private resendBody(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return new Promise(async (resolve, reject) => {
      let tries = 1;
      while (!this.sock.writable) {
        await (() => new Promise(resolveBussy => {
          if (tries == 10) {
            writeLogSync(`[ERROR] Cannot make request!!!!!!!!!!!`)
            return;
          }
          writeLogSync(`Socked bussy, waiting for 100ms, [try=${tries}]`)
          setTimeout(() => {
            resolveBussy(true)
          }, 100);
          tries++;
        }))()
      }
      writeLogSync("Sending...")
      await this.sock.send(JSON.stringify(context.body))
      const [result] = await this.sock.receive()

      resolve({
        ok: true,
        body: result?.toString() ?? ""
      })
    })
  }

  sendReserve(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return this.resendBody(context)
  }

  async sendReturn(context: {
    body: BibInput
  }): Promise<BibResponse> {
    throw new Error("Operation Not supported")
  }
}