import type { BibOperation, BibResponse } from "@acha/distribuidos/schemas/BibOperation";
import { BaseZMQAsyncPublisher } from "@acha/distribuidos/zeromq/BaseZMQAsyncPublisher"
import "dotenv/config"

export default class ZMQAsyncPublisher extends BaseZMQAsyncPublisher {
  protected override host: string = process.env.ACTORS_PUB_SUB_HOST!;
  protected override port: string = process.env.ACTORS_PUB_SUB_PORT!;

  override sendRenew(context: { body: BibOperation; }): Promise<BibResponse> {
    return new Promise(async (resolve, reject) => {
      await this.sock.send(["renew", JSON.stringify(context.body)])
      resolve({ ok: true });
    })
  }

  override sendReturn(context: { body: BibOperation; }): Promise<BibResponse> {
    return new Promise(async (resolve, reject) => {
      await this.sock.send(["return", JSON.stringify(context.body)])
      resolve({ ok: true });
    })
  }
}