import { authError } from "@/server/domains/auth/domain/auth-error";
import type {
  AuthRole,
  AuthSession,
  AuthUser,
  AuthUserWithPassword,
  CurrentAuthSession,
} from "@/server/domains/auth/domain/auth-models";
import type {
  AuthRepository,
  CreateAuthSessionInput,
  CreateAuthUserInput,
} from "@/server/domains/auth/application/auth-ports";
import {
  postgresDb,
  postgresPool,
} from "@/server/shared/db/postgres-pool";

// ===================== TYPES =====================
type AuthUserRow = {
  user_id: number;
  role_name: AuthRole;
  customer_id: number | null;
  email: string;
  password_hash: string;
  full_name: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

type AuthSessionRow = {
  session_id: string;
  user_id: number;
  session_token_hash: string;
  created_at: Date;
  expires_at: Date;
  last_used_at: Date | null;
  revoked_at: Date | null;
  user_agent: string | null;
  ip_address: string | null;
};

type CurrentAuthSessionRow = AuthUserRow & {
  session_id: string;
  session_token_hash: string;
  session_created_at: Date;
  expires_at: Date;
  last_used_at: Date | null;
  revoked_at: Date | null;
  user_agent: string | null;
  ip_address: string | null;
};

type PostgresError = Error & {
  code?: string;
  constraint?: string;
};

// ===================== HELPERS =====================
function mapUser(row: AuthUserRow): AuthUser {
  return {
    userId: row.user_id,
    roleName: row.role_name,
    customerId: row.customer_id,
    email: row.email,
    fullName: row.full_name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUserWithPassword(row: AuthUserRow): AuthUserWithPassword {
  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
  };
}

function mapSession(row: AuthSessionRow): AuthSession {
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    refreshTokenHash: row.session_token_hash,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
  };
}

function mapCurrentSession(row: CurrentAuthSessionRow): AuthSession {
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    refreshTokenHash: row.session_token_hash,
    createdAt: row.session_created_at,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
  };
}

function isUniqueEmailError(error: unknown): boolean {
  const postgresError = error as PostgresError;

  return (
    postgresError.code === "23505" &&
    postgresError.constraint === "uq_auth_users_email"
  );
}

function isUniqueSessionTokenHashError(error: unknown): boolean {
  const postgresError = error as PostgresError;

  return (
    postgresError.code === "23505" &&
    postgresError.constraint === "uq_user_sessions_token_hash"
  );
}

// ===================== SERVICES =====================
export const postgresAuthRepository: AuthRepository = {
  async createUser(input: CreateAuthUserInput): Promise<AuthUser> {
    try {
      const result = await postgresDb.query<AuthUserRow>(
        `
          insert into public.auth_users (
            email,
            password_hash,
            full_name,
            role_name
          )
          values ($1, $2, $3, $4)
          returning
            user_id,
            role_name,
            customer_id,
            email,
            password_hash,
            full_name,
            is_active,
            created_at,
            updated_at
        `,
        [input.email, input.passwordHash, input.fullName, input.roleName],
      );

      return mapUser(result.rows[0]);
    } catch (error) {
      if (isUniqueEmailError(error)) {
        throw authError.create(
          "EMAIL_ALREADY_EXISTS",
          "auth.emailAlreadyExists",
          409,
        );
      }

      throw error;
    }
  },

  async findUserByEmail(email: string): Promise<AuthUserWithPassword | null> {
    const result = await postgresDb.query<AuthUserRow>(
      `
        select
          user_id,
          role_name,
          customer_id,
          email,
          password_hash,
          full_name,
          is_active,
          created_at,
          updated_at
        from public.auth_users
        where email = $1
        limit 1
      `,
      [email],
    );

    const row = result.rows[0];

    return row ? mapUserWithPassword(row) : null;
  },

  async findActiveUserById(userId: number): Promise<AuthUser | null> {
    const result = await postgresDb.query<AuthUserRow>(
      `
        select
          user_id,
          role_name,
          customer_id,
          email,
          password_hash,
          full_name,
          is_active,
          created_at,
          updated_at
        from public.auth_users
        where user_id = $1
          and is_active = true
        limit 1
      `,
      [userId],
    );

    const row = result.rows[0];

    return row ? mapUser(row) : null;
  },

  async createSession(input: CreateAuthSessionInput): Promise<AuthSession> {
    const client = await postgresPool.connect();

    try {
      await client.query("begin");
      await client.query("select pg_advisory_xact_lock($1, $2)", [
        481516234,
        input.userId,
      ]);
      await client.query(
        `
          update public.user_sessions
          set revoked_at = now()
          where user_id = $1
            and revoked_at is null
        `,
        [input.userId],
      );

      const result = await client.query<AuthSessionRow>(
        `
          insert into public.user_sessions (
            user_id,
            session_token_hash,
            expires_at,
            user_agent,
            ip_address
          )
          values ($1, $2, $3, $4, $5::inet)
          returning
            session_id,
            user_id,
            session_token_hash,
            created_at,
            expires_at,
            last_used_at,
            revoked_at,
            user_agent,
            ip_address::text as ip_address
        `,
        [
          input.userId,
          input.refreshTokenHash,
          input.expiresAt,
          input.userAgent,
          input.ipAddress,
        ],
      );

      await client.query("commit");

      return mapSession(result.rows[0]);
    } catch (error) {
      await client.query("rollback");

      if (isUniqueSessionTokenHashError(error)) {
        throw authError.create(
          "SESSION_CONFLICT",
          "auth.sessionConflict",
          409,
        );
      }

      throw error;
    } finally {
      client.release();
    }
  },

  async findCurrentSession(
    refreshTokenHash: string,
  ): Promise<CurrentAuthSession | null> {
    const result = await postgresDb.query<CurrentAuthSessionRow>(
      `
        select
          users.user_id,
          users.role_name,
          users.customer_id,
          users.email,
          users.password_hash,
          users.full_name,
          users.is_active,
          users.created_at,
          users.updated_at,
          sessions.session_id,
          sessions.session_token_hash,
          sessions.created_at as session_created_at,
          sessions.expires_at,
          sessions.last_used_at,
          sessions.revoked_at,
          sessions.user_agent,
          sessions.ip_address::text as ip_address
        from public.user_sessions as sessions
        inner join public.auth_users as users
          on users.user_id = sessions.user_id
        where sessions.session_token_hash = $1
          and sessions.revoked_at is null
          and sessions.expires_at > now()
          and users.is_active = true
        limit 1
      `,
      [refreshTokenHash],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      user: mapUser(row),
      session: mapCurrentSession(row),
    };
  },

  async updateSessionLastUsed(sessionId: string): Promise<void> {
    await postgresDb.query(
      `
        update public.user_sessions
        set last_used_at = now()
        where session_id = $1
      `,
      [sessionId],
    );
  },

  async revokeAllUserSessions(userId: number): Promise<void> {
    await postgresDb.query(
      `
        update public.user_sessions
        set revoked_at = now()
        where user_id = $1
          and revoked_at is null
      `,
      [userId],
    );
  },

  async revokeSession(refreshTokenHash: string): Promise<void> {
    await postgresDb.query(
      `
        update public.user_sessions
        set revoked_at = now()
        where session_token_hash = $1
          and revoked_at is null
      `,
      [refreshTokenHash],
    );
  },
};
