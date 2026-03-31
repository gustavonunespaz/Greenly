#!/usr/bin/env node

const API_URL = process.env.API_URL ?? 'http://localhost:3333/api'
const EMAIL = process.env.SMOKE_EMAIL ?? 'admin@greenly.app'
const SENHA = process.env.SMOKE_PASSWORD ?? 'greenly123'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(path, { method = 'GET', token, body, headers: customHeaders } = {}) {
  const headers = { ...(customHeaders ?? {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  let payloadBody = body
  if (body && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
    payloadBody = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: payloadBody,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new Error(
      `[${method} ${path}] ${response.status} ${response.statusText} - ${JSON.stringify(payload)}`,
    )
  }

  return payload
}

async function main() {
  const runId = Date.now().toString()

  console.log(`1) Login em ${API_URL}...`)
  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: EMAIL, senha: SENHA },
  })
  const token = login.token
  assert(typeof token === 'string' && token.length > 20, 'Token JWT invalido no login')

  console.log('2) Validar matriz de templates por perfil (global + override)...')
  const templatesAntes = await request('/documentos/templates-requisitos?perfilCliente=GERADOR_RESIDUO', {
    token,
  })
  assert(Array.isArray(templatesAntes?.itens), 'Matriz de templates nao retornou lista')

  const payloadOverride = {
    perfilCliente: 'GERADOR_RESIDUO',
    tipoDocumento: 'MTR',
    categoriaDocumento: 'OPERACAO_RESIDUOS',
    descricaoTemplate: `Template Sprint6 MTR ${runId}`,
    camposObrigatorios: ['NUMERO_MTR', 'TIPO_RESIDUO', 'QUANTIDADE_RESIDUO'],
    camposOpcionais: ['UNIDADE_MEDIDA', 'DATA_EMISSAO'],
  }
  const templatesDepois = await request('/documentos/templates-requisitos', {
    method: 'PUT',
    token,
    body: payloadOverride,
  })
  const itemMtr = templatesDepois?.itens?.find((item) => item?.tipo === 'MTR')
  assert(itemMtr?.origem === 'CONSULTORIA_OVERRIDE', 'Override de template MTR nao aplicado')

  console.log('3) Validar alertas operacionais da fila documental...')
  const alertas = await request('/dashboard/documentos/pipeline/alertas?periodoHoras=24', { token })
  assert(typeof alertas?.thresholds?.backlogMaximo === 'number', 'Threshold de backlog ausente')
  assert(Array.isArray(alertas?.alertas) && alertas.alertas.length === 3, 'Alertas operacionais invalidos')

  console.log('4) Gerar condicionantes candidatas a partir de documento concluido...')
  const concluidos = await request('/dashboard/documentos/pipeline/itens?status=CONCLUIDO&limit=50', { token })
  assert(Array.isArray(concluidos) && concluidos.length > 0, 'Sem documentos concluidos para validar sugestoes')
  const processamentoConcluidoId = concluidos[0].id

  const candidatas = await request(
    `/documentos/${processamentoConcluidoId}/condicionantes-candidatas?limit=5`,
    { token },
  )
  assert(candidatas?.processamentoDocumentoId === processamentoConcluidoId, 'Resposta de candidatas inconsistente')
  assert(candidatas?.total > 0, 'Nenhuma condicionante candidata foi gerada')

  console.log('5) Validar reprocessamento manual de item com falha e SLA...')
  const falhas = await request('/dashboard/documentos/pipeline/itens?status=FALHA&limit=50', { token })
  assert(Array.isArray(falhas) && falhas.length > 0, 'Sem documentos em falha para validar reprocessamento')
  const processamentoFalhaId = falhas[0].id

  const reprocessamento = await request(`/documentos/${processamentoFalhaId}/reprocessar`, {
    method: 'POST',
    token,
    body: {
      motivo: `Reprocessamento sprint6 smoke ${runId}`,
    },
  })
  assert(reprocessamento?.status === 'SOLICITADO', 'Reprocessamento nao retornou status SOLICITADO')
  assert(!!reprocessamento?.fila?.jobId, 'Reprocessamento sem job na fila')

  const metricasReprocessamento = await request(
    '/documentos/reprocessamentos/metricas?periodoHoras=168&limit=20',
    { token },
  )
  assert(
    typeof metricasReprocessamento?.totalSolicitados === 'number',
    'Metricas de reprocessamento sem totalSolicitados',
  )
  assert(
    typeof metricasReprocessamento?.dentroSlaPct === 'number',
    'Metricas de reprocessamento sem dentroSlaPct',
  )

  console.log('\nSMOKE SPRINT 6 ROBUSTEZ DOCUMENTAL: OK')
  console.log(`- Documento candidato: ${processamentoConcluidoId}`)
  console.log(`- Candidatas geradas: ${candidatas.total}`)
  console.log(`- Documento reprocessado: ${processamentoFalhaId}`)
  console.log(`- Solicitacoes no periodo: ${metricasReprocessamento.totalSolicitados}`)
}

main().catch((error) => {
  console.error('\nSMOKE SPRINT 6 ROBUSTEZ DOCUMENTAL: FALHOU')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
