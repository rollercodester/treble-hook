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
const topics = {};
exports.default = (function TrebleHookPublisherFactory() {
    return {
        addTopic(topicName, defaultValue) {
            if (topics[topicName]) {
                throw new Error(`The topic "${topicName}" has already been added.`);
            }
            const context = createPublishContext();
            const provider = createPublishProvider(context, defaultValue);
            topics[topicName] = {
                context,
                provider,
            };
        },
        getPublisher() {
            const TrebleHookPublisher = ({ children, }) => {
                const ProviderNest = Object.keys(topics).reduce((tally, topicName) => {
                    const topic = topics[topicName];
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
    if (!topics[topic]) {
        throw new Error(getNoTopicErrorMessage(topic));
    }
    const topicDef = topics[topic];
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
function createPublishProvider(TrebleHookContext, defaultValue) {
    return (props) => {
        const contextState = react_1.useState(defaultValue);
        return react_1.default.createElement(TrebleHookContext.Provider, Object.assign({ value: contextState }, props));
    };
}
function getNoTopicErrorMessage(topicName) {
    return `The topic "${topicName}" has not been added.
  Please use the addTopic function to do so before getting the Publisher.`;
}
//# sourceMappingURL=index.js.map