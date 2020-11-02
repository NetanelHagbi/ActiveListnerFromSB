const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus");
const { loginWithServicePrincipalSecret } = require("@azure/ms-rest-nodeauth");

// Load the .env file if it exists
require("dotenv").config();

// Define Service Bus Endpoint here and related entity names here
const serviceBusEndpoint =
  process.env.SERVICE_BUS_ENDPOINT || "<your-servicebus-namespace>.servicebus.windows.net";

// Define CLIENT_ID, TENANT_ID and SECRET of your AAD application here
const tenantId = process.env.AZURE_TENANT_ID || "<azure tenant id>";
const clientSecret = process.env.AZURE_CLIENT_SECRET || "<azure client secret>";
const clientId = process.env.AZURE_CLIENT_ID || "<azure client id>";
const topicName = process.env.TOPIC_NAME;
const subscriptionName = process.env.SUBSCRIPTION_NAME; 

async function main() {
  const tokenCreds = await loginWithServicePrincipalSecret(clientId, clientSecret, tenantId, {
    tokenAudience: "https://servicebus.azure.net/"
  });

  const sbClient = ServiceBusClient.createFromAadTokenCredentials(serviceBusEndpoint, tokenCreds);
  const subscriptionClient = sbClient.createSubscriptionClient(topicName, subscriptionName);
  const receiver = subscriptionClient.createReceiver(ReceiveMode.peekLock);
  /*
Refer to other samples, and place your code here
to create queue clients, and send/receive messages
*/

  try {
    receiver.registerMessageHandler(processMessage,processError,
      {
        autoComplete: false
      }
    );
} finally {
    await sbClient.close();
}
}

main().catch((err) => {
  console.log("Error occurred: ", err);
});

async function processMessage(brokeredMessage) {
    console.log("Received message: ", brokeredMessage.body);
    await brokeredMessage.complete();
};
  
function processError(err) {
    console.log("Error occurred: ", err);
};
