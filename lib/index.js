"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const topicsCache = {};
exports.default = (function TrebleHookPublisherFactory() {
    return {
        addTopic(topicName, defaultValue, initWithSessionStorage = false) {
            if (!topicsCache[topicName]) {
                const context = createPublishContext();
                let normDefaultValue = defaultValue;
                if (initWithSessionStorage) {
                    const checkValue = sessionStorage.getItem(topicName);
                    if (checkValue !== null) {
                        try {
                            normDefaultValue = JSON.parse(checkValue);
                        }
                        catch (_) {
                            normDefaultValue = checkValue;
                        }
                    }
                }
                const provider = createPublishProvider(topicName, context, normDefaultValue, initWithSessionStorage);
                topicsCache[topicName] = {
                    context: context,
                    provider,
                };
            }
        },
        getPublisher(topics) {
            const TrebleHookPublisher = ({ children, }) => {
                const topicNames = topics && topics.length
                    ? Object.keys(topicsCache).filter(key => topics.some(topicName => topicName === key))
                    : Object.keys(topicsCache);
                const ProviderNest = topicNames.reduce((tally, topicName) => {
                    const topic = topicsCache[topicName];
                    if (!topic) {
                        throw new Error(getNoTopicErrorMessage(topicName));
                    }
                    const Provider = topic.provider;
                    return react_1.default.createElement(Provider, null, tally);
                }, react_1.default.createElement(react_1.default.Fragment, null, children));
                return ProviderNest;
            };
            return TrebleHookPublisher;
        },
    };
})();
function usePubSub(topic) {
    if (!topicsCache[topic]) {
        throw new Error(getNoTopicErrorMessage(topic));
    }
    const topicDef = topicsCache[topic];
    const context = react_1.useContext(topicDef.context);
    if (!context) {
        throw new Error(`The "${topic} topic must be used within the context of a TrebleHook publisher.
         Please wrap your App component with a TrebleHook publisher.`);
    }
    return context;
}
exports.usePubSub = usePubSub;
var PubSubTupleIndex;
(function (PubSubTupleIndex) {
    PubSubTupleIndex[PubSubTupleIndex["State"] = 0] = "State";
    PubSubTupleIndex[PubSubTupleIndex["Publish"] = 1] = "Publish";
})(PubSubTupleIndex = exports.PubSubTupleIndex || (exports.PubSubTupleIndex = {}));
function createPublishContext() {
    return react_1.createContext();
}
function createPublishProvider(topicName, TrebleHookContext, defaultValue, initWithSessionStorage = false) {
    return (props) => {
        const contextState = react_1.useState(defaultValue);
        const [stateValue] = contextState;
        const isMounted = react_1.useRef(true);
        react_1.useEffect(() => {
            return () => {
                isMounted.current = false;
            };
        }, []);
        react_1.useEffect(() => {
            if (isMounted.current && initWithSessionStorage) {
                sessionStorage.setItem(topicName, JSON.stringify(stateValue));
            }
        }, [stateValue]);
        return react_1.default.createElement(TrebleHookContext.Provider, { children: props.children, value: contextState });
    };
}
function getNoTopicErrorMessage(topicName) {
    return `The topic "${topicName}" has not been added.
  Please use the addTopic function to do so before getting the Publisher.`;
}
//# sourceMappingURL=index.js.map