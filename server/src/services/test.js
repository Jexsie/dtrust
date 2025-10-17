import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
async function createTopicDemo() {
  const client = Client.forTestnet().setOperator(
    "0.0.4668461",
    PrivateKey.fromStringDer(
      "302e020100300506032b657004220420108560819c22c622686b274b027896f305042974063ee5f4b299250c59f44cb5"
    )
  );

  // build & execute the topic creation transaction
  const transaction = new TopicCreateTransaction().setTopicMemo(
    "Dtrust HCS topic"
  );

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Topic created successfully:", receipt.topicId.toString());
}

createTopicDemo();
