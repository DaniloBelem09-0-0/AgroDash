import cron from 'node-cron';

// 1. Repositórios e Providers Reais
import { PostgresSensorRepository } from '../infrastructure/database/PostgresSensorRepository.js';
import { PostgresSensorReadingRepository } from '../infrastructure/database/PostgresSensorReadingRepository.js';
import { OpenMeteoProvider } from '../infrastructure/providers/OpenMeteoProvider.js';

// 2. Caso de Uso
import { SyncWeatherUseCase } from '../application/use-cases/SyncWeatherUseCase.js';

// Instâncias (Injeção de Dependência)
const sensorRepo = new PostgresSensorRepository();
const readingRepo = new PostgresSensorReadingRepository();
const weatherProvider = new OpenMeteoProvider();

const syncUseCase = new SyncWeatherUseCase(readingRepo, weatherProvider);

console.log("🤖 Robô Agrícola Iniciado! Aguardando agendamento...");

cron.schedule('*/6 * * * * *', async () => {
    console.log("\n⏰ Iniciando ciclo de coleta de dados...");

    try {
        const activeSensors = await sensorRepo.list();
        console.log(`📡 Encontrados ${activeSensors.length} sensores ativos.`);

        for (const sensor of activeSensors) {
            console.log(`   🔄 Sincronizando: ${sensor.name}...`);
            await syncUseCase.execute(sensor.lat, sensor.lon, sensor.id);
        }

        console.log("✅ Ciclo finalizado com sucesso.");

    } catch (error) {
        console.error("❌ Erro no ciclo do Robô:", error);
    }
});