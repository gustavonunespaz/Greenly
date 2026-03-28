#!/usr/bin/env node

const API_URL = process.env.API_URL ?? 'http://localhost:3333/api';
const EMAIL = process.env.SMOKE_EMAIL ?? 'admin@greenly.app';
const SENHA = process.env.SMOKE_PASSWORD ?? 'greenly123';

function randomDigits(length) {
  let out = '';
  while (out.length < length) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out.slice(0, length);
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      `[${method} ${path}] ${response.status} ${response.statusText} - ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const runId = Date.now().toString();
  const cnpj = randomDigits(14);
  const clienteNome = `SMOKE Sprint1 ${runId}`;
  const now = new Date();
  const validade = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);
  const prazoCond = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  let token = '';
  let clienteId = '';
  let licencaId = '';
  let condicionanteId = '';

  try {
    console.log(`1) Login em ${API_URL}...`);
    const login = await request('/auth/login', {
      method: 'POST',
      body: { email: EMAIL, senha: SENHA },
    });
    token = login.token;
    assert(typeof token === 'string' && token.length > 20, 'Token JWT inválido no login');

    console.log('2) Buscar orgaos ambientais...');
    const orgaos = await request('/licencas/orgaos-ambientais', { token });
    assert(Array.isArray(orgaos) && orgaos.length > 0, 'Nenhum orgao ambiental disponível');
    const orgaoAmbientalId = orgaos[0].id;

    console.log('3) Criar cliente...');
    const cliente = await request('/clientes', {
      method: 'POST',
      token,
      body: {
        nome: clienteNome,
        cnpj,
        setor: 'Industrial',
        email: `smoke.${runId}@greenly.app`,
        telefone: '(41)90000-0000',
        cidade: 'Curitiba',
        estado: 'PR',
      },
    });
    clienteId = cliente.id;
    assert(typeof clienteId === 'string', 'Cliente não criado corretamente');

    console.log('4) Criar licenca...');
    const licenca = await request('/licencas', {
      method: 'POST',
      token,
      body: {
        clienteId,
        orgaoAmbientalId,
        tipo: 'LO',
        numeroProcesso: `PROC-${runId}`,
        numeroLicenca: `LIC-${runId}`,
        dataValidade: validade.toISOString(),
      },
    });
    licencaId = licenca.id;
    assert(typeof licencaId === 'string', 'Licença não criada corretamente');

    console.log('5) Criar condicionante...');
    const condicionante = await request(`/licencas/${licencaId}/condicionantes`, {
      method: 'POST',
      token,
      body: {
        codigo: `COND-${runId}`,
        descricao: 'Condicionante de smoke test Sprint 1',
        tipo: 'PONTUAL',
        prazo: prazoCond.toISOString(),
        responsavelCliente: 'Teste Sprint 1',
      },
    });
    condicionanteId = condicionante.id;
    assert(typeof condicionanteId === 'string', 'Condicionante não criada corretamente');

    console.log('6) Atualizar status da condicionante para CUMPRIDA...');
    const condicionanteAtualizada = await request(`/licencas/condicionantes/${condicionanteId}/status`, {
      method: 'PATCH',
      token,
      body: {
        status: 'CUMPRIDA',
      },
    });
    assert(
      condicionanteAtualizada?.status === 'CUMPRIDA',
      'Status da condicionante não foi atualizado para CUMPRIDA',
    );

    console.log('7) Validar listagem de condicionantes da consultoria...');
    const condicionantes = await request('/licencas/condicionantes/consultoria', { token });
    assert(Array.isArray(condicionantes), 'Listagem de condicionantes inválida');
    const item = condicionantes.find((c) => c.id === condicionanteId);
    assert(!!item, 'Condicionante criada não aparece na listagem da consultoria');
    assert(item.status === 'CUMPRIDA', 'Condicionante listada não está com status CUMPRIDA');

    console.log('8) Validar métricas do dashboard...');
    const metrics = await request('/dashboard/metrics', { token });
    const requiredKeys = [
      'totalClientes',
      'licencasAVencer',
      'pendenciasCriticas',
      'condicionantesAtrasadas',
      'residuosNoMes',
      'mtrsPendentes',
      'notificacoesNaoLidas',
    ];
    for (const key of requiredKeys) {
      assert(Object.hasOwn(metrics, key), `Métrica ausente no dashboard: ${key}`);
      assert(typeof metrics[key] === 'number', `Métrica ${key} deve ser numérica`);
    }

    console.log('9) Validar trilha de auditoria...');
    const auditoria = await request('/auditoria?limit=50', { token });
    assert(Array.isArray(auditoria), 'Listagem de auditoria inválida');
    const auditCondicionante = auditoria.find(
      (item) =>
        item?.entidade === 'CONDICIONANTE' &&
        item?.entidadeId === condicionanteId &&
        item?.usuarioId === login?.usuario?.id,
    );
    assert(!!auditCondicionante, 'Não foi encontrado log de auditoria da condicionante criada/atualizada');

    console.log('\nSMOKE SPRINT 1: OK');
    console.log(`- Cliente: ${clienteId}`);
    console.log(`- Licença: ${licencaId}`);
    console.log(`- Condicionante: ${condicionanteId}`);
  } finally {
    if (token && licencaId) {
      try {
        await request(`/licencas/${licencaId}`, { method: 'DELETE', token });
      } catch (_e) {
        // best effort cleanup
      }
    }

    if (token && clienteId) {
      try {
        await request(`/clientes/${clienteId}`, { method: 'DELETE', token });
      } catch (_e) {
        // best effort cleanup
      }
    }
  }
}

main().catch((error) => {
  console.error('\nSMOKE SPRINT 1: FALHOU');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
