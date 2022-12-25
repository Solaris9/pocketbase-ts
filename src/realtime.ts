// Some code has been used from the official PocketBase SDK for this realtime implementation as
// it would have been similar to what I would have written and it already exists.
// Anything that is exactly the same belongs to:
// https://github.com/pocketbase/js-sdk/blob/e6fa0/src/services/RealtimeService.ts

import { pocketBaseURL } from "./client";
import { Collection, ExtractCollectionGeneric } from "./collection";
import { request } from "./utils";

const MAX_CONNECT_TIMEOUT = 10_000;
const MAX_RECONNECT_ATTEMPTS = 10_000;
const PREDEFINED_RECONNECT_INTERVALS = [
    200, 300, 500, 1000, 1200, 1500, 2000,
];

type SubscribeAction = "create" | "update" | "delete";
type SubscribeListener<T> = <T>(action: SubscribeAction, record: T) => void;
type SubscribeWrapper = (e: MessageEvent) => void;
type PendingConnection = {
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
};

let connectTimeout: number;
let reconnectTimeout: number;
let reconnectAttempts = 0;

let clientID: string | null = null;
let eventSource: EventSource | null = null;
let subscriptions: Record<string, SubscribeWrapper[]> = {};
let lastSentSubscriptions: string[] = [];
let pendingConnects: PendingConnection[] = [];

export const isConnected = () => !!eventSource && !!clientID && !pendingConnects.length;

const removeAllSubscriptionListeners = () => {
    if (!eventSource) return;

    for (let topic in subscriptions) {
        for (let listener of subscriptions[topic]) {
            eventSource!.removeEventListener(topic, listener);
        }
    }
}

const addAllSubscriptionListeners = () => {
    if (!eventSource) return;

    for (let topic in subscriptions) {
        for (let listener of subscriptions[topic]) {
            eventSource!.addEventListener(topic, listener);
        }
    }
}

const hasUnsentSubscriptions = () => {
    const latestTopics = Object.keys(subscriptions);
    if (lastSentSubscriptions.length != latestTopics.length) return true;
    
    for (const t of latestTopics) {
        if (!lastSentSubscriptions.includes(t)) return true;
    }

    return false;
}

const submitSubscriptions = () => {
    if (!eventSource) return Promise.resolve();

    removeAllSubscriptionListeners();
    addAllSubscriptionListeners();

    lastSentSubscriptions = Object.keys(subscriptions);

    return request("/api/realtime", {
        body: {
            clientId: clientID,
            subscriptions: lastSentSubscriptions,
        },
        params: {
            $cancelKey: `realtime_${clientID}`,
        }
    }, "POST");
}

const connect = () => {
    // immediately resolve the promise to avoid indefinitely
    // blocking the client during reconnection
    if (reconnectAttempts > 0) return;

    return new Promise((resolve, reject) => {
        pendingConnects.push({ resolve, reject });

        // all promises will be resolved once the connection is established
        if (pendingConnects.length > 1) return;

        initConnect();
    })
}

const initConnect = () => {
    disconnect(true);
    
    // wait up to 10s for connect
    clearTimeout(connectTimeout);
    connectTimeout = setTimeout(() => {
        connectErrorHandler(new Error("EventSource took too long to connect."));
    }, MAX_CONNECT_TIMEOUT);

    eventSource = new EventSource(`${pocketBaseURL}/api/realtime`);

    eventSource.addEventListener('PB_CONNECT', async (e) => {
        clientID = e.lastEventId;

        await submitSubscriptions()
            .then(async () => {
                let retries = 3;
                
                while (hasUnsentSubscriptions() && retries > 0) {
                    retries--;
                    // resubscribe to ensure that the latest topics are submitted
                    //
                    // This is needed because missed topics could happen on reconnect
                    // if after the pending sent `submitSubscriptions()` call another `subscribe()`
                    // was made before the submit was able to complete.
                    await submitSubscriptions();
                }

                for (let p of pendingConnects) p.resolve();

                // reset connect meta
                pendingConnects = [];
                reconnectAttempts = 0;
                clearTimeout(reconnectTimeout);
                clearTimeout(connectTimeout);
            }).catch((err) => {
                clientID = "";
                connectErrorHandler(err);
            });
    });

    eventSource.addEventListener("error", () => {
        connectErrorHandler(new Error("Failed to establish realtime connection."));
    });
}

