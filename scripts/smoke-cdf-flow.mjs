#!/usr/bin/env node

const API_URL = process.env.API_URL ?? 'http://localhost:3333/api'
const EMAIL = process.env.SMOKE_EMAIL ?? 'admin@greenly.app'
const SENHA = process.env.SMOKE_PASSWORD ?? 'greenly123'
const SHARED_CLIENT_NAME = 'SMOKE CDF CLIENTE BASE'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function randomDigits(length) {
  let out = ''
  while (out.length < length) {
    out += Math.floor(Math.random() * 10).toString()
  }
  return out.slice(0, length)
}

function isParceiroLicenciado(parceiro) {
  if (!parceiro?.licencaAtiva) return false
  if (!parceiro?.sinirHabilitado) return false
  if (!parceiro?.licencaValidade) return true
  const validade = new Date(parceiro.licencaValidade)
  return !Number.isNaN(validade.getTime()) && validade >= new Date()
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
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

async function ensureParceiro(token, tipo, runId) {
  const parceiros = await request(`/residuos/parceiros?tipo=${tipo}`, { token })
  assert(Array.isArray(parceiros), `Resposta inválida na listagem de parceiros ${tipo}`)

  const parceiroValido = parceiros.find(isParceiroLicenciado)
  if (parceiroValido) {
    return { parceiroId: parceiroValido.id, reused: true }
  }

  const prefixo = tipo === 'TRANSPORTADORA' ? 'TR' : 'DE'
  const validade = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  const criado = await request('/residuos/parceiros', {
    method: 'POST',
    token,
    body: {
      nome: `SMOKE ${prefixo} ${runId}`,
      cnpj: randomDigits(14),
      tipo,
      sistemaPrincipal: 'SINIR',
      sinirHabilitado: true,
      sinirCadastroId: `${prefixo}-SINIR-${runId}`,
      cidade: 'Curitiba',
      estado: 'PR',
      licencaNumero: `${prefixo}-${runId}`,
      licencaValidade: validade,
      licencaAtiva: true,
    },
  })

  assert(typeof criado?.id === 'string', `Falha ao criar parceiro ${tipo}`)
  return { parceiroId: criado.id, reused: false }
}

async function ensureVinculoParceiroCliente(token, clienteId, parceiroId, papel) {
  const vinculos = await request(`/residuos/clientes/${clienteId}/parceiros?papel=${papel}`, {
    token,
  })
  assert(Array.isArray(vinculos), `Resposta inválida na listagem de vínculos ${papel}`)

  const existente = vinculos.find((item) => item?.parceiroId === parceiroId && item?.ativo)
  if (existente) return

  await request(`/residuos/clientes/${clienteId}/parceiros`, {
    method: 'POST',
    token,
    body: {
      parceiroId,
      papel,
      sistemaIntegracao: 'SINIR',
    },
  })
}

async function ensureFonteGeradora(token, clienteId, runId) {
  const fontes = await request(`/residuos/fontes-geradoras/cliente/${clienteId}`, { token })
  assert(Array.isArray(fontes), 'Resposta inválida na listagem de fontes geradoras')

  if (fontes.length > 0) {
    return { fonteGeradoraId: fontes[0].id, reused: true }
  }

  const tipos = await request('/residuos/tipos-residuo', { token })
  assert(
    Array.isArray(tipos) && tipos.length > 0,
    'Nenhum tipo de resíduo disponível para criar fonte geradora',
  )

  const tipo = tipos[0]
  const fonte = await request('/residuos/fonte-geradora', {
    method: 'POST',
    token,
    body: {
      clienteId,
      tipoResiduoId: tipo.id,
      descricao: `Fonte Smoke ${runId}`,
      volumeEstimadoMes: 100,
      unidadeMedida: 'KG',
    },
  })

  assert(typeof fonte?.id === 'string', 'Falha ao criar fonte geradora')
  return { fonteGeradoraId: fonte.id, reused: false }
}

async function ensureCliente(token, runId) {
  const clientes = await request('/clientes', { token })
  assert(Array.isArray(clientes), 'Resposta inválida na listagem de clientes')

  const clienteAtivo = clientes.find((cliente) => cliente?.nome === SHARED_CLIENT_NAME)
  if (clienteAtivo) {
    return { clienteId: clienteAtivo.id, reused: true }
  }

  const clienteCriado = await request('/clientes', {
    method: 'POST',
    token,
    body: {
      nome: SHARED_CLIENT_NAME,
      cnpj: randomDigits(14),
      setor: 'Industrial',
      email: `smoke.cdf.base.${runId}@greenly.app`,
      telefone: '(41)90000-0000',
      cidade: 'Curitiba',
      estado: 'PR',
    },
  })

  assert(typeof clienteCriado?.id === 'string', 'Cliente base de smoke não foi criado corretamente')
  return { clienteId: clienteCriado.id, reused: false }
}

async function main() {
  const runId = Date.now().toString()

  let token = ''
  let clienteId = ''
  let mtrId = ''

  try {
    console.log(`1) Login em ${API_URL}...`)
    const login = await request('/auth/login', {
      method: 'POST',
      body: { email: EMAIL, senha: SENHA },
    })
    token = login.token
    assert(typeof token === 'string' && token.length > 20, 'Token JWT inválido no login')

    console.log('2) Garantir cliente base para o smoke de CDF...')
    const cliente = await ensureCliente(token, runId)
    clienteId = cliente.clienteId
    assert(typeof clienteId === 'string', 'Cliente de smoke não foi criado corretamente')

    console.log('3) Garantir parceiros válidos (transportadora e destinador)...')
    const transportadora = await ensureParceiro(token, 'TRANSPORTADORA', runId)
    const destinador = await ensureParceiro(token, 'DESTINADOR_FINAL', runId)

    console.log('4) Garantir vínculos operacionais cliente ↔ parceiros...')
    await ensureVinculoParceiroCliente(
      token,
      clienteId,
      transportadora.parceiroId,
      'TRANSPORTADORA',
    )
    await ensureVinculoParceiroCliente(token, clienteId, destinador.parceiroId, 'DESTINADOR_FINAL')

    console.log('5) Garantir fonte geradora para o cliente...')
    const fonte = await ensureFonteGeradora(token, clienteId, runId)

    console.log('6) Emitir MTR...')
    const mtr = await request('/residuos/mtr', {
      method: 'POST',
      token,
      body: {
        clienteId,
        fonteGeradoraId: fonte.fonteGeradoraId,
        transportadoraId: transportadora.parceiroId,
        destinadorId: destinador.parceiroId,
        tipoDestinacao: 'INCINERACAO',
        volume: 125.5,
        unidadeMedida: 'KG',
        numeroMTR: `MTR-SMOKE-${runId}`,
        placaVeiculo: 'ABC1D23',
        nomeMotorista: 'Motorista Smoke',
        cpfMotorista: randomDigits(11),
        observacoes: 'Smoke test dedicado de CDF',
      },
    })
    mtrId = mtr.id
    assert(typeof mtrId === 'string', 'MTR não foi emitido corretamente')
    assert(mtr.status === 'EMITIDO', 'Status inicial do MTR deveria ser EMITIDO')

    console.log('7) Avançar MTR para RECEBIDO...')
    await request(`/residuos/mtr/${mtrId}/status`, {
      method: 'PATCH',
      token,
      body: { novoStatus: 'EM_TRANSITO' },
    })
    await request(`/residuos/mtr/${mtrId}/status`, {
      method: 'PATCH',
      token,
      body: { novoStatus: 'RECEBIDO' },
    })

    console.log('8) Emitir CDF vinculado ao MTR...')
    const cdf = await request('/residuos/cdf', {
      method: 'POST',
      token,
      body: {
        clienteId,
        destinadorId: destinador.parceiroId,
        mtrIds: [mtrId],
        sistema: 'SINIR',
        numeroCdf: `CDF-SMOKE-${runId}`,
        numeroCdfExterno: `EXT-${runId}`,
        observacoes: 'Smoke test de CDF',
      },
    })

    assert(typeof cdf?.id === 'string', 'CDF não foi emitido corretamente')
    assert(cdf.status === 'EMITIDO', 'Status do CDF deveria ser EMITIDO')
    assert(
      Array.isArray(cdf.mtrIds) && cdf.mtrIds.includes(mtrId),
      'CDF não retornou vínculo esperado com o MTR',
    )

    console.log('9) Validar status final do MTR e listagem de CDF...')
    const mtrsCliente = await request(`/residuos/mtr/cliente/${clienteId}`, { token })
    assert(Array.isArray(mtrsCliente), 'Listagem de MTR por cliente inválida')
    const mtrAtualizado = mtrsCliente.find((item) => item.id === mtrId)
    assert(!!mtrAtualizado, 'MTR emitido não foi encontrado na listagem do cliente')
    assert(
      mtrAtualizado.status === 'CDF_EMITIDO',
      `Status final do MTR esperado CDF_EMITIDO, recebido: ${mtrAtualizado.status}`,
    )

    const cdfsCliente = await request(`/residuos/cdf/cliente/${clienteId}`, { token })
    assert(Array.isArray(cdfsCliente), 'Listagem de CDF por cliente inválida')
    const cdfListagem = cdfsCliente.find((item) => item.id === cdf.id)
    assert(!!cdfListagem, 'CDF emitido não foi encontrado na listagem do cliente')

    console.log('10) Validar trilha de auditoria do CDF...')
    const auditoria = await request('/auditoria?entidade=CDF&limit=50', { token })
    assert(Array.isArray(auditoria), 'Resposta de auditoria inválida')
    const logCdf = auditoria.find(
      (item) =>
        item?.entidade === 'CDF' && item?.entidadeId === cdf.id && item?.evento === 'CREATE',
    )
    assert(!!logCdf, 'Não foi encontrado log de auditoria para emissão de CDF')

    console.log('\nSMOKE CDF FLOW: OK')
    console.log(`- Cliente: ${clienteId}`)
    console.log(`- MTR: ${mtrId}`)
    console.log(`- CDF: ${cdf.id}`)
    console.log(`- Cliente reaproveitado: ${cliente.reused ? 'sim' : 'nao'}`)
    console.log(`- Transportadora reaproveitada: ${transportadora.reused ? 'sim' : 'nao'}`)
    console.log(`- Destinador reaproveitado: ${destinador.reused ? 'sim' : 'nao'}`)
    console.log(`- Fonte geradora reaproveitada: ${fonte.reused ? 'sim' : 'nao'}`)
  } finally {
    if (token && mtrId) {
      try {
        await request(`/residuos/mtr/${mtrId}`, { method: 'DELETE', token })
      } catch (_error) {
        // cleanup best effort
      }
    }
  }
}

main().catch((error) => {
  console.error('\nSMOKE CDF FLOW: FALHOU')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
