#!/usr/bin/env node
const amqp = require('amqplib/callback_api');

const accounts  = require('./accounts.json');
const {
    v4: uuidv4,
} = require('uuid');


let delay = process.argv[2] || 100
async function start(){
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            const queue = 'transaction';
            channel.assertQueue(queue, { durable: false });
            setInterval(async () => {
                let isCorrupted = Math.random() < 0.1;
                let accountIndex = Math.floor(Math.random() * 99)
                let transaction = {
                    account_num :accounts[accountIndex].account_id,
                    timestamp : Date.now(),
                    transactionId : uuidv4(),
                    amount : isCorrupted ? -1 : Math.floor(Math.random() * (10000 +2 +1)) -2
                }
                console.log(`[EMITTER] Transaction n°${transaction.transactionId} (${transaction.amount}€) envoyée`);
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(transaction)));
            }, delay)
        });
    });

}

start();
