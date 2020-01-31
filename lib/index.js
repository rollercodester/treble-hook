"use strict";
/*!*
 * Copyright (c) Igneous, Inc. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
var PubSubTupleIndex;
(function (PubSubTupleIndex) {
    PubSubTupleIndex[PubSubTupleIndex["State"] = 0] = "State";
    PubSubTupleIndex[PubSubTupleIndex["Publish"] = 1] = "Publish";
    PubSubTupleIndex[PubSubTupleIndex["Unsubscribe"] = 2] = "Unsubscribe";
    PubSubTupleIndex[PubSubTupleIndex["DeleteTopic"] = 3] = "DeleteTopic";
})(PubSubTupleIndex = exports.PubSubTupleIndex || (exports.PubSubTupleIndex = {}));
const getUUID = (a, b) => {
    for (b = a = ''; a++ < 36; b += 4 << ~a * 6.5 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-')
        ;
    return b;
};
let trebleHookConfig = {};
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
        const allowDupeState = Boolean(trebleHookConfig.topicConfig
            && trebleHookConfig.topicConfig[topic]
            && trebleHookConfig.topicConfig[topic].allowDupeState);
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
        else if (!trebleHookConfig.suppressDupeStateWarning) {
            const logWarning = process && process.env && process.env.NODE_ENV ? process.env.NODE_ENV === 'development' : true;
            if (logWarning) {
                console.warn('[treble-hook] A publish of unchanged state was attempted for topic:', topic, '\n\n\t- If this is desired behavior then set the "allowDupeState" flag to true', '\n\t-To suppress this warning, set either "allowDupeState" for topic to true ' +
                    'or set the global "suppressDupeStateWarning" flag to true');
            }
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
const deleteTopic = (topic) => () => {
    delete topics[topic];
    console.warn(`[treble-hook] The topic "${topic}" was just deleted.`, '\n\n\t- If any component attempts to access state for the deleted topic, errors/side-effects may occur.', '\n\t- To mitigate this possibility, make sure that only top-level components delete topics');
};
function configPubSub(config) {
    trebleHookConfig = { ...trebleHookConfig, ...config };
}
exports.configPubSub = configPubSub;
function usePubSub(topic, defaultState, publishDefaultState = true) {
    if (arguments.length > 3) {
        throw new Error(`Invalid hook usage; hook must be initialized with either two or three arguments. The first
      argument is the topic, the second argument is the default state value for the topic, and the
      optional third argument determines whether or not to publish default state, which defaults to true.`);
    }
    const [state, setState] = react_1.useState();
    const [subscriptionId, setSubscriptionId] = react_1.useState();
    const publishTopic = react_1.default.useMemo(() => publish(topic), [topic]);
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
        if (typeof state === 'undefined' && publishDefaultState) {
            publishTopic(defaultState);
        }
        return () => {
            unsubscribe(topic, newSubscriptionId)();
        };
    }, []);
    return [
        typeof state !== 'undefined'
            ? state
            : defaultState,
        publishTopic,
        unsubscribe(topic, subscriptionId),
        deleteTopic(topic),
    ];
}
exports.usePubSub = usePubSub;
//# sourceMappingURL=index.js.map