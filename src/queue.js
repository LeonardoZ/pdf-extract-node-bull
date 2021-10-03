const amqplib = require('amqplib');
const amqpUrl = process.env.AMQP_URL || 'amqp://guest:guest@rabbitmq:5672';
let connection = null;
let channel = null;

async function connect() {
  try {
    if (!connection) {
      connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
    }
    if (!channel) {
      channel = await connection.createChannel();
    }
    console.log('Publishing');
  } catch (e) {
    console.error('Error while connectin to queue message', e);
  }
}

async function sendToQueue(msg, exchange, routingKey, queue) {
  console.log(exchange, routingKey);
  try {
    await connect();
    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    return await channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(msg))
    );
  } catch (error) {
    console.log('Failed to publish in queue', error);
  }
}

const queueData = {
  pdf: {
    exchange: 'pdf.to_process',
    queue: 'pdf.to_process',
    routingKey: 'pdf_to_process',
  },
};

const queues = {
  pdf: {
    sendToQueue: (msg) =>
      sendToQueue(
        msg,
        queueData.pdf.exchange,
        queueData.pdf.routingKey,
        queueData.pdf.queue
      ),
  },
};

module.exports = {
  pdf: queues.pdf,
};
