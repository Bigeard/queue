#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
const accounts  = require('./accounts.json');

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        const queue = 'transaction';
        channel.assertQueue(queue, {
            durable: false
        });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, function(msg) {
            let transaction = JSON.parse(msg.content.toString());
            if(transaction.amount > 0) {
                // channel.ack(msg)
                setTimeout(() => {
                    console.log(`[AGENT] Transaction n° ${transaction.transactionId} traitée avec succès, ${transaction.amount}`)
                    send_message(channel, transaction)
                } , 3000)
            }
        }, {
            noAck: true
        });
    });
});

function send_message(channel, transaction) {
    var exchange_queue = 'notifications';
    var account = accounts.find(e => e.account_id == transaction.account_num)
    var message = {
        message: `Bonjour ${account.owner_first_name} ${account.owner_last_name}, votre paiement de ${transaction.amount}€ a bien été effectué`,
        account_id: transaction.account_num,
        mail : account.owner_mail,
        tel : account.owner_phone
    };
    channel.assertExchange(exchange_queue, 'fanout', { durable: false });
    channel.publish(exchange_queue, '', Buffer.from(JSON.stringify(message)));
} 
