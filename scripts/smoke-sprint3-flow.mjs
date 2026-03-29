#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const ROOT = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function read(relativePath) {
  return readFile(`${ROOT}/${relativePath}`, 'utf8');
}

function expectContains(source, pattern, description) {
  const ok = typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
  assert(ok, `Contrato quebrado: ${description}`);
}

async function validarContratoUX() {
  console.log('1) Validar contratos de UX padronizada (empty state + erro acionável)...');
  const licencas = await read('apps/web/src/pages/LicencasPage.tsx');
  const condicionantes = await read('apps/web/src/pages/CondicionantesPage.tsx');
  const mtrs = await read('apps/web/src/pages/MTRsPage.tsx');
  const clientes = await read('apps/web/src/pages/ClientesPage.tsx');
  const dashboardWidget = await read('apps/web/src/features/dashboard/components/LicenseStatusList.tsx');
  const emptyState = await read('apps/web/src/components/ui/empty-state.tsx');
  const formCallout = await read('apps/web/src/components/ui/form-error-callout.tsx');
  const formActionableError = await read('apps/web/src/lib/form-actionable-error.ts');

  expectContains(emptyState, 'export function EmptyState', 'componente EmptyState ausente');
  expectContains(formCallout, 'export function FormErrorCallout', 'componente FormErrorCallout ausente');
  expectContains(formActionableError, 'buildActionableFormError', 'util de erro acionável ausente');

  [licencas, condicionantes, mtrs, clientes, dashboardWidget].forEach((source, index) => {
    const pageName = ['licencas', 'condicionantes', 'mtrs', 'clientes', 'dashboard-widget'][index];
    expectContains(source, '<EmptyState', `uso de EmptyState ausente em ${pageName}`);
  });

  [licencas, condicionantes, mtrs, clientes].forEach((source, index) => {
    const pageName = ['licencas', 'condicionantes', 'mtrs', 'clientes'][index];
    expectContains(source, '<FormErrorCallout', `uso de FormErrorCallout ausente em ${pageName}`);
  });
}

async function validarContratoTelemetria() {
  console.log('2) Validar contratos de telemetria base (eventos + instrumentação)...');
  const telemetry = await read('apps/web/src/lib/telemetry.ts');
  const baseline = await read('apps/web/src/lib/telemetry-baseline.ts');
  const baselineHook = await read('apps/web/src/hooks/use-telemetry-baseline.ts');
  const dashboard = await read('apps/web/src/pages/Index.tsx');
  const licencas = await read('apps/web/src/pages/LicencasPage.tsx');
  const condicionantes = await read('apps/web/src/pages/CondicionantesPage.tsx');
  const mtrs = await read('apps/web/src/pages/MTRsPage.tsx');
  const clientes = await read('apps/web/src/pages/ClientesPage.tsx');
  const configuracoes = await read('apps/web/src/pages/ConfiguracoesPage.tsx');

  expectContains(telemetry, '"view_loaded"', 'evento view_loaded ausente');
  expectContains(telemetry, '"first_valid_action"', 'evento first_valid_action ausente');
  expectContains(telemetry, '"flow_completed"', 'evento flow_completed ausente');
  expectContains(telemetry, '"form_error"', 'evento form_error ausente');
  expectContains(telemetry, 'const TELEMETRY_STORAGE_KEY = "greenly_telemetry_events"', 'persistência local de telemetria ausente');

  expectContains(baseline, 'DEFAULT_WEEKLY_TARGETS', 'metas padrão de baseline ausentes');
  expectContains(baseline, 'ttfvAvgSeconds: 45', 'meta padrão de TTFV ausente');
  expectContains(baseline, 'completionRatePct: 70', 'meta padrão de conclusão ausente');
  expectContains(baseline, 'errorsPerSession: 1.5', 'meta padrão de erro/sessão ausente');
  expectContains(baselineHook, 'window.setInterval(refresh, 15000)', 'refresh periódico da baseline ausente');

  [dashboard, licencas, condicionantes, mtrs, clientes].forEach((source, index) => {
    const pageName = ['dashboard', 'licencas', 'condicionantes', 'mtrs', 'clientes'][index];
    expectContains(source, 'useTrackViewLoaded', `rastreamento de view_loaded ausente em ${pageName}`);
    expectContains(source, 'trackFirstValidAction', `rastreamento de first_valid_action ausente em ${pageName}`);
    expectContains(source, 'trackFlowCompleted', `rastreamento de flow_completed ausente em ${pageName}`);
  });

  [licencas, condicionantes, mtrs, clientes].forEach((source, index) => {
    const pageName = ['licencas', 'condicionantes', 'mtrs', 'clientes'][index];
    expectContains(source, 'trackFormError', `rastreamento de form_error ausente em ${pageName}`);
  });

  expectContains(configuracoes, 'Painel Interno de Produto', 'painel interno da baseline ausente');
  expectContains(configuracoes, 'useTelemetryBaseline(7)', 'consumo da baseline semanal ausente');
}

async function validarKitUsabilidade() {
  console.log('3) Validar kit de usabilidade da Sprint 3...');
  const roteiro = await read('docs/sprint3_usabilidade_roteiro.md');
  const resultados = await read('docs/sprint3_usabilidade_resultados.md');

  expectContains(roteiro, 'Fluxo 1 - Criar Licença', 'roteiro não cobre fluxo de licença');
  expectContains(roteiro, 'Fluxo 2 - Criar Condicionante', 'roteiro não cobre fluxo de condicionante');
  expectContains(roteiro, 'Fluxo 3 - Emitir MTR', 'roteiro não cobre fluxo de MTR');
  expectContains(roteiro, 'Fluxo 4 - Criar Cliente', 'roteiro não cobre fluxo de cliente');
  expectContains(roteiro, 'Fluxo 5 - Alertas e Deep Links', 'roteiro não cobre fluxo de alertas/deep links');
  expectContains(resultados, 'Sessão', 'template de resultados sem estrutura de sessões');
  expectContains(resultados, 'Bloqueador Grave', 'template de resultados sem classificação de severidade');
}

async function main() {
  await validarContratoUX();
  await validarContratoTelemetria();
  await validarKitUsabilidade();

  console.log('\nSMOKE SPRINT 3: OK');
  console.log('- Contratos de UX e telemetria íntegros');
  console.log('- Baseline semanal disponível no painel interno');
  console.log('- Kit de usabilidade pronto para execução com 5 participantes');
}

main().catch((error) => {
  console.error('\nSMOKE SPRINT 3: FALHOU');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
