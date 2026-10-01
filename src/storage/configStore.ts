import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { UserConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ENV } from '../config/env';

export interface StoredConfigRecord {
  uuid: string;
  passwordHash: string;
  config: UserConfig;
  createdAt: string;
  updatedAt: string;
}

export interface SaveConfigResult {
  success: boolean;
  error?: string;
}

export interface AuthConfigResult {
  success: boolean;
  config?: UserConfig;
  error?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(str: string): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str.trim());
}

function getDataDirectory(): string {
  const custom = (process.env.DATA_DIR || ENV.DATA_DIR || '').trim();
  if (custom) return custom;

  // On read-only filesystems (e.g. Render), fall back to /tmp which is always writable.
  // Locally, use the project-relative 'data' directory.
  const projectRelative = path.join(__dirname, '..', '..', 'data');
  try {
    fs.mkdirSync(projectRelative, { recursive: true });
    return projectRelative;
  } catch {
    return path.join(require('os').tmpdir(), 'aiosubs-data');
  }
}

function getStoreFilePath(): string {
  return path.join(getDataDirectory(), 'configurations.json');
}

function makeDualResult<T extends object>(syncVal: T, promiseVal: Promise<T>): T & Promise<T> {
  const target = promiseVal as T & Promise<T>;
  Object.assign(target, syncVal);
  return target;
}

class ConfigStorage {
  private cache: Map<string, StoredConfigRecord> = new Map();
  private pool: Pool | null = null;
  private useDatabase = false;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const dbUrl = (process.env.DATABASE_URL || ENV.DATABASE_URL || '').trim();

      if (dbUrl) {
        try {
          console.log('[DB] A inicializar pool de conexões com PostgreSQL...');
          Logger.info('Initializing PostgreSQL connection pool...');
          const isLocal = /localhost|127\.0\.0\.1/i.test(dbUrl);
          const ssl = isLocal || dbUrl.includes('sslmode=disable')
            ? false
            : { rejectUnauthorized: false };

          const pool = new Pool({
            connectionString: dbUrl,
            ssl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          });

          pool.on('error', (err) => {
            console.error('[DB] Erro inesperado no cliente de conexão PostgreSQL:', err);
          });

          // Test connection and ensure table exists
          const client = await pool.connect();
          try {
            await client.query(`
              CREATE TABLE IF NOT EXISTS configurations (
                uuid VARCHAR(64) PRIMARY KEY,
                password_hash TEXT NOT NULL,
                config_data JSONB NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
              );
              CREATE INDEX IF NOT EXISTS idx_configurations_updated_at ON configurations(updated_at);
            `);
          } finally {
            client.release();
          }

          this.pool = pool;
          this.useDatabase = true;
          console.log('[DB] Conexão com PostgreSQL estabelecida com sucesso. Tabela "configurations" pronta.');
          Logger.info('Persistent PostgreSQL database connected and table "configurations" ready.');

          await this.warmupFromDatabase();
          await this.migrateLocalFileToDatabase();

          this.initialized = true;
          return;
        } catch (err: any) {
          console.error('[DB] Erro ao conectar ao PostgreSQL via DATABASE_URL:', err?.message || err);
          Logger.error('Failed to connect to PostgreSQL at DATABASE_URL. Falling back to local filesystem storage.', err);
          this.useDatabase = false;
          if (this.pool) {
            try { await this.pool.end(); } catch {}
            this.pool = null;
          }
        }
      }

      this.useDatabase = false;
      this.loadFromLocalFile();
      this.initialized = true;
      Logger.info('ConfigStorage running with local filesystem storage fallback.');
    })();

    return this.initPromise;
  }

  private ensureInitializedSync(): void {
    if (this.initialized) return;
    this.loadFromLocalFile();
    this.initialized = true;

    const dbUrl = (process.env.DATABASE_URL || ENV.DATABASE_URL || '').trim();
    if (dbUrl && !this.initPromise) {
      this.initialize().catch(err => {
        Logger.error('Background DB initialization failed:', err);
      });
    }
  }

  private async warmupFromDatabase(): Promise<void> {
    if (!this.pool) return;
    try {
      const res = await this.pool.query(
        'SELECT uuid, password_hash, config_data, created_at, updated_at FROM configurations'
      );
      for (const row of res.rows) {
        const configObj: UserConfig = typeof row.config_data === 'string'
          ? JSON.parse(row.config_data)
          : row.config_data;
        const cleanUuid = String(row.uuid).toLowerCase();
        this.cache.set(cleanUuid, {
          uuid: cleanUuid,
          passwordHash: row.password_hash,
          config: configObj,
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString()
        });
      }
      Logger.info(`Preloaded ${res.rowCount || 0} configuration(s) from PostgreSQL into memory cache.`);
    } catch (err) {
      Logger.error('Failed to warmup cache from database', err);
    }
  }

  private async migrateLocalFileToDatabase(): Promise<void> {
    if (!this.pool) return;
    try {
      const storeFile = getStoreFilePath();
      if (!fs.existsSync(storeFile)) return;

      const raw = fs.readFileSync(storeFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      let migratedCount = 0;
      for (const v of Object.values(parsed)) {
        const rec = v as StoredConfigRecord;
        if (!rec || !rec.uuid || !rec.passwordHash || !rec.config) continue;

        const cleanUuid = rec.uuid.trim().toLowerCase();
        const existing = await this.pool.query(
          'SELECT uuid FROM configurations WHERE LOWER(uuid) = $1',
          [cleanUuid]
        );
        if (existing.rowCount === 0) {
          await this.pool.query(
            `INSERT INTO configurations (uuid, password_hash, config_data, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (uuid) DO NOTHING`,
            [
              cleanUuid,
              rec.passwordHash,
              JSON.stringify(rec.config),
              rec.createdAt || new Date().toISOString(),
              rec.updatedAt || new Date().toISOString()
            ]
          );
          this.cache.set(cleanUuid, rec);
          migratedCount++;
        }
      }
      if (migratedCount > 0) {
        Logger.info(`Migrated ${migratedCount} local configuration(s) to PostgreSQL database.`);
      }
    } catch (err) {
      Logger.error('Local file migration to PostgreSQL encountered an error', err);
    }
  }

  private loadFromLocalFile(): void {
    try {
      const dataDir = getDataDirectory();
      const storeFile = getStoreFilePath();

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(storeFile)) {
        const raw = fs.readFileSync(storeFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          for (const [k, v] of Object.entries(parsed)) {
            this.cache.set(k.toLowerCase(), v as StoredConfigRecord);
          }
        }
      }
    } catch (err) {
      Logger.error('Failed to load configurations from store file', err);
    }
  }

  private persistLocalFile(): void {
    try {
      const dataDir = getDataDirectory();
      const storeFile = getStoreFilePath();

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const obj: Record<string, StoredConfigRecord> = {};
      for (const [k, v] of this.cache.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(storeFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      Logger.error('Failed to persist configurations to file', err);
    }
  }

  public getConfigByUuid(uuid: string): UserConfig | null {
    this.ensureInitializedSync();
    const cleanUuid = uuid.trim().toLowerCase();
    const record = this.cache.get(cleanUuid);
    return record ? record.config : null;
  }

  public async getConfigByUuidAsync(uuid: string): Promise<UserConfig | null> {
    await this.initialize();
    const cleanUuid = uuid.trim().toLowerCase();
    const cached = this.cache.get(cleanUuid);
    if (cached) return cached.config;

    if (this.useDatabase && this.pool) {
      try {
        console.log("[DB] A consultar dados para o UUID:", cleanUuid);
        const res = await this.pool.query(
          'SELECT uuid, password_hash, config_data, created_at, updated_at FROM configurations WHERE LOWER(uuid) = $1',
          [cleanUuid]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const record: StoredConfigRecord = {
            uuid: cleanUuid,
            passwordHash: row.password_hash,
            config: typeof row.config_data === 'string' ? JSON.parse(row.config_data) : row.config_data,
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString()
          };
          this.cache.set(cleanUuid, record);
          console.log("[DB] Resultado da consulta: SUCESSO (Encontrado no PostgreSQL)");
          return record.config;
        } else {
          console.log("[DB] Resultado da consulta: NÃO ENCONTRADO");
        }
      } catch (err: any) {
        console.error(`[DB] Erro ao consultar UUID ${cleanUuid} no PostgreSQL:`, err?.message || err);
        Logger.error(`Failed to fetch configuration for UUID ${cleanUuid} from database`, err);
      }
    }

    return null;
  }

  public async saveConfigAsync(
    uuid: string,
    passwordPlain: string,
    config: UserConfig
  ): Promise<SaveConfigResult> {
    await this.initialize();

    const cleanUuid = uuid.trim().toLowerCase();
    console.log("[DB] A guardar dados para o UUID:", cleanUuid);

    if (!isUuid(cleanUuid)) {
      console.log("[DB] Resultado da gravação: ERRO (Formato de UUID inválido)");
      return { success: false, error: 'Formato de UUID inválido.' };
    }

    if (!passwordPlain || passwordPlain.trim() === '') {
      console.log("[DB] Resultado da gravação: ERRO (Senha ausente)");
      return { success: false, error: 'A senha é obrigatória para salvar a configuração.' };
    }

    let existing = this.cache.get(cleanUuid);

    if (!existing && this.useDatabase && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT uuid, password_hash, config_data, created_at, updated_at FROM configurations WHERE LOWER(uuid) = $1',
          [cleanUuid]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          existing = {
            uuid: cleanUuid,
            passwordHash: row.password_hash,
            config: typeof row.config_data === 'string' ? JSON.parse(row.config_data) : row.config_data,
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString()
          };
          this.cache.set(cleanUuid, existing);
        }
      } catch (err: any) {
        console.error('[DB] Erro ao consultar existência no PostgreSQL:', err?.message || err);
        Logger.error('Failed to query existing configuration in database', err);
      }
    }

    if (existing) {
      const match = bcrypt.compareSync(passwordPlain, existing.passwordHash);
      if (!match) {
        console.log("[DB] Resultado da gravação: ERRO (UUID ou senha inválidos)");
        return { success: false, error: 'UUID ou senha inválidos.' };
      }

      existing.config = config;
      existing.updatedAt = new Date().toISOString();
      this.cache.set(cleanUuid, existing);

      if (this.useDatabase && this.pool) {
        try {
          await this.pool.query(
            `UPDATE configurations
             SET config_data = $1, updated_at = NOW()
             WHERE LOWER(uuid) = $2`,
            [JSON.stringify(config), cleanUuid]
          );
          console.log("[DB] Resultado da gravação: SUCESSO (UPDATE no PostgreSQL)");
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.error(`[DB] Erro ao atualizar no PostgreSQL para UUID ${cleanUuid}:`, errMsg);
          console.log("[DB] Resultado da gravação: ERRO (Database write failed)");
          Logger.error(`Failed to update configuration in PostgreSQL for UUID: ${cleanUuid}`, err);
          return { success: false, error: `Database write failed: ${errMsg}` };
        }
      } else {
        this.persistLocalFile();
        console.log("[DB] Resultado da gravação: SUCESSO (Arquivo local persistido)");
      }

      Logger.info(`Updated configuration for UUID: ${cleanUuid}`);
      return { success: true };
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(passwordPlain, salt);
    const now = new Date().toISOString();

    const newRecord: StoredConfigRecord = {
      uuid: cleanUuid,
      passwordHash,
      config,
      createdAt: now,
      updatedAt: now
    };

    this.cache.set(cleanUuid, newRecord);

    if (this.useDatabase && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO configurations (uuid, password_hash, config_data, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [cleanUuid, passwordHash, JSON.stringify(config)]
        );
        console.log("[DB] Resultado da gravação: SUCESSO (INSERT no PostgreSQL)");
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error(`[DB] Erro ao inserir no PostgreSQL para UUID ${cleanUuid}:`, errMsg);
        console.log("[DB] Resultado da gravação: ERRO (Database write failed)");
        Logger.error(`Failed to insert configuration into PostgreSQL for UUID: ${cleanUuid}`, err);
        return { success: false, error: `Database write failed: ${errMsg}` };
      }
    } else {
      this.persistLocalFile();
      console.log("[DB] Resultado da gravação: SUCESSO (Arquivo local criado)");
    }

    Logger.info(`Created new configuration for UUID: ${cleanUuid}`);
    return { success: true };
  }

  public saveConfig(
    uuid: string,
    passwordPlain: string,
    config: UserConfig
  ): SaveConfigResult & Promise<SaveConfigResult> {
    const cleanUuid = uuid.trim().toLowerCase();
    let syncResult: SaveConfigResult;

    if (!isUuid(cleanUuid)) {
      syncResult = { success: false, error: 'Formato de UUID inválido.' };
    } else if (!passwordPlain || passwordPlain.trim() === '') {
      syncResult = { success: false, error: 'A senha é obrigatória para salvar a configuração.' };
    } else {
      this.ensureInitializedSync();
      const existing = this.cache.get(cleanUuid);
      if (existing) {
        const match = bcrypt.compareSync(passwordPlain, existing.passwordHash);
        if (!match) {
          syncResult = { success: false, error: 'UUID ou senha inválidos.' };
        } else {
          existing.config = config;
          existing.updatedAt = new Date().toISOString();
          this.cache.set(cleanUuid, existing);
          if (!this.useDatabase) {
            this.persistLocalFile();
          }
          syncResult = { success: true };
        }
      } else {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(passwordPlain, salt);
        const now = new Date().toISOString();
        const newRecord: StoredConfigRecord = {
          uuid: cleanUuid,
          passwordHash,
          config,
          createdAt: now,
          updatedAt: now
        };
        this.cache.set(cleanUuid, newRecord);
        if (!this.useDatabase) {
          this.persistLocalFile();
        }
        syncResult = { success: true };
      }
    }

    const promise = this.saveConfigAsync(uuid, passwordPlain, config);
    return makeDualResult(syncResult, promise);
  }

  public async authenticateAndGetConfigAsync(
    uuid: string,
    passwordPlain: string
  ): Promise<AuthConfigResult> {
    await this.initialize();

    const cleanUuid = uuid.trim().toLowerCase();
    console.log("[DB] A autenticar dados para o UUID:", cleanUuid);

    if (!isUuid(cleanUuid) || !passwordPlain) {
      console.log("[DB] Resultado da autenticação: ERRO (UUID ou senha em branco)");
      return { success: false, error: 'UUID ou senha inválidos.' };
    }

    let existing = this.cache.get(cleanUuid);

    if (!existing && this.useDatabase && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT uuid, password_hash, config_data, created_at, updated_at FROM configurations WHERE LOWER(uuid) = $1',
          [cleanUuid]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          existing = {
            uuid: cleanUuid,
            passwordHash: row.password_hash,
            config: typeof row.config_data === 'string' ? JSON.parse(row.config_data) : row.config_data,
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString()
          };
          this.cache.set(cleanUuid, existing);
        }
      } catch (err) {
        console.error('[DB] Erro ao consultar banco durante autenticação:', err);
        Logger.error('Failed to query configuration from database during authentication', err);
      }
    }

    if (!existing) {
      console.log("[DB] Resultado da autenticação: ERRO (UUID não encontrado)");
      return { success: false, error: 'UUID ou senha inválidos.' };
    }

    const match = bcrypt.compareSync(passwordPlain, existing.passwordHash);
    if (!match) {
      console.log("[DB] Resultado da autenticação: ERRO (Senha não confere)");
      return { success: false, error: 'UUID ou senha inválidos.' };
    }

    console.log("[DB] Resultado da autenticação: SUCESSO");
    return {
      success: true,
      config: existing.config
    };
  }

  public authenticateAndGetConfig(
    uuid: string,
    passwordPlain: string
  ): AuthConfigResult & Promise<AuthConfigResult> {
    this.ensureInitializedSync();

    const cleanUuid = uuid.trim().toLowerCase();
    let syncResult: AuthConfigResult;

    if (!isUuid(cleanUuid) || !passwordPlain) {
      syncResult = { success: false, error: 'UUID ou senha inválidos.' };
    } else {
      const existing = this.cache.get(cleanUuid);
      if (!existing) {
        syncResult = { success: false, error: 'UUID ou senha inválidos.' };
      } else {
        const match = bcrypt.compareSync(passwordPlain, existing.passwordHash);
        if (!match) {
          syncResult = { success: false, error: 'UUID ou senha inválidos.' };
        } else {
          syncResult = {
            success: true,
            config: existing.config
          };
        }
      }
    }

    const promise = this.authenticateAndGetConfigAsync(uuid, passwordPlain);
    return makeDualResult(syncResult, promise);
  }

  public async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
      } catch {}
      this.pool = null;
    }
  }

  public isUsingDatabase(): boolean {
    return this.useDatabase;
  }
}

export const configStorage = new ConfigStorage();
