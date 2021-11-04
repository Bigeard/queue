#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'notifications';

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    });
    channel.prefetch(1);

    channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      channel.bindQueue(q.queue, exchange, '');
      channel.consume(q.queue, function(msg) {
        if(msg.content) {
          channel.ack(msg);
          console.log(" [x] %s", msg.content.toString());
        } else {
          console.log(" [x] ERROR", msg);
          channel.nack(msg, false, false);
        }
      }, {
        noAck: true
      });
    });
  });
});
