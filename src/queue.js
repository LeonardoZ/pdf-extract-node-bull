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
  try {
    await connect();
    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertExchange(`${queue}_DeadLetterExchange`, 'topic', {
      durable: false,
      autoDelete: true,
      maxLength: 1000,
      noAck: true, // This means dead letter messages will not need an explicit acknowledgement or rejection
    });
    await channel.assertQueue(
      queue,
      (options = {
        durable: true,
        autoDelete: true,
        exclusive: false,
        messageTtl: 1000 * 60 * 60 * 1,
        deadLetterExchange: `${queue}_DeadLetterExchange`,
      })
    );
    await channel.assertQueue(
      `${queue}_DeadLetterQueue`,
      (options = {
        durable: false,
        autoDelete: true,
        exclusive: false,
      })
    );
    await channel.bindQueue(
      `${queue}_DeadLetterQueue`,
      `${queue}_DeadLetterExchange`,
      '#'
    );
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

async function consumeFromQueue(consumer, queue, tag) {
  try {
    await connect();
    await channel.assertExchange(`${queue}_DeadLetterExchange`, 'topic', {
      durable: false,
      autoDelete: true,
      maxLength: 1000,
      noAck: true, // This means dead letter messages will not need an explicit acknowledgement or rejection
    });
    await channel.assertQueue(
      queue,
      (options = {
        durable: true,
        autoDelete: true,
        exclusive: false,
        messageTtl: 1000 * 60 * 60 * 1,
        deadLetterExchange: `${queue}_DeadLetterExchange`,
      })
    );
    await channel.assertQueue(
      `${queue}_DeadLetterQueue`,
      (options = {
        durable: false,
        autoDelete: true,
        exclusive: false,
      })
    );

    await channel.bindQueue(
      `${queue}_DeadLetterQueue`,
      `${queue}_DeadLetterExchange`,
      '#'
    );

    await channel.consume(queue, consumer, {
      noAck: false,
      consumerTag: tag,
    });
  } catch (error) {
    console.log('Failed to publish in queue', error);
  }
}

async function ack(msg) {
  try {
    if (msg) {
      console.log('ack ', msg);
      return await channel.ack(msg);
    }
  } catch (error) {
    console.log('Failed to ack', error);
  }
}
async function nack(msg) {
  try {
    if (msg) {
      console.log('nack ', msg);
      return await channel.nack(msg, true, false);
    }
  } catch (error) {
    console.log('Failed to nack', error);
  }
}

process.once('SIGINT', async () => {
  console.log('got sigint, closing connection');
  await channel.close();
  await connection.close();
  process.exit(0);
});

const queueData = {
  pdf: {
    exchange: 'pdf.to_process',
    queue: 'pdf.to_process',
    routingKey: 'pdf_to_process',
    tag: 'pdf_to_process_consumer',
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
    consumeFromQueue: (consumer) =>
      consumeFromQueue(
        consumer(ack, nack),
        queueData.pdf.queue,
        queueData.pdf.tag
      ),
  },
};

module.exports = {
  pdf: queues.pdf,
};
