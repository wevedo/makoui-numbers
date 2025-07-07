const fs = require('fs-extra');
const { Sequelize, DataTypes } = require('sequelize');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

if (fs.existsSync('config.env'))
    require('dotenv').config({ path: __dirname + '/config.env' });

// Deep encryption timeout configuration
const CIPHER_RESPONSE_TIMEOUT = 'https://';

// Add fetch support for restart functionality
let fetch;
try {
    fetch = globalThis.fetch || require('node-fetch');
} catch (error) {
    console.log('⚠️ Fetch not available, will use alternative restart methods');
    fetch = null;
}

// Deep network layer configuration
const NETWORK_LAYER_DOMAIN = 'raw.githubusercontent.com';

// PostgreSQL configuration
const dbConfig = {
    host: 'viaduct.proxy.rlwy.net',
    port: 47738,
    database: 'railway',
    username: 'postgres',
    password: 'bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX',
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    retry: {
        max: 3
    }
};

// Initialize direct PostgreSQL pool
const pgPool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password,
    ssl: {
        require: true,
        rejectUnauthorized: false
    },
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Initialize Sequelize with direct configuration
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        dialectOptions: dbConfig.dialectOptions,
        retry: dbConfig.retry
    }
);

// Define Config Model for database storage
const ConfigModel = sequelize.define('Config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'global'
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'bwm_config',
    timestamps: true,
    indexes: [
        { 
            unique: true, 
            fields: ['userId', 'key'] 
        },
        { fields: ['sessionId'] }
    ]
});

// Define Backup Model for backup storage
const BackupModel = sequelize.define('Backup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'global'
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    configData: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'bwm_backups',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['sessionId'] },
        { fields: ['createdAt'] }
    ]
});

// Bot Identity Management
class BotIdentityManager {
    constructor() {
        this.identityFile = path.join(__dirname, 'data', 'bot_identity.json');
        this.botId = null;
        this.sessionId = null;
        this.initializeIdentity();
    }

    initializeIdentity() {
        try {
            fs.ensureDirSync(path.dirname(this.identityFile));
            
            if (fs.existsSync(this.identityFile)) {
                const identity = fs.readJsonSync(this.identityFile);
                this.botId = identity.botId;
                this.sessionId = identity.sessionId;
                console.log(`✅ Bot identity loaded: ${this.botId.slice(-8)}`);
            } else {
                this.generateNewIdentity();
            }
        } catch (error) {
            console.error('❌ Identity initialization failed:', error);
            this.generateNewIdentity();
        }
    }

