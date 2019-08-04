"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
var PubSubTupleIndex;
(function (PubSubTupleIndex) {
    PubSubTupleIndex[PubSubTupleIndex["State"] = 0] = "State";
    PubSubTupleIndex[PubSubTupleIndex["Publish"] = 1] = "Publish";
    PubSubTupleIndex[PubSubTupleIndex["Unsubscribe"] = 2] = "Unsubscribe";
})(PubSubTupleIndex = exports.PubSubTupleIndex || (exports.PubSubTupleIndex = {}));
const getUUID = (a, b) => {
    for (b = a = ''; a++ < 36; b += 4 << ~a * 6.5 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-')
        ;
    return b;
};
const topics = {};
const getCurrentState = (topic) => {
    const topicRecord = topics[topic];
    if (topicRecord && topicRecord.hasBeenPublished) {
        return topicRecord.currentState;
    }
    else {
        return undefined;
    }
};
const publish = (topic) => (newState) => {
    const topicRecord = topics[topic];
    if (topicRecord) {
        const allowDupeState = false;
        const suppressDupeStateWarning = false;
        let proceed = true;
        if (!allowDupeState) {
            const currentStateCompare = JSON.stringify(topicRecord.currentState);
            const newStateCompare = JSON.stringify(newState);
            proceed = newStateCompare !== currentStateCompare;
        }
        if (proceed) {
            Object.values(topicRecord.subscriptionMap).forEach(publicHook => publicHook[PubSubTupleIndex.Publish](newState));
            topicRecord.currentState = newState;
            topicRecord.hasBeenPublished = true;
        }
        else if (!suppressDupeStateWarning) {
            console.warn('[treble-hook] A publish of unchanged state was attempted for topic:', topic, '\n\n\t- If this is desired behavior then set the "allowDupeState" flag to true', '\n\t-To suppress this warning, set either "allowDupeState" or "suppressDupeStateWarning" flag to true');
        }
    }
    else {
        throw new Error(`Cannot publish to non-existent topic "${topic}"`);
    }
};
const unsubscribe = (topic, subscriptionId) => () => {
    const topicRecord = topics[topic];
    if (topicRecord && subscriptionId) {
        delete topicRecord.subscriptionMap[subscriptionId];
    }
};
function usePubSub(topic, defaultState) {
    if (arguments.length !== 2) {
        throw new Error(`Invalid hook usage; hook must be initialized with two arguments. The first
      argument is the topic and the second argument is the default state value for the topic.`);
    }
    const [state, setState] = react_1.useState();
    const [subscriptionId, setSubscriptionId] = react_1.useState();
    const internalUsePubSubState = () => {
        const currentState = getCurrentState(topic);
        if (typeof state === 'undefined' && typeof currentState !== 'undefined') {
            setState(currentState);
        }
        return [state, setState];
    };
    let internalTuple;
    if (!subscriptionId) {
        internalTuple = internalUsePubSubState();
    }
    react_1.useEffect(() => {
        const newSubscriptionId = getUUID();
        setSubscriptionId(newSubscriptionId);
        if (!topics[topic]) {
            topics[topic] = {
                currentState: state,
                hasBeenPublished: false,
                subscriptionMap: {},
            };
        }
        topics[topic].subscriptionMap[newSubscriptionId] = internalTuple;
        if (typeof state === 'undefined') {
            publish(topic)(defaultState);
        }
        return () => {
            unsubscribe(topic, newSubscriptionId)();
        };
    }, []);
    return [state || defaultState, publish(topic), unsubscribe(topic, subscriptionId)];
}
exports.usePubSub = usePubSub;
//# sourceMappingURL=index.js.map