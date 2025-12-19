import * as amqp from 'amqplib';

export class RabbitMQService {
    private connection: any  = null;
    private channel: any = null;
    private readonly queue = 'sensor_commands';
    private isConnecting = false;

    constructor(private readonly url: string = 'amqp://localhost') {}

    async connect(): Promise<void> {
        if (this.connection && this.channel) return;
        if (this.isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.connect();
        }

        this.isConnecting = true;
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();

            await this.channel.assertQueue(this.queue, { durable: true });
            console.log('✅ [RabbitMQ] Conectado e canal criado.');
        } catch (error) {
            console.error('❌ [RabbitMQ] Erro ao conectar:', error);
            this.connection = null;
            this.channel = null;
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    async sendCommand(command: string, sensorId: string, sensorType: string): Promise<void> {
        if (!this.channel) {
            await this.connect();
        }

        if (!this.channel) {
            throw new Error('Não foi possível estabelecer canal com RabbitMQ');
        }

        const payload = { 
            action: command,
            sensorId, 
            type: sensorType,
            timestamp: new Date().toISOString()
        };

        const message = JSON.stringify(payload);
        
        this.channel.sendToQueue(this.queue, Buffer.from(message), { 
            persistent: true 
        });

        console.log(`[MQ] Comando enviado: ${command} para ${sensorId}`);
    }
}