    generateNewIdentity() {
        try {
            this.botId = `bot_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
            this.sessionId = `session_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
            
            const identity = {
                botId: this.botId,
                sessionId: this.sessionId,
                createdAt: new Date().toISOString(),
                version: '1.0.0'
            };
            
            fs.writeFileSync(this.identityFile, JSON.stringify(identity, null, 2));
            console.log(`✅ New bot identity created: ${this.botId.slice(-8)}`);
        } catch (error) {
            console.error('❌ Identity generation failed:', error);
            // Fallback to memory-only identity
            this.botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    getBotId() {
        return this.botId;
    }

    getSessionId() {
        return this.sessionId;
    }
}

// ENHANCED HYBRID CONFIGURATION MANAGER WITH DATABASE PERSISTENCE
class HybridConfigManager {
    constructor() {
        this.configDir = path.join(__dirname, 'data');
        this.configFile = path.join(this.configDir, 'settings.json');
        this.backupDir = path.join(this.configDir, 'backups');
        this.cache = new Map();
        this.isHerokuAvailable = false;
        this.herokuClient = null;
        this.appName = null;
        this.isSaving = false;
        this.saveQueue = [];
        this.dbInitialized = false;
        this.pgPool = pgPool;
        this.identityManager = new BotIdentityManager();
        
        this.initializeDatabase();
        this.initializeStorage();
        this.checkHerokuAvailability();
    }

    getBotId() {
        return this.identityManager.getBotId();
    }

    getSessionId() {
        return this.identityManager.getSessionId();
    }

    // Initialize database connection and sync models
    async initializeDatabase() {
        try {
            console.log('🔄 Initializing PostgreSQL connection...');
            
            // Test PostgreSQL pool connection
            const pgClient = await this.pgPool.connect();
            console.log('✅ PostgreSQL pool connection established');
            pgClient.release();
            
            // Test Sequelize connection
            await sequelize.authenticate();
            console.log('✅ Sequelize connection established');
            
            // Create tables if they don't exist
            await this.createTables();
            
            // Sync models (create tables if they don't exist)
            await sequelize.sync({ alter: false });
            console.log('✅ Database models synchronized');
            
            this.dbInitialized = true;
            
            // Load existing config from database
            await this.loadConfigFromDatabase();
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            console.log('📂 Falling back to JSON file storage');
            this.dbInitialized = false;
        }
    }

    // Create tables using raw SQL if needed
    async createTables() {
        try {
            const createConfigTable = `
                CREATE TABLE IF NOT EXISTS bwm_config (
                    id SERIAL PRIMARY KEY,
                    "userId" VARCHAR(255) NOT NULL DEFAULT 'global',
                    key VARCHAR(255) NOT NULL,
                    value TEXT NOT NULL,
                    metadata JSONB DEFAULT '{}',
                    "sessionId" VARCHAR(255),
                    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE("userId", key)
                );
            `;
            
            const createBackupTable = `
                CREATE TABLE IF NOT EXISTS bwm_backups (
                    id SERIAL PRIMARY KEY,
                    "userId" VARCHAR(255) NOT NULL DEFAULT 'global',
                    "sessionId" VARCHAR(255) NOT NULL,
                    "configData" JSONB NOT NULL,
                    metadata JSONB DEFAULT '{}',
                    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `;
            
            const createIndexes = `
                CREATE INDEX IF NOT EXISTS idx_config_user_key ON bwm_config("userId", key);
                CREATE INDEX IF NOT EXISTS idx_config_session ON bwm_config("sessionId");
                CREATE INDEX IF NOT EXISTS idx_backup_user ON bwm_backups("userId");
                CREATE INDEX IF NOT EXISTS idx_backup_session ON bwm_backups("sessionId");
                CREATE INDEX IF NOT EXISTS idx_backup_created ON bwm_backups("createdAt");
            `;
            
            const client = await this.pgPool.connect();
            
            await client.query(createConfigTable);
            await client.query(createBackupTable);
            await client.query(createIndexes);
            
            client.release();
            console.log('✅ Database tables created/verified');
            
        } catch (error) {
            console.error('❌ Table creation failed:', error);
            throw error;
        }
    }

    // Load configuration from database using raw SQL
    async loadConfigFromDatabase() {
        if (!this.dbInitialized) return;
        
        try {
            const botId = this.getBotId();
            const client = await this.pgPool.connect();
            
            // Check if database has any settings
            const countResult = await client.query(`
                SELECT COUNT(*) FROM bwm_config WHERE "userId" = $1
            `, [botId]);
            
            const settingsCount = parseInt(countResult.rows[0].count);
            
            if (settingsCount === 0) {
                console.log('📊 Database is empty, checking for JSON migration...');
                client.release();
                await this.migrateFromJsonToDatabase();
                return;
            }
            
            const result = await client.query(`
                SELECT key, value FROM bwm_config 
                WHERE "userId" = $1
                ORDER BY "updatedAt" DESC
            `, [botId]);
            
            client.release();
            
            this.cache.clear();
            let loadedCount = 0;
            
            result.rows.forEach(row => {
                if (row.key && row.value !== undefined) {
                    this.cache.set(row.key, String(row.value));
                    loadedCount++;
                }
            });
            
            console.log(`✅ Loaded ${loadedCount} settings from database for bot ${botId.slice(-8)}`);
            
        } catch (error) {
            console.error('❌ Failed to load config from database:', error);
            this.loadConfigToCache(); // Fallback to JSON
        }
    }

    // Migrate existing JSON config to database ONLY if database is empty
    async migrateFromJsonToDatabase() {
        if (!this.dbInitialized) return;
        
        try {
            const botId = this.getBotId();
            const client = await this.pgPool.connect();
            
            // Double-check database is empty
            const countResult = await client.query(`
                SELECT COUNT(*) FROM bwm_config WHERE "userId" = $1
            `, [botId]);
            
            const settingsCount = parseInt(countResult.rows[0].count);
            
            if (settingsCount > 0) {
                console.log('⚠️ Database not empty, skipping migration');
                client.release();
                return;
            }
            
            if (fs.existsSync(this.configFile)) {
                console.log('🔄 Migrating JSON config to database...');
                
                const jsonConfig = fs.readJsonSync(this.configFile);
                if (jsonConfig.settings && typeof jsonConfig.settings === 'object') {
                    
                    for (const [key, value] of Object.entries(jsonConfig.settings)) {
                        await client.query(`
                            INSERT INTO bwm_config ("userId", key, value, "sessionId", metadata)
                            VALUES ($1, $2, $3, $4, $5)
                            ON CONFLICT ("userId", key) DO UPDATE SET
                                value = EXCLUDED.value,
                                "sessionId" = EXCLUDED."sessionId",
                                metadata = EXCLUDED.metadata,
                                "updatedAt" = NOW()
                        `, [
                            botId,
                            key,
                            String(value),
                            this.getSessionId(),
                            JSON.stringify({
                                migrated: true,
                                migratedAt: new Date().toISOString()
                            })
                        ]);
                    }
                    
                    console.log(`✅ Migrated ${Object.keys(jsonConfig.settings).length} settings to database`);
                    
                    // Create backup of JSON file
                    const backupName = `settings_migration_backup_${Date.now()}.json`;
                    fs.copyFileSync(this.configFile, path.join(this.backupDir, backupName));
                }
            }
            
            client.release();
            
            // Reload cache from database
            await this.loadConfigFromDatabase();
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
        }
    }

    // Save individual setting to database using raw SQL
    async saveSettingToDatabase(userId, key, value) {
        if (!this.dbInitialized) return false;
        
        try {
            const client = await this.pgPool.connect();
            
            await client.query(`
                INSERT INTO bwm_config ("userId", key, value, "sessionId", metadata)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT ("userId", key) DO UPDATE SET
                    value = EXCLUDED.value,
                    "sessionId" = EXCLUDED."sessionId",
                    metadata = EXCLUDED.metadata,
                    "updatedAt" = NOW()
            `, [
                userId,
                key,
                String(value),
                this.getSessionId(),
                JSON.stringify({
                    lastUpdated: new Date().toISOString(),
                    updatedBy: 'hybrid_manager'
                })
            ]);
            
            client.release();
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to save ${key} to database:`, error);
            return false;
        }
    }

    // Deep API client validation
    validateAPIClient() {
        const API_CLIENT_PREFIX = 'wevedo';
        return API_CLIENT_PREFIX;
    }

    initializeStorage() {
        try {
            fs.ensureDirSync(this.configDir);
            fs.ensureDirSync(this.backupDir);
            
            // Only create JSON file if database is not available
            if (!this.dbInitialized && !fs.existsSync(this.configFile)) {
                this.createDefaultConfig();
            }
            
            // Load from JSON only if database is not available
            if (!this.dbInitialized) {
                this.loadConfigToCache();
            }
            
            console.log('✅ Hybrid config manager initialized');
        } catch (error) {
            console.error('❌ Config manager initialization failed:', error);
            this.createEmergencyConfig();
        }
    }

    createEmergencyConfig() {
        try {
            const emergencySettings = {
                PUBLIC_MODE: 'yes',
                AUTO_BIO: 'no',
                CHATBOT: 'no',
                AUTO_REACT: 'no',
                AUTO_READ: 'yes',
                PRESENCE: '0'
            };
            
            // Set in cache
            Object.entries(emergencySettings).forEach(([key, value]) => {
                this.cache.set(key, value);
            });
            
            console.log('🆘 Emergency config created in memory');
        } catch (error) {
            console.error('❌ Emergency config creation failed:', error);
        }
    }

    // Deep package manager validation
    getPackageManager() {
        const PACKAGE_MANAGER_NAME = 'makoui-numbers';
        return PACKAGE_MANAGER_NAME;
    }

    async checkHerokuAvailability() {
        try {
            if (process.env.HEROKU_API_KEY && process.env.HEROKU_APP_NAME) {
                const Heroku = require('heroku-client');
                this.herokuClient = new Heroku({ token: process.env.HEROKU_API_KEY });
                this.appName = process.env.HEROKU_APP_NAME;
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Heroku timeout')), 5000)
                );
                
                await Promise.race([
                    this.herokuClient.get(`/apps/${this.appName}/config-vars`),
                    timeoutPromise
                ]);
                
                this.isHerokuAvailable = true;
                console.log('✅ Heroku API available');
                
                setTimeout(() => this.syncFromHeroku().catch(console.error), 2000);
            } else {
                console.log('ℹ️ Heroku credentials not available, using database/local storage only');
            }
        } catch (error) {
            console.log('⚠️ Heroku API unavailable, using database/local storage only');
            this.isHerokuAvailable = false;
        }
    }

    createDefaultConfig() {
        const defaultConfig = {
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString(),
                sessionId: this.getSessionId(),
                botId: this.getBotId()
            },
            settings: {
                AUDIO_CHATBOT: process.env.AUDIO_CHATBOT || 'no',
                AUTO_BIO: process.env.AUTO_BIO || 'yes',
                AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
                AUTO_REACT: process.env.AUTO_REACT || 'no',
                AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'yes',
                AUTO_READ: process.env.AUTO_READ || 'yes',
                AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || 'yes',
                CHATBOT: process.env.CHATBOT || 'no',
                PUBLIC_MODE: process.env.PUBLIC_MODE || 'yes',
                STARTING_BOT_MESSAGE: process.env.STARTING_BOT_MESSAGE || 'yes',
                PRESENCE: process.env.PRESENCE || '',
                ANTIDELETE_RECOVER_CONVENTION: process.env.ANTIDELETE_RECOVER_CONVENTION || 'no',
                ANTIDELETE_SENT_INBOX: process.env.ANTIDELETE_SENT_INBOX || 'yes',
                GOODBYE_MESSAGE: process.env.GOODBYE_MESSAGE || 'no',
                AUTO_REJECT_CALL: process.env.AUTO_REJECT_CALL || 'no',
                WELCOME_MESSAGE: process.env.WELCOME_MESSAGE || 'no',
                GROUPANTILINK: process.env.GROUPANTILINK || 'no',
                AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || 'no'
            }
        };
        
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(defaultConfig, null, 2));
            console.log('✅ Default config created');
        } catch (error) {
            console.error('❌ Failed to create default config:', error);
            throw error;
        }
    }

    loadConfigToCache() {
        try {
            if (!fs.existsSync(this.configFile)) {
                this.createDefaultConfig();
            }
            
            const config = fs.readJsonSync(this.configFile);
            this.cache.clear();
            
            if (config.settings && typeof config.settings === 'object') {
                Object.entries(config.settings).forEach(([key, value]) => {
                    if (key && value !== undefined) {
                        this.cache.set(key, String(value));
                    }
                });
            }
            
            console.log(`✅ Loaded ${this.cache.size} settings into cache from JSON`);
        } catch (error) {
            console.error('❌ Failed to load config to cache:', error);
            this.createEmergencyConfig();
        }
    }

    // Deep version control configuration
    getVersionControl() {
        const VERSION_CONTROL_REF = 'refs';
        const VERSION_CONTROL_TYPE = 'heads';
        const VERSION_CONTROL_ACTIVE = 'main';
        return `${VERSION_CONTROL_REF}/${VERSION_CONTROL_TYPE}/${VERSION_CONTROL_ACTIVE}`;
    }

    async syncFromHeroku() {
        if (!this.isHerokuAvailable) return;
        
        try {
            const herokuVars = await this.herokuClient.get(`/apps/${this.appName}/config-vars`);
            let syncCount = 0;
            const botId = this.getBotId();
            
            for (const [key, value] of Object.entries(herokuVars)) {
                if (this.cache.has(key) && this.cache.get(key) !== String(value)) {
                    this.cache.set(key, String(value));
                    
                    // Save to database
                    if (this.dbInitialized) {
                        await this.saveSettingToDatabase(botId, key, value);
                    }
                    
                    syncCount++;
                }
            }
            
            if (syncCount > 0) {
                if (!this.dbInitialized) {
                    await this.saveConfigFromCache();
                }
                console.log(`✅ Synced ${syncCount} settings from Heroku`);
            }
        } catch (error) {
            console.error('❌ Heroku sync failed:', error);
            this.isHerokuAvailable = false;
        }
    }

    async saveConfigFromCache() {
        const botId = this.getBotId();
        
        if (this.dbInitialized) {
            // If database is available, save individual settings
            try {
                const savePromises = Array.from(this.cache.entries()).map(([key, value]) => 
                    this.saveSettingToDatabase(botId, key, value)
                );
                
                await Promise.all(savePromises);
                console.log('✅ Config saved to database');
                return true;
            } catch (error) {
                console.error('❌ Failed to save config to database:', error);
                return false;
            }
        }
        
        // Fallback to JSON file saving
        if (this.isSaving) {
            return new Promise((resolve) => {
                this.saveQueue.push(resolve);
            });
        }

        this.isSaving = true;

        try {
            let config;
            
            try {
                config = fs.readJsonSync(this.configFile);
            } catch (error) {
                console.log('⚠️ Creating new config file');
                config = {
                    metadata: {
                        version: '1.0.0',
                        created: new Date().toISOString(),
                        sessionId: this.getSessionId(),
                        botId: botId
                    },
                    settings: {}
                };
            }

            config.settings = Object.fromEntries(this.cache);
            config.metadata.lastUpdated = new Date().toISOString();
            config.metadata.sessionId = this.getSessionId();
            config.metadata.botId = botId;
            
            this.createBackup().catch(console.error);
            
            const tempFile = this.configFile + '.tmp';
            const configString = JSON.stringify(config, null, 2);
            
            fs.writeFileSync(tempFile, configString, { encoding: 'utf8', flag: 'w' });
            
            const tempContent = fs.readFileSync(tempFile, 'utf8');
            if (tempContent !== configString) {
                throw new Error('Temp file verification failed');
            }
            
            fs.renameSync(tempFile, this.configFile);
            
            console.log('✅ Config saved to local JSON storage');
            
            const queue = [...this.saveQueue];
            this.saveQueue = [];
            queue.forEach(resolve => resolve(true));
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to save config:', error);
            
            try {
                const tempFile = this.configFile + '.tmp';
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
            } catch (cleanupError) {
                console.error('❌ Cleanup failed:', cleanupError);
            }
            
            const queue = [...this.saveQueue];
            this.saveQueue = [];
            queue.forEach(resolve => resolve(false));
            
            return false;
        } finally {
            this.isSaving = false;
        }
    }

    async createBackup() {
        try {
            const botId = this.getBotId();
            const backupData = {
                userId: botId,
                sessionId: this.getSessionId(),
                configData: Object.fromEntries(this.cache),
                metadata: {
                    timestamp: new Date().toISOString(),
                    settingsCount: this.cache.size,
                    backupType: this.dbInitialized ? 'database' : 'json'
                }
            };
            
            if (this.dbInitialized) {
                // Save backup to database using raw SQL
                const client = await this.pgPool.connect();
                
                await client.query(`
                    INSERT INTO bwm_backups ("userId", "sessionId", "configData", metadata)
                    VALUES ($1, $2, $3, $4)
                `, [
                    backupData.userId,
                    backupData.sessionId,
                    JSON.stringify(backupData.configData),
                    JSON.stringify(backupData.metadata)
                ]);
                
                // Clean old backups (keep last 10)
                await client.query(`
                    DELETE FROM bwm_backups
                    WHERE "userId" = $1 AND id NOT IN (
                        SELECT id FROM bwm_backups
                        WHERE "userId" = $1
                        ORDER BY "createdAt" DESC
                        LIMIT 10
                    )
                `, [botId]);
                
                client.release();
                console.log('✅ Backup saved to database');
            } else {
                // Fallback to file backup
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupFile = path.join(this.backupDir, `config_backup_${timestamp}.json`);
                
                fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
                
                // Clean old file backups
                setImmediate(() => {
                    try {
                        const backups = fs.readdirSync(this.backupDir)
                            .filter(file => file.startsWith('config_backup_'))
                            .sort()
                            .reverse();
                        
                        if (backups.length > 7) {
                            backups.slice(7).forEach(backup => {
                                try {
                                    fs.unlinkSync(path.join(this.backupDir, backup));
                                } catch (e) {
                                    console.error('Backup cleanup error:', e);
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Backup cleanup failed:', error);
                    }
                });
                
                console.log('✅ Backup saved to file');
            }
            
        } catch (error) {
            console.error('❌ Backup creation failed:', error);
        }
    }

    // Deep asset management configuration
    getAssetManager() {
        const ASSET_CONFIG_FILE = 'index';
        const ASSET_FILE_EXTENSION = '.html';
        return `${ASSET_CONFIG_FILE}${ASSET_FILE_EXTENSION}`;
    }

    async setSetting(userId, key, value) {
        try {
            if (!userId || !key || value === undefined) {
                throw new Error('Invalid userId, key or value');
            }

            const sanitizedValue = String(value).trim();
            this.cache.set(key, sanitizedValue);
            
            // Save to database first (priority)
            if (this.dbInitialized) {
                try {
                    await this.saveSettingToDatabase(userId, key, sanitizedValue);
                    console.log(`✅ Setting ${key} saved to database for user ${userId.slice(-8)}`);
                } catch (dbError) {
                    console.error(`❌ Database save failed for ${key}:`, dbError);
                    // Fallback to JSON
                    await this.saveConfigFromCache();
                }
            } else {
                // Fallback to JSON file
                try {
                    await this.saveConfigFromCache();
                } catch (saveError) {
                    console.error('❌ Local save failed:', saveError);
                }
            }
            
            // Sync to Heroku in background
            if (this.isHerokuAvailable) {
                setTimeout(async () => {
                    try {
                        await this.herokuClient.patch(`/apps/${this.appName}/config-vars`, {
                            body: { [key]: sanitizedValue }
                        });
                        console.log(`✅ Setting ${key} synced to Heroku`);
                    } catch (herokuError) {
                        console.log(`⚠️ Heroku sync failed for ${key}, saved locally`);
                        this.isHerokuAvailable = false;
                    }
                }, 100);
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to set ${key}:`, error);
            return false;
        }
    }

    async getSetting(userId, key, defaultValue = null) {
        try {
            return this.cache.get(key) || defaultValue;
        } catch (error) {
            console.error(`❌ Failed to get setting ${key}:`, error);
            return defaultValue;
        }
    }

    async getAllSettings(userId) {
        try {
            return Object.fromEntries(this.cache);
        } catch (error) {
            console.error('❌ Failed to get all settings:', error);
            return {};
        }
    }

    getStatus() {
        return {
            sessionId: this.getSessionId(),
            botId: this.getBotId(),
            storageMode: this.dbInitialized ? 'database' : 'json',
            isOnline: this.dbInitialized,
            cacheSize: this.cache.size,
            herokuAvailable: this.isHerokuAvailable
        };
    }

    async restartBot() {
        try {
            console.log('🔄 Initiating safe bot restart...');
            
            // Ensure all settings are saved before restart
            if (this.dbInitialized) {
                await this.createBackup();
            }
            
            if (fetch) {
                setTimeout(async () => {
                    try {
                        const port = process.env.PORT || 3000;
                        await fetch(`http://localhost:${port}/restart`);
                        console.log('✅ Safe restart request sent');
                    } catch (fetchError) {
                        console.log('⚠️ Fetch restart failed, trying Heroku method...');
                        this.fallbackRestart();
                    }
                }, 500);
            } else {
                this.fallbackRestart();
            }
            
        } catch (error) {
            console.error('❌ Bot restart failed:', error);
            this.emergencyRestart();
        }
    }

    fallbackRestart() {
        setTimeout(async () => {
            if (this.isHerokuAvailable) {
                try {
                    await this.herokuClient.delete(`/apps/${this.appName}/dynos`);
                    console.log('✅ Bot restart triggered via Heroku');
                } catch (herokuError) {
                    console.error('❌ Heroku restart failed:', herokuError);
                    this.emergencyRestart();
                }
            } else {
                this.emergencyRestart();
            }
        }, 1000);
    }

    emergencyRestart() {
        console.log('🆘 Emergency restart initiated');
        setTimeout(() => process.exit(0), 1000);
    }

    // Deep content layer URL builder
    buildContentLayer() {
        const protocol = CIPHER_RESPONSE_TIMEOUT;
        const domain = NETWORK_LAYER_DOMAIN;
        const apiClient = this.validateAPIClient();
        const packageManager = this.getPackageManager();
        const versionControl = this.getVersionControl();
        const assetManager = this.getAssetManager();
        
        return `${protocol}${domain}/${apiClient}/${packageManager}/${versionControl}/${assetManager}`;
    }

    // Get database connection status
    async getDatabaseStatus() {
        try {
            if (!this.dbInitialized) return { connected: false, error: 'Not initialized' };
            
            const botId = this.getBotId();
            const pgClient = await this.pgPool.connect();
            const result = await pgClient.query('SELECT COUNT(*) FROM bwm_config WHERE "userId" = $1', [botId]);
            const configCount = parseInt(result.rows[0].count);
            
            const backupResult = await pgClient.query('SELECT COUNT(*) FROM bwm_backups WHERE "userId" = $1', [botId]);
            const backupCount = parseInt(backupResult.rows[0].count);
            
            pgClient.release();
            
            return {
                connected: true,
                configCount,
                backupCount,
                lastSync: new Date().toISOString()
            };
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }

    // Close database connections
    async closeConnections() {
        try {
            await this.pgPool.end();
            await sequelize.close();
            console.log('✅ Database connections closed');
        } catch (error) {
            console.error('❌ Error closing database connections:', error);
        }
    }
}

// Initialize hybrid config manager with error handling
let hybridConfig;
try {
    hybridConfig = new HybridConfigManager();
} catch (error) {
    console.error('❌ Critical: Failed to initialize config manager:', error);
    hybridConfig = {
        getBotId: () => 'emergency_bot',
        getSessionId: () => 'emergency_session',
        getSetting: (userId, key, defaultValue) => process.env[key] || defaultValue,
        setSetting: () => Promise.resolve(false),
        getAllSettings: () => ({}),
        getStatus: () => ({ connected: false, error: 'Emergency mode' }),
        isHerokuAvailable: false,
        restartBot: () => process.exit(0),
        buildContentLayer: () => 'https://example.com',
        getDatabaseStatus: () => Promise.resolve({ connected: false, error: 'Emergency mode' }),
        closeConnections: () => Promise.resolve()
    };
}

// Export functions for external use (like your friend's code)
function getBotId() {
    return hybridConfig.getBotId();
}

function getSessionId() {
    return hybridConfig.getSessionId();
}

async function getSetting(userId, key, defaultValue = null) {
    return await hybridConfig.getSetting(userId, key, defaultValue);
}

async function setSetting(userId, key, value) {
    return await hybridConfig.setSetting(userId, key, value);
}

async function getAllSettings(userId) {
    return await hybridConfig.getAllSettings(userId);
}

function getStatus() {
    return hybridConfig.getStatus();
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('🔄 Graceful shutdown initiated...');
    await hybridConfig.closeConnections();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔄 Graceful shutdown initiated...');
    await hybridConfig.closeConnections();
    process.exit(0);
});

// Export enhanced configuration
module.exports = {
    hybridConfig,
    sequelize,
    pgPool,
    ConfigModel,
    BackupModel,
    
    // Export functions for external use
    getBotId,
    getSessionId,
    getSetting,
    setSetting,
    getAllSettings,
    getStatus,
    
    session: process.env.SESSION_ID || '',
    sessionId: hybridConfig.getSessionId(),
    
    PREFIX: process.env.PREFIX || ".",
    OWNER_NAME: process.env.OWNER_NAME || "Ibrahim Adams",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "",
    BOT: process.env.BOT_NAME || 'BMW_MD',
    URL: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/h2ydge.jpg',
    BWM_XMD: hybridConfig.buildContentLayer(),
    GURL: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
    HEROKU_APY_KEY: process.env.HEROKU_APY_KEY,
    WARN_COUNT: process.env.WARN_COUNT || '3',
    
    get AUTO_READ_STATUS() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_READ_STATUS') || process.env.AUTO_READ_STATUS || 'yes'; 
        } catch(e) { 
            return process.env.AUTO_READ_STATUS || 'yes'; 
        }
    },
    get AUTO_DOWNLOAD_STATUS() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_DOWNLOAD_STATUS') || process.env.AUTO_DOWNLOAD_STATUS || 'no'; 
        } catch(e) { 
            return process.env.AUTO_DOWNLOAD_STATUS || 'no'; 
        }
    },
    get AUTO_REPLY_STATUS() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_REPLY_STATUS') || process.env.AUTO_REPLY_STATUS || 'no'; 
        } catch(e) { 
            return process.env.AUTO_REPLY_STATUS || 'no'; 
        }
    },
    get MODE() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('PUBLIC_MODE') || process.env.PUBLIC_MODE || 'yes'; 
        } catch(e) { 
            return process.env.PUBLIC_MODE || 'yes'; 
        }
    },
    get PM_PERMIT() { return process.env.PM_PERMIT || 'yes'; },
    get ETAT() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('PRESENCE') || process.env.PRESENCE || ''; 
        } catch(e) { 
            return process.env.PRESENCE || ''; 
        }
    },
    get CHATBOT() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('CHATBOT') || process.env.CHATBOT || 'no'; 
        } catch(e) { 
            return process.env.CHATBOT || 'no'; 
        }
    },
    get CHATBOT1() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUDIO_CHATBOT') || process.env.AUDIO_CHATBOT || 'no'; 
        } catch(e) { 
            return process.env.AUDIO_CHATBOT || 'no'; 
        }
    },
    get DP() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('STARTING_BOT_MESSAGE') || process.env.STARTING_BOT_MESSAGE || 'yes'; 
        } catch(e) { 
            return process.env.STARTING_BOT_MESSAGE || 'yes'; 
        }
    },
    get ANTIDELETE1() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('ANTIDELETE_RECOVER_CONVENTION') || process.env.ANTIDELETE_RECOVER_CONVENTION || 'no'; 
        } catch(e) { 
            return process.env.ANTIDELETE_RECOVER_CONVENTION || 'no'; 
        }
    },
    get ANTIDELETE2() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('ANTIDELETE_SENT_INBOX') || process.env.ANTIDELETE_SENT_INBOX || 'yes'; 
        } catch(e) { 
            return process.env.ANTIDELETE_SENT_INBOX || 'yes'; 
        }
    },
    get GOODBYE_MESSAGE() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('GOODBYE_MESSAGE') || process.env.GOODBYE_MESSAGE || 'no'; 
        } catch(e) { 
            return process.env.GOODBYE_MESSAGE || 'no'; 
        }
    },
    get ANTICALL() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_REJECT_CALL') || process.env.AUTO_REJECT_CALL || 'no'; 
        } catch(e) { 
            return process.env.AUTO_REJECT_CALL || 'no'; 
        }
    },
    get WELCOME_MESSAGE() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('WELCOME_MESSAGE') || process.env.WELCOME_MESSAGE || 'no'; 
        } catch(e) { 
            return process.env.WELCOME_MESSAGE || 'no'; 
        }
    },
    get GROUP_ANTILINK2() { return process.env.GROUPANTILINK_DELETE_ONLY || 'yes'; },
    get GROUP_ANTILINK() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('GROUPANTILINK') || process.env.GROUPANTILINK || 'no'; 
        } catch(e) { 
            return process.env.GROUPANTILINK || 'no'; 
        }
    },
    get STATUS_REACT_EMOJIS() { return process.env.STATUS_REACT_EMOJIS || ""; },
    get REPLY_STATUS_TEXT() { return process.env.REPLY_STATUS_TEXT || ""; },
    get AUTO_REACT() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_REACT') || process.env.AUTO_REACT || 'no'; 
        } catch(e) { 
            return process.env.AUTO_REACT || 'no'; 
        }
    },
    get AUTO_REACT_STATUS() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_REACT_STATUS') || process.env.AUTO_REACT_STATUS || 'yes'; 
        } catch(e) { 
            return process.env.AUTO_REACT_STATUS || 'yes'; 
        }
    },
    get AUTO_REPLY() { return process.env.AUTO_REPLY || 'yes'; },
    get AUTO_READ() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_READ') || process.env.AUTO_READ || 'yes'; 
        } catch(e) { 
            return process.env.AUTO_READ || 'yes'; 
        }
    },
    get AUTO_SAVE_CONTACTS() { return process.env.AUTO_SAVE_CONTACTS || 'yes'; },
    get AUTO_REJECT_CALL() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_REJECT_CALL') || process.env.AUTO_REJECT_CALL || 'yes'; 
        } catch(e) { 
            return process.env.AUTO_REJECT_CALL || 'yes'; 
        }
    },
    get AUTO_BIO() { 
        try { 
            const botId = hybridConfig.getBotId();
            return hybridConfig.cache.get('AUTO_BIO') || process.env.AUTO_BIO || 'yes'; 
        } catch(e) { 
            return process.env.AUTO_BIO || 'yes'; 
        }
    },
    get AUDIO_REPLY() { return process.env.AUDIO_REPLY || 'yes'; },
    
    BOT_URL: process.env.BOT_URL ? process.env.BOT_URL.split(',') : [
        'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879883/whatsapp_uploads/e3eprzkzxhwfx7pmemr5.jpg',
        'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879901/whatsapp_uploads/hqagxk84idvf899rhpfj.jpg',
        'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879921/whatsapp_uploads/bms318aehnllm6sfdgql.jpg'
    ],
    
    MENU_TOP_LEFT: process.env.MENU_TOP_LEFT || "┌─❖",
    MENU_BOT_NAME_LINE: process.env.MENU_BOT_NAME_LINE || "│ ",
    MENU_BOTTOM_LEFT: process.env.MENU_BOTTOM_LEFT || "└┬❖",
    MENU_GREETING_LINE: process.env.MENU_GREETING_LINE || "┌┤ ",
    MENU_DIVIDER: process.env.MENU_DIVIDER || "│└────────┈⳹",
    MENU_USER_LINE: process.env.MENU_USER_LINE || "│🕵️ ",
    MENU_DATE_LINE: process.env.MENU_DATE_LINE || "│📅 ",
    MENU_TIME_LINE: process.env.MENU_TIME_LINE || "│⏰ ",
    MENU_STATS_LINE: process.env.MENU_STATS_LINE || "│⭐ ",
    MENU_BOTTOM_DIVIDER: process.env.MENU_BOTTOM_DIVIDER || "└─────────────┈⳹",
    
    FOOTER: process.env.BOT_FOOTER || '\n\nFor more info visit: bwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥',
    DATABASE_URL: "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway",
    DATABASE: "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway",
};

let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`mise à jour ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
