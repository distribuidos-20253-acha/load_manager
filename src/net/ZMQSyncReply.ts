import { BaseZMQSyncReply } from "@acha/distribuidos/zeromq/BaseZMQSyncReply"
import "dotenv/config"

export default class ZMQSyncReply extends BaseZMQSyncReply {
  protected override host: string = process.env.LOAD_MANAGER_HOST!;
  protected override port: string = process.env.LOAD_MANAGER_PORT!;
}