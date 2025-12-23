import * as amqp from 'amqplib';
import CircuitBreaker from 'opossum';

export class RabbitMQService {
    private connection: any = null;
    private channel: any = null;
    private readonly queue = 'sensor_commands';
    private isConnecting = false;
    
    private breaker: CircuitBreaker;

    constructor(private readonly url: string = 'amqp://localhost') {
        const options = {
            timeout: 3000,             
            errorThresholdPercentage: 50, 
            resetTimeout: 10000        
        };

        this.breaker = new CircuitBreaker(this.internalPublish.bind(this), options);
        
        this.breaker.on('open', () => console.warn('🔥 [Circuit Breaker] ABERTO! RabbitMQ parece estar fora.'));
        this.breaker.on('halfOpen', () => console.log('🟡 [Circuit Breaker] MEIO-ABERTO. Testando conexão...'));
        this.breaker.on('close', () => console.log('✅ [Circuit Breaker] FECHADO. RabbitMQ recuperado.'));
        
        this.breaker.fallback(() => {
            console.error('⛔ [Fallback] Mensagem não enviada. Salvando em Log/DLQ (Simulado).');
            return { error: "Service Unavailable (Circuit Open)" };
        });
    }

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
            console.log('✅ [RabbitMQ] Conectado.');
        } catch (error) {
            console.error('❌ [RabbitMQ] Falha na conexão inicial:', error);
            this.connection = null;
            this.channel = null;
        } finally {
            this.isConnecting = false;
        }
    }
    
    private async internalPublish(payload: any): Promise<void> {
        if (!this.channel) {
            await this.connect();
        }

        if (!this.channel) {
            throw new Error('RabbitMQ Channel offline');
        }

        const message = JSON.stringify(payload);
        
            const sent = this.channel.sendToQueue(this.queue, Buffer.from(message), { 
            persistent: true 
        });

        if (!sent) {
            throw new Error('RabbitMQ Buffer Full');
        }
        
        console.log(`[MQ] Enviado (Real): ${payload.action} -> ${payload.sensorId}`);
    }

    async sendCommand(command: string, sensorId: string, sensorType: string): Promise<void> {
        const payload = { 
            action: command, 
            sensorId, 
            type: sensorType,
            timestamp: new Date().toISOString()
        };

        await this.breaker.fire(payload);
    }

    async close(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch (error) {
            console.error('Erro ao encerrar RabbitMQ:', error);
        }
    }
}