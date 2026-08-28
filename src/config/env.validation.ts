const REQUIRED_ENV = ['DATABASE_URL'] as const;

export function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variaveis de ambiente obrigatorias ausentes: ${missing.join(', ')}`);
  }

  const port = process.env.PORT;
  if (port && (!Number.isInteger(Number(port)) || Number(port) <= 0)) {
    throw new Error('PORT deve ser um numero inteiro positivo.');
  }

  try {
    const databaseUrl = new URL(process.env.DATABASE_URL as string);
    if (databaseUrl.protocol !== 'postgresql:' && databaseUrl.protocol !== 'postgres:') {
      throw new Error();
    }
  } catch {
    throw new Error('DATABASE_URL deve ser uma URL PostgreSQL valida.');
  }
}
