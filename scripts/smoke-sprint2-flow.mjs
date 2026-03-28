#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const API_URL = process.env.API_URL ?? 'http://localhost:3333/api';
const EMAIL = process.env.SMOKE_EMAIL ?? 'admin@greenly.app';
const SENHA = process.env.SMOKE_PASSWORD ?? 'greenly123';
const ROOT = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function read(relativePath) {
  return readFile(`${ROOT}/${relativePath}`, 'utf8');
}

function expectContains(source, pattern, description) {
  const ok = typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
  assert(ok, `Contrato quebrado: ${description}`);
}

async function validarContratoFrontend() {
  console.log('4) Validar contratos de deep links e quick actions no frontend...');
  const app = await read('apps/web/src/App.tsx');
  const dashboard = await read('apps/web/src/pages/Index.tsx');
  const notificacoesPage = await read('apps/web/src/pages/NotificacoesPage.tsx');
  const licencasPage = await read('apps/web/src/pages/LicencasPage.tsx');
  const mtrsPage = await read('apps/web/src/pages/MTRsPage.tsx');
  const condicionantesPage = await read('apps/web/src/pages/CondicionantesPage.tsx');
  const clientesPage = await read('apps/web/src/pages/ClientesPage.tsx');

  expectContains(app, 'path="/licencas/:id"', 'rota dinâmica de licença ausente');
  expectContains(app, 'path="/mtrs/:id"', 'rota dinâmica de MTR ausente');
  expectContains(app, 'path="/condicionantes/:id"', 'rota dinâmica de condicionante ausente');
  expectContains(app, 'path="/clientes/:id"', 'rota dinâmica de cliente ausente');

  expectContains(dashboard, '/licencas?quickAction=nova-licenca', 'quick action de licença ausente');
  expectContains(dashboard, '/mtrs?quickAction=novo-mtr', 'quick action de MTR ausente');
  expectContains(
    dashboard,
    '/condicionantes?quickAction=nova-condicionante',
    'quick action de condicionante ausente',
  );
  expectContains(dashboard, '/clientes?quickAction=novo-cliente', 'quick action de cliente ausente');

  expectContains(notificacoesPage, 'function resolverDestino', 'resolvedor de deep link ausente');
  expectContains(notificacoesPage, 'navigate(destino);', 'navegação por deep link ausente');
  expectContains(notificacoesPage, 'if (tipo === "licenca") return "/licencas";', 'fallback de licença ausente');
  expectContains(
    notificacoesPage,
    'if (tipo === "condicionante") return "/condicionantes";',
    'fallback de condicionante ausente',
  );
  expectContains(notificacoesPage, 'if (tipo === "mtr") return "/mtrs";', 'fallback de MTR ausente');

  expectContains(licencasPage, 'quickAction !== "nova-licenca"', 'handler quick action licença ausente');
  expectContains(mtrsPage, 'quickAction !== "novo-mtr"', 'handler quick action MTR ausente');
  expectContains(
    condicionantesPage,
    'quickAction !== "nova-condicionante"',
    'handler quick action condicionante ausente',
  );
  expectContains(clientesPage, 'quickAction !== "novo-cliente"', 'handler quick action cliente ausente');

  expectContains(
    condicionantesPage,
    'setCondicionanteDestacadaId(condicionante.id);',
    'destaque de condicionante no deep link ausente',
  );
}

async function main() {
  console.log(`1) Login em ${API_URL}...`);
  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: EMAIL, senha: SENHA },
  });

  const token = login.token;
  assert(typeof token === 'string' && token.length > 20, 'Token JWT inválido no login');

  console.log('2) Validar fluxo de notificações (listar -> marcar todas -> listar)...');
  const antes = await request('/notificacoes', { token });
  assert(Array.isArray(antes), 'Listagem de notificações inválida');
  const naoLidasAntes = antes.filter((n) => !n?.lidaEm).length;

  const result = await request('/notificacoes/marcar-todas-lidas', { method: 'PATCH', token });
  assert(
    typeof result?.totalAtualizadas === 'number' && result.totalAtualizadas >= 0,
    'Resposta inválida em marcar-todas-lidas',
  );

  const depois = await request('/notificacoes', { token });
  assert(Array.isArray(depois), 'Listagem de notificações pós-atualização inválida');
  const naoLidasDepois = depois.filter((n) => !n?.lidaEm).length;
  assert(naoLidasDepois === 0, `Ainda existem notificações não lidas após limpeza: ${naoLidasDepois}`);
  assert(
    result.totalAtualizadas <= naoLidasAntes,
    'totalAtualizadas maior que o volume de não lidas anterior',
  );

  console.log('3) Validar trilha de auditoria para operação de notificações...');
  const auditoria = await request('/auditoria?entidade=NOTIFICACAO&limit=50', { token });
  assert(Array.isArray(auditoria), 'Resposta de auditoria inválida');
  const auditItem = auditoria.find(
    (item) =>
      item?.evento === 'UPDATE' &&
      item?.entidade === 'NOTIFICACAO' &&
      item?.dadosDepois?.acao === 'MARCAR_TODAS_COMO_LIDA',
  );
  assert(!!auditItem, 'Não foi encontrado log de auditoria da ação MARCAR_TODAS_COMO_LIDA');

  await validarContratoFrontend();

  console.log('\nSMOKE SPRINT 2: OK');
  console.log(`- Notificações antes não lidas: ${naoLidasAntes}`);
  console.log(`- Notificações atualizadas: ${result.totalAtualizadas}`);
  console.log(`- Notificações após não lidas: ${naoLidasDepois}`);
}

main().catch((error) => {
  console.error('\nSMOKE SPRINT 2: FALHOU');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
