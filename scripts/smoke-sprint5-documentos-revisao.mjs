#!/usr/bin/env node

const API_URL = process.env.API_URL ?? 'http://localhost:3333/api'
const EMAIL = process.env.SMOKE_EMAIL ?? 'admin@greenly.app'
const SENHA = process.env.SMOKE_PASSWORD ?? 'greenly123'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
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

function buildDocumentoTexto(runId) {
  const content = [
    'SPRINT5 SMOKE GREENLY',
    `run_id=${runId}`,
    'Licenca Ambiental 12345/2026',
    'Processo 9988/2025',
    'Data de Emissao 29/03/2026',
    'Data de Validade 29/03/2027',
    'Orgao emissor: IAT',
    'CNPJ 12.345.678/0001-99',
    `Protocolo PR-${runId}`,
  ].join('\n')

  return Buffer.from(content, 'utf8')
}

async function aguardarDocumentoPendente(token, processamentoDocumentoId) {
  const tentativas = 30
  for (let i = 0; i < tentativas; i += 1) {
    const pendentes = await request('/documentos/revisao/pendentes?statusRevisao=PENDENTE_REVISAO&limit=200', {
      token,
    })

    const encontrado = pendentes.find((item) => item?.processamentoDocumentoId === processamentoDocumentoId)
    if (encontrado) return encontrado

    await sleep(1000)
  }

  throw new Error(
    `Documento ${processamentoDocumentoId} nao apareceu na fila de revisao pendente no tempo esperado`,
  )
}

async function aguardarDetalheRevisaoPronto(token, processamentoDocumentoId) {
  const tentativas = 30
  for (let i = 0; i < tentativas; i += 1) {
    const detalhe = await request(`/documentos/${processamentoDocumentoId}/revisao`, { token })
    const campos = Array.isArray(detalhe?.campos) ? detalhe.campos : []
    if (detalhe?.statusProcessamento === 'CONCLUIDO' && campos.length > 0) {
      return detalhe
    }
    await sleep(1000)
  }

  throw new Error(`Detalhe de revisao do documento ${processamentoDocumentoId} nao ficou pronto a tempo`)
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

  console.log('2) Ingerir documento textual para extracao Sprint 5...')
  const arquivo = buildDocumentoTexto(runId)
  const form = new FormData()
  form.append('origem', 'UPLOAD_GERAL')
  form.append('tipoDeclarado', 'LICENCA_AMBIENTAL')
  form.append('categoriaDeclarada', 'LICENCIAMENTO')
  form.append(
    'arquivo',
    new Blob([arquivo], { type: 'text/plain' }),
    `smoke_sprint5_licenca_${runId}.txt`,
  )

  const ingestao = await request('/documentos/ingestao', {
    method: 'POST',
    token,
    body: form,
  })

  assert(!!ingestao?.processamentoDocumentoId, 'Ingestao sem processamentoDocumentoId')

  console.log('3) Aguardar item na fila de revisao pendente...')
  const pendente = await aguardarDocumentoPendente(token, ingestao.processamentoDocumentoId)
  assert(pendente?.revisaoStatus === 'PENDENTE_REVISAO', 'Documento nao ficou pendente para revisao')

  console.log('4) Carregar detalhe de revisao e validar confianca/motivos por campo...')
  const detalhe = await aguardarDetalheRevisaoPronto(token, ingestao.processamentoDocumentoId)
  assert(Array.isArray(detalhe?.campos) && detalhe.campos.length > 0, 'Detalhe sem campos de revisao')

  const numeroLicenca = detalhe.campos.find((campo) => campo?.campo === 'NUMERO_LICENCA')
  assert(!!numeroLicenca?.valor, 'Campo NUMERO_LICENCA nao foi extraido')
  assert(typeof numeroLicenca?.confianca === 'number', 'Campo NUMERO_LICENCA sem confianca')
  assert(typeof numeroLicenca?.motivo === 'string', 'Campo NUMERO_LICENCA sem motivo')

  console.log('5) Registrar revisao humana com ajuste de 1 campo...')
  const payloadRevisao = {
    statusRevisao: 'APROVADO_COM_AJUSTES',
    tempoRevisaoSegundos: 42,
    observacoes: `smoke_sprint5_${runId}`,
    campos: detalhe.campos.slice(0, 5).map((campo) => ({
      campo: campo.campo,
      valorFinal:
        campo.campo === 'NUMERO_PROCESSO' ? `9988/2025-R${runId.slice(-3)}` : campo.valor ?? null,
    })),
  }

  const revisao = await request(`/documentos/${ingestao.processamentoDocumentoId}/revisao`, {
    method: 'POST',
    token,
    body: payloadRevisao,
  })

  assert(revisao?.revisaoStatus === 'APROVADO_COM_AJUSTES', 'Revisao nao retornou status esperado')
  assert(revisao?.camposCorrigidos >= 1, 'Revisao nao registrou ajuste de campo')

  console.log('6) Validar metricas de qualidade documental...')
  const qualidade = await request('/dashboard/documentos/qualidade?periodoDias=30', { token })
  assert(typeof qualidade?.revisadosTotal === 'number', 'Metricas de qualidade sem revisadosTotal')
  assert(typeof qualidade?.acuraciaMediaPct === 'number', 'Metricas de qualidade sem acuraciaMediaPct')
  assert(Array.isArray(qualidade?.porTipo), 'Metricas de qualidade sem distribuicao por tipo')

  console.log('\nSMOKE SPRINT 5 REVISAO DOCUMENTAL: OK')
  console.log(`- Processamento: ${ingestao.processamentoDocumentoId}`)
  console.log(`- Revisao: ${revisao.revisaoStatus}`)
  console.log(`- Campos corrigidos: ${revisao.camposCorrigidos}`)
  console.log(`- Revisados no periodo: ${qualidade.revisadosTotal}`)
}

main().catch((error) => {
  console.error('\nSMOKE SPRINT 5 REVISAO DOCUMENTAL: FALHOU')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
