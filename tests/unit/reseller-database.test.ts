import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

// Banco PostgreSQL real em WASM; auth/storage abaixo sao fixtures locais, nao servicos Supabase.
let db: PGlite;
const A = "11111111-1111-4111-8111-111111111111",
  B = "22222222-2222-4222-8222-222222222222",
  STAFF = "33333333-3333-4333-8333-333333333333";
const TOKEN = "44444444-4444-4444-8444-444444444444";
const items = [{ name: "PRODUTO FICTÍCIO A", sku: "FICT-001", quantity: 2 }];
async function asUser<T>(
  id: string,
  fn: () => Promise<T>,
  role = "authenticated",
): Promise<T> {
  await db.exec(
    `begin;set local role ${role};set local request.jwt.claim.sub='${id}';`,
  );
  try {
    const value = await fn();
    await db.exec("commit");
    return value;
  } catch (error) {
    await db.exec("rollback");
    throw error;
  }
}
async function makeRequest(owner = A, token = TOKEN, payload = items) {
  return asUser(owner, async () => {
    const r = await db.query<{ id: string }>(
      "select public.portal_create_request($1,$2::jsonb,$3,$4::uuid) as id",
      ["candido-sales", JSON.stringify(payload), "TESTE FICTÍCIO", token],
    );
    return r.rows[0].id;
  });
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb not null default '{}',email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,public,storage to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;grant select,insert,delete on storage.objects to authenticated;
  `);
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/202611110001_reseller_portal.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
}, 30000);
beforeEach(async () => {
  await db.exec("truncate auth.users cascade;truncate storage.objects;");
  for (const [id, name] of [
    [A, "Revendedor Fictício A"],
    [B, "Revendedor Fictício B"],
    [STAFF, "Equipe Fictícia"],
  ]) {
    await db.query(
      "insert into auth.users(id,email,raw_user_meta_data,email_confirmed_at) values($1,$2,$3::jsonb,now())",
      [
        id,
        `${id.slice(0, 2)}@example.invalid`,
        JSON.stringify({
          portal: "agylli-reseller",
          name,
          phone: "(77) 99999-0000",
          unit: "candido-sales",
          role: "admin",
          status: "approved",
        }),
      ],
    );
  }
  await db.query(
    "update public.reseller_profiles set status='approved' where id in ($1,$2)",
    [A, B],
  );
  await db.query("insert into public.portal_staff(user_id) values($1)", [
    STAFF,
  ]);
});
afterAll(async () => {
  await db?.close();
});

describe("Permissoes e transacoes do portal de revenda", () => {
  it("ignora papeis e aprovacao enviados nos metadados de cadastro", async () => {
    const r = await db.query<{ status: string }>(
      "select status from public.reseller_profiles where id=$1",
      [STAFF],
    );
    expect(r.rows[0].status).toBe("pending");
    const staff = await asUser(A, () =>
      db.query<{ staff: boolean }>("select public.portal_is_staff() as staff"),
    );
    expect(staff.rows[0].staff).toBe(false);
  });
  it("registra pedido, itens, evento e aviso na mesma transacao", async () => {
    const id = await makeRequest();
    for (const table of [
      "reseller_request_items",
      "reseller_request_events",
      "reseller_email_notifications",
    ]) {
      const r = await db.query<{ count: number }>(
        `select count(*)::int as count from public.${table} where request_id=$1`,
        [id],
      );
      expect(r.rows[0].count).toBe(1);
    }
  });
  it("isola pedidos, itens, eventos e perfis entre dois revendedores", async () => {
    await makeRequest();
    for (const table of [
      "reseller_requests",
      "reseller_request_items",
      "reseller_request_events",
    ]) {
      const r = await asUser(B, () =>
        db.query(`select * from public.${table}`),
      );
      expect(r.rows).toHaveLength(0);
    }
    const profiles = await asUser(B, () =>
      db.query<{ id: string }>("select id from public.reseller_profiles"),
    );
    expect(profiles.rows.map((p) => p.id)).toEqual([B]);
  });
  it("anonimo nao le pedidos nem chama a criacao", async () => {
    await makeRequest();
    await expect(
      asUser(
        "",
        () => db.query("select * from public.reseller_requests"),
        "anon",
      ),
    ).rejects.toThrow();
    await expect(
      asUser(
        "",
        () =>
          db.query(
            "select public.portal_create_request('candido-sales','[]'::jsonb,'',$1::uuid)",
            [TOKEN],
          ),
        "anon",
      ),
    ).rejects.toThrow();
  });
  it("cadastro pendente e suspenso nao registram pedidos", async () => {
    for (const status of ["pending", "suspended"]) {
      await db.query(
        "update public.reseller_profiles set status=$1 where id=$2",
        [status, A],
      );
      await expect(makeRequest()).rejects.toThrow(/aprovado/);
    }
    expect(
      (await db.query("select * from public.reseller_requests")).rows,
    ).toHaveLength(0);
  });
  it("usuario nao se promove, nao altera status e nao insere compra confirmada", async () => {
    const id = await makeRequest();
    await expect(
      asUser(A, () =>
        db.query("insert into public.portal_staff(user_id) values($1)", [A]),
      ),
    ).rejects.toThrow();
    await expect(
      asUser(A, () =>
        db.query(
          "update public.reseller_profiles set status='approved' where id=$1",
          [A],
        ),
      ),
    ).rejects.toThrow();
    await expect(
      asUser(A, () =>
        db.query("select public.portal_set_status($1,'entregue')", [id]),
      ),
    ).rejects.toThrow(/restrito/);
    await expect(
      asUser(A, () =>
        db.query("select public.portal_set_profile_status($1,'approved')", [B]),
      ),
    ).rejects.toThrow(/restrito/);
    await expect(
      asUser(A, () =>
        db.query(
          "insert into public.reseller_purchase_records(user_id,unit_id,purchased_at,source_reference,summary) values($1,'candido-sales',now(),'FICT','FICT')",
          [A],
        ),
      ),
    ).rejects.toThrow();
  });
  it("idempotencia evita duplicar pedido e email e recusa outro conteudo no mesmo token", async () => {
    const id = await makeRequest();
    expect(await makeRequest()).toBe(id);
    await expect(
      makeRequest(A, TOKEN, [{ ...items[0], quantity: 3 }]),
    ).rejects.toThrow(/Token/);
    expect(
      (await db.query("select * from public.reseller_requests")).rows,
    ).toHaveLength(1);
    expect(
      (await db.query("select * from public.reseller_email_notifications"))
        .rows,
    ).toHaveLength(1);
  });
  it("valida itens e unidades mesmo quando a chamada contorna o formulario", async () => {
    await expect(
      asUser(A, () =>
        db.query(
          "select public.portal_create_request('candido-sales',$1::jsonb,'',$2::uuid)",
          [JSON.stringify([{ ...items[0], extra: "FICTICIO" }]), TOKEN],
        ),
      ),
    ).rejects.toThrow();
    await expect(
      asUser(A, () =>
        db.query(
          "select public.portal_create_request('candido-sales',$1::jsonb,'',$2::uuid)",
          [JSON.stringify([{ ...items[0], quantity: "2" }]), TOKEN],
        ),
      ),
    ).rejects.toThrow();
    for (const quantity of [0, -1, 1.5, 100])
      await expect(
        makeRequest(A, TOKEN, [{ ...items[0], quantity }]),
      ).rejects.toThrow();
    await expect(
      asUser(A, () =>
        db.query(
          "select public.portal_create_request('outra',$1::jsonb,'',$2::uuid)",
          [JSON.stringify(items), TOKEN],
        ),
      ),
    ).rejects.toThrow();
    await expect(
      makeRequest(
        A,
        TOKEN,
        Array.from({ length: 21 }, () => items[0]),
      ),
    ).rejects.toThrow(/Limite/);
    expect(
      (await db.query("select * from public.reseller_requests")).rows,
    ).toHaveLength(0);
  });
  it("limita excesso de solicitacoes sem penalizar repeticao idempotente", async () => {
    for (let i = 0; i < 10; i++)
      await makeRequest(
        A,
        `44444444-4444-4444-8444-${String(i).padStart(12, "0")}`,
      );
    await expect(makeRequest()).rejects.toThrow(/Limite/);
    expect(
      await makeRequest(A, "44444444-4444-4444-8444-000000000000"),
    ).toBeTruthy();
  });
  it("equipe acompanha todas as solicitacoes e registra transicoes sequenciais", async () => {
    const id = await makeRequest();
    expect(
      (
        await asUser(STAFF, () =>
          db.query("select * from public.reseller_requests"),
        )
      ).rows,
    ).toHaveLength(1);
    await expect(
      asUser(STAFF, () =>
        db.query("select public.portal_set_status($1,'entregue')", [id]),
      ),
    ).rejects.toThrow(/Transicao/);
    for (const next of ["em_analise", "em_separacao", "pronto", "entregue"])
      await asUser(STAFF, () =>
        db.query("select public.portal_set_status($1,$2)", [id, next]),
      );
    await expect(
      asUser(STAFF, () =>
        db.query("select public.portal_set_status($1,'cancelado')", [id]),
      ),
    ).rejects.toThrow(/Transicao/);
    expect(
      (
        await asUser(A, () =>
          db.query("select * from public.reseller_request_events"),
        )
      ).rows,
    ).toHaveLength(5);
    expect(
      (await db.query("select * from public.reseller_purchase_records")).rows,
    ).toHaveLength(0);
  });
  it("aprovacao exige equipe e email confirmado", async () => {
    await db.query(
      "update auth.users set email_confirmed_at=null where id=$1",
      [A],
    );
    await expect(
      asUser(STAFF, () =>
        db.query("select public.portal_set_profile_status($1,'approved')", [A]),
      ),
    ).rejects.toThrow(/confirmado/);
    await db.query(
      "update auth.users set email_confirmed_at=now() where id=$1",
      [A],
    );
    await asUser(STAFF, () =>
      db.query("select public.portal_set_profile_status($1,'suspended')", [A]),
    );
    expect(
      (
        await db.query<{ status: string }>(
          "select status from public.reseller_profiles where id=$1",
          [A],
        )
      ).rows[0].status,
    ).toBe("suspended");
  });
  it("somente o worker pode reservar e concluir o envio de email", async () => {
    const id = await makeRequest();
    expect(
      (
        await asUser(A, () =>
          db.query("select * from public.reseller_email_notifications"),
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      asUser(A, () => db.query("select public.portal_claim_email($1)", [id])),
    ).rejects.toThrow();
    const first = await asUser(
      "",
      () =>
        db.query<{ claimed: boolean }>(
          "select public.portal_claim_email($1) as claimed",
          [id],
        ),
      "service_role",
    );
    expect(first.rows[0].claimed).toBe(true);
    const second = await asUser(
      "",
      () =>
        db.query<{ claimed: boolean }>(
          "select public.portal_claim_email($1) as claimed",
          [id],
        ),
      "service_role",
    );
    expect(second.rows[0].claimed).toBe(false);
    await asUser(
      "",
      () =>
        db.query(
          "update public.reseller_email_notifications set status='sent' where request_id=$1",
          [id],
        ),
      "service_role",
    );
    const sent = await asUser(
      "",
      () =>
        db.query<{ claimed: boolean }>(
          "select public.portal_claim_email($1) as claimed",
          [id],
        ),
      "service_role",
    );
    expect(sent.rows[0].claimed).toBe(false);
  });
  it("material privado so fica visivel a aprovados e funcionarios; retirada revoga novo download", async () => {
    await db.query(
      "insert into public.reseller_resources(title,description,category,file_path,created_by) values('FICTICIO','Arquivo ficticio','catalogo','FICT.pdf',$1)",
      [STAFF],
    );
    await db.exec(
      "insert into storage.objects(bucket_id,name) values('reseller-materials','FICT.pdf')",
    );
    expect(
      (await asUser(A, () => db.query("select * from storage.objects"))).rows,
    ).toHaveLength(1);
    await db.query(
      "update public.reseller_profiles set status='pending' where id=$1",
      [B],
    );
    expect(
      (
        await asUser(B, () =>
          db.query("select * from public.reseller_resources"),
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (await asUser(B, () => db.query("select * from storage.objects"))).rows,
    ).toHaveLength(0);
    await expect(
      asUser(A, () =>
        db.query(
          "insert into public.reseller_resources(title,description,category) values('FICTICIO','FICT','beneficio')",
        ),
      ),
    ).rejects.toThrow();
    await asUser(STAFF, () =>
      db.query("update public.reseller_resources set active=false"),
    );
    expect(
      (await asUser(A, () => db.query("select * from storage.objects"))).rows,
    ).toHaveLength(0);
  });
  it("historico de compras confirmadas pertence somente ao dono do registro", async () => {
    await db.query(
      "insert into public.reseller_purchase_records(user_id,unit_id,purchased_at,source_reference,summary,total_brl) values($1,'candido-sales',now(),'FICT-ERP-001','TESTE FICTICIO',12.50)",
      [A],
    );
    expect(
      (
        await asUser(A, () =>
          db.query("select * from public.reseller_purchase_records"),
        )
      ).rows,
    ).toHaveLength(1);
    expect(
      (
        await asUser(B, () =>
          db.query("select * from public.reseller_purchase_records"),
        )
      ).rows,
    ).toHaveLength(0);
  });
});
