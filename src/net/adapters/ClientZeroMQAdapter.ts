// ODIO ZEROMQ <3

import type NetAdapter from "../NetAdapter.ts";

import * as zmq from "zeromq"
import logVerbose from "../../utils/logVerbose.ts";
import type { BibInput, BibResponse } from "../../schemas/InputSchema.ts";

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
  }

  init(): Promise<boolean> {

    return new Promise(async (resolve, reject) => {
      try {
        this.sock.connect(`${this.host}:${this.port}`)
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

  sendReserve(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return new Promise((resolve, reject) => {

      resolve({
        ok: true
      })
    })
  }

  async sendReturn(context: {
    body: BibInput
  }): Promise<BibResponse> {
    throw new Error("Operation Not supported")
  }
}