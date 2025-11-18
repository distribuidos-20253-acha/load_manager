// ODIO ZEROMQ <3

import { logVerbose, writeLogSync } from "@acha/distribuidos";
import type NetAdapter from "../NetAdapter.ts";

import * as zmq from "zeromq"
import type { BibInput, BibResponse } from "@acha/distribuidos/schemas/InputSchema";

export default class PubSubZeroMQAdapter implements NetAdapter {
  private host: string;
  private port: string;
  private sock: zmq.Publisher;

  constructor({
    host, port
  }: { host: string, port: string }) {
    this.sock = new zmq.Publisher()
    this.sock.linger = 500
    this.sock.sendHighWaterMark = 1000
    this.sock.conflate = false
    this.port = port;
    this.host = host;

    writeLogSync(`PubSubZeroMQAdapter (PUB/SUB) Instantiated with params [host=${host}, port=${port}]`)
  }
  
  init(): Promise<boolean> {
    
    return new Promise(async (resolve, reject) => {
      try {
        this.sock.bind(`${this.host}:${this.port}`)
        writeLogSync(`PubSubZeroMQAdapter (PUB/SUB) binded [${this.host}:${this.port}]`)
        logVerbose("Binded to " + `${this.host}:${this.port}`)
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
    return new Promise(async (resolve, reject) => {
      await this.sock.send(["renew", JSON.stringify(context.body)])
      resolve({ ok: true });
    })
  }

  sendReserve(context: {
    body: BibInput
  }): Promise<BibResponse> {
    throw new Error("Operation Not supported")
  }

  async sendReturn(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return new Promise(async (resolve, reject) => {
      await this.sock.send(["return", JSON.stringify(context.body)])
      resolve({ ok: true });
    })
  }
}