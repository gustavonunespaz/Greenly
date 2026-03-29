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

function buildDocumentoPayload(runId) {
  const content = [
    'SMOKE GREENLY S4',
    `run_id=${runId}`,
    'tipo_documento=MTR',
    'manifesto transporte residuos',
  ].join('\n')

  return Buffer.from(content, 'utf8')
}

async function main() {
  const runId = Date.now().toString()

  console.log(`1) Login em ${API_URL}...`)
  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: EMAIL, senha: SENHA },
  })
  const token = login.token
  assert(typeof token === 'string' && token.length > 20, 'Token JWT inválido no login')

  console.log('2) Validar catálogo documental e contrato de extração por perfil...')
  const catalogo = await request('/documentos/catalogo', { token })
  assert(Array.isArray(catalogo?.itens), 'Catálogo documental inválido')
  assert(catalogo.itens.some((item) => item?.tipo === 'MTR'), 'Tipo MTR ausente no catálogo')

  const contratoGerador = await request('/documentos/contrato-extracao?perfilCliente=GERADOR_RESIDUO', {
    token,
  })
  assert(contratoGerador?.perfilCliente === 'GERADOR_RESIDUO', 'Perfil do contrato inválido')
  const contratoMtr = contratoGerador?.itens?.find((item) => item?.tipo === 'MTR')
  assert(!!contratoMtr, 'Contrato de extração não retornou item MTR')
  assert(
    Array.isArray(contratoMtr.camposObrigatorios) &&
      contratoMtr.camposObrigatorios.includes('TIPO_RESIDUO'),
    'Contrato MTR do perfil GERADOR_RESIDUO sem campo obrigatório esperado',
  )

  console.log('3) Validar classificação e pacote geoespacial...')
  const classificado = await request('/documentos/classificar', {
    method: 'POST',
    token,
    body: {
      nomeArquivo: `MTR_smoke_${runId}.pdf`,
      caminhoArquivo: `clientes/base/sinir/mtr/${runId}`,
      mimeType: 'application/pdf',
    },
  })
  assert(classificado?.tipo === 'MTR', `Classificação inesperada: ${classificado?.tipo}`)

  const geoespacial = await request('/documentos/validar-geoespacial', {
    method: 'POST',
    token,
    body: {
      arquivos: [
        'Mapas/empreendimento.shp',
        'Mapas/empreendimento.shx',
        'Mapas/empreendimento.dbf',
        'Mapas/projeto.qgz',
      ],
    },
  })
  assert(Array.isArray(geoespacial?.pacotesShapefile), 'Validação geoespacial inválida')
  assert(
    geoespacial.pacotesShapefile.some((item) => item?.completo === true),
    'Pacote shapefile completo não detectado',
  )

  console.log('4) Validar ingestão documental com idempotência...')
  const arquivo = buildDocumentoPayload(runId)
  const fileName = `smoke_s4_mtr_${runId}.pdf`

  const formPrimeiro = new FormData()
  formPrimeiro.append('origem', 'UPLOAD_MTR')
  formPrimeiro.append('tipoDeclarado', 'MTR')
  formPrimeiro.append('categoriaDeclarada', 'OPERACAO_RESIDUOS')
  formPrimeiro.append('arquivo', new Blob([arquivo], { type: 'application/pdf' }), fileName)

  const primeiro = await request('/documentos/ingestao', {
    method: 'POST',
    token,
    body: formPrimeiro,
  })

  assert(primeiro?.duplicado === false, 'Primeira ingestão não deveria ser duplicada')
  assert(
    typeof primeiro?.processamentoDocumentoId === 'string',
    'Ingestão não retornou processamentoDocumentoId',
  )
  assert(typeof primeiro?.retencaoDias === 'number', 'Ingestão sem retencaoDias')
  assert(!!primeiro?.expirarEm, 'Ingestão sem data de expiração')

  const formDuplicado = new FormData()
  formDuplicado.append('origem', 'UPLOAD_MTR')
  formDuplicado.append('tipoDeclarado', 'MTR')
  formDuplicado.append('categoriaDeclarada', 'OPERACAO_RESIDUOS')
  formDuplicado.append('arquivo', new Blob([arquivo], { type: 'application/pdf' }), fileName)

  const duplicado = await request('/documentos/ingestao', {
    method: 'POST',
    token,
    body: formDuplicado,
  })

  assert(duplicado?.duplicado === true, 'Segunda ingestão deveria ser deduplicada por hash+tipo')
  assert(
    duplicado?.processamentoDocumentoId === primeiro?.processamentoDocumentoId,
    'Idempotência retornou processamento diferente para o mesmo hash+tipo',
  )
  assert(typeof duplicado?.retencaoDias === 'number', 'Resposta duplicada sem retencaoDias')

  console.log('5) Validar dashboard operacional do pipeline documental...')
  const pipeline = await request('/dashboard/documentos/pipeline?periodoHoras=24', { token })
  assert(typeof pipeline?.backlog === 'number', 'Métrica de backlog ausente no pipeline')
  assert(Array.isArray(pipeline?.porStatus), 'Distribuição por status ausente no pipeline')
  assert(Array.isArray(pipeline?.falhasPorTipo), 'Falhas por tipo ausentes no pipeline')

  const itens = await request('/dashboard/documentos/pipeline/itens?limit=20', { token })
  assert(Array.isArray(itens), 'Listagem de itens do pipeline inválida')
  assert(
    itens.some((item) => item?.id === primeiro.processamentoDocumentoId),
    'Documento ingerido não encontrado na listagem do pipeline',
  )

  console.log('\nSMOKE SPRINT 4 DOCUMENTOS: OK')
  console.log(`- Processamento: ${primeiro.processamentoDocumentoId}`)
  console.log(`- Duplicado confirmado: ${duplicado.duplicado ? 'sim' : 'nao'}`)
  console.log(`- Backlog atual: ${pipeline.backlog}`)
}

main().catch((error) => {
  console.error('\nSMOKE SPRINT 4 DOCUMENTOS: FALHOU')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