const connectErrorHandler = (error: Error) => {
    clearTimeout(connectTimeout);
    clearTimeout(reconnectTimeout);

    if (
        // wasn't previously connected -> direct reject
        !(clientID && reconnectAttempts) ||
        // was previously connected but the max reconnection limit has been reached
        reconnectAttempts > MAX_RECONNECT_ATTEMPTS
    ) {
        for (let p of pendingConnects) p.reject(error);
        disconnect();
        return;
    }

    // otherwise -> reconnect in the background
    disconnect(true);
    const timeout = PREDEFINED_RECONNECT_INTERVALS[reconnectAttempts] ||
        PREDEFINED_RECONNECT_INTERVALS.at(-1);
        
    reconnectAttempts++;
    reconnectTimeout = setTimeout(() => {
        connect();
    }, timeout);
}

export const disconnect = (fromReconnect = false) => {
    clearTimeout(connectTimeout);
    clearTimeout(reconnectTimeout);
    removeAllSubscriptionListeners();
    eventSource?.close();
    eventSource = null;
    clientID = "";

    if (!fromReconnect) {
        reconnectAttempts = 0;

        // reject any remaining connect promises
        const err = new Error("Realtime disconnected.");
        for (let p of pendingConnects) p.reject(err);
        pendingConnects = [];
    }
}

export type Unsubscribe = {
    (collection: Collection<unknown>, topic: string): Promise<void>;
    (collection: Collection<unknown>): Promise<void>;
    (): Promise<void>;
}

export const unsubscribe: Unsubscribe = async (collection?: Collection<unknown>, topic?: string) => {
    if (!isConnected()) return;
    
    if (!collection && !topic) {
        subscriptions = {};
        disconnect();
        return;
    }
    if (!(collection instanceof Collection)) throw new Error("collection not provided.");

    topic = topic ? `${collection!.identifier}/${topic}` : collection!.identifier!;

    for (let listener of subscriptions[topic]) {
        eventSource!.removeEventListener(topic, listener);
    }

    delete subscriptions[topic];
    await submitSubscriptions();
}

export type Subscribe = {
    <T extends Collection<unknown>>(
        collection: T,
        listener: SubscribeListener<ExtractCollectionGeneric<T>>
    ): Promise<Unsubscribe>;

    <T extends Collection<unknown>>(
        collection: T,
        record: string,
        listener: SubscribeListener<ExtractCollectionGeneric<T>>
    ): Promise<Unsubscribe>;
}

export const subscribe: Subscribe = async<T extends Collection<unknown>>(
    collection: T,
    recordOrListener: string | SubscribeListener<ExtractCollectionGeneric<T>>,
    listener?: SubscribeListener<ExtractCollectionGeneric<T>>
) => {
    if (!(collection instanceof Collection)) throw new Error("collection not provided.");
    if (!recordOrListener) throw new Error("record or listener not provided.");
    if (typeof recordOrListener == "string" && !listener)
        throw new Error("listener not provided.");

    const topic = typeof recordOrListener == "string" ?
        `${collection.identifier}/${recordOrListener}` :
        collection.identifier!;
    
    listener = (listener! ?? recordOrListener);

    const wrapper: SubscribeWrapper = e => {
        let data;

        try {
            data = JSON.parse(e?.data);
        } catch {}

        listener!(data?.action ?? "", data?.record ?? {});
    }

    subscriptions[topic] = [...subscriptions[topic] ?? [], wrapper];

    if (!isConnected()) {
        connect();
    } else if (subscriptions[topic].length == 1) {
        await submitSubscriptions();
    } else {
        eventSource!.addEventListener(topic, wrapper);
    }

    return async () => {
        if (subscriptions[topic].length == 1) delete subscriptions[topic];
        else subscriptions[topic].splice(1, subscriptions[topic].indexOf(wrapper));
        
        eventSource!.removeEventListener(topic, wrapper);
        await submitSubscriptions();
    }
}