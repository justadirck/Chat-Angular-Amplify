import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type EagerChatty = {
  readonly id: string;
  readonly user: string;
  readonly message?: string | null;
  readonly createdAt?: string | null;
}

type LazyChatty = {
  readonly id: string;
  readonly user: string;
  readonly message?: string | null;
  readonly createdAt?: string | null;
}

export declare type Chatty = LazyLoading extends LazyLoadingDisabled ? EagerChatty : LazyChatty

export declare const Chatty: (new (init: ModelInit<Chatty>) => Chatty) & {
  copyOf(source: Chatty, mutator: (draft: MutableModel<Chatty>) => MutableModel<Chatty> | void): Chatty;
}