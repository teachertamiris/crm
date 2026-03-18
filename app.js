const STORAGE_KEY = 'crmDidaticoV2Data';
const SESSION_KEY = 'crmDidaticoV2Session';
const ETAPAS = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado', 'Perdido'];

const initialState = {
  users: [
    { id: 1, nome: 'Professor', username: 'professor', senha: '1234', perfil: 'Professor', equipe: 'Gestão Comercial' },
    { id: 2, nome: 'Ana Martins', username: 'ana', senha: '1234', perfil: 'Vendedor', equipe: 'Equipe A' },
    { id: 3, nome: 'Bruno Costa', username: 'bruno', senha: '1234', perfil: 'Vendedor', equipe: 'Equipe B' },
    { id: 4, nome: 'Carla Rocha', username: 'carla', senha: '1234', perfil: 'Vendedor', equipe: 'Equipe C' }
  ],
  leads: [
    { id: 101, nome: 'Mariana Souza', empresa: 'Loja Estilo', telefone: '(11) 99999-0001', email: 'mariana@lojaestilo.com', origem: 'Instagram', valor: 3500, etapa: 'Qualificação', observacoes: 'Busca organizar carteira e histórico do cliente.', ownerId: 2, createdAt: '2026-03-16' },
    { id: 102, nome: 'Carlos Lima', empresa: 'Distribuidora CL', telefone: '(11) 99999-0002', email: 'carlos@dcl.com', origem: 'Indicação', valor: 8000, etapa: 'Proposta', observacoes: 'Pediu proposta com condições de pagamento.', ownerId: 3, createdAt: '2026-03-17' },
    { id: 103, nome: 'Fernanda Alves', empresa: 'Boutique FA', telefone: '(11) 99999-0003', email: 'fernanda@boutiquefa.com', origem: 'WhatsApp', valor: 4200, etapa: 'Fechado', observacoes: 'Conversão após reunião online.', ownerId: 2, createdAt: '2026-03-17' },
    { id: 104, nome: 'João Pereira', empresa: 'Constrular', telefone: '(11) 99999-0004', email: 'joao@constrular.com', origem: 'Site', valor: 12500, etapa: 'Negociação', observacoes: 'Comparando propostas de mercado.', ownerId: 4, createdAt: '2026-03-18' },
    { id: 105, nome: 'Sofia Melo', empresa: 'Studio S', telefone: '(11) 99999-0005', email: 'sofia@studios.com', origem: 'Feira/Evento', valor: 6100, etapa: 'Prospecção', observacoes: 'Primeiro contato no evento da escola.', ownerId: 3, createdAt: '2026-03-18' }
  ],
  activities: [
    { id: 201, leadId: 101, userId: 2, tipo: 'WhatsApp', data: '2026-03-16', status: 'Realizado', notas: 'Cliente demonstrou interesse e pediu mais detalhes.' },
    { id: 202, leadId: 102, userId: 3, tipo: 'Reunião', data: '2026-03-17', status: 'Avançou etapa', notas: 'Apresentação comercial concluída com boa aderência.' },
    { id: 203, leadId: 104, userId: 4, tipo: 'Ligação', data: '2026-03-18', status: 'Pendente retorno', notas: 'Cliente solicitou retorno após alinhamento interno.' }
  ]
};

let state = loadState();
let currentUser = loadSession();
let leadSearchTerm = '';

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(initialState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSession() {
  const saved = localStorage.getItem(SESSION_KEY);
  return saved ? JSON.parse(saved) : null;
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function structuredClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function isProfessor() {
  return currentUser?.perfil === 'Professor';
}

function getVisibleLeads() {
  if (!currentUser) return [];
  return isProfessor() ? state.leads : state.leads.filter(lead => lead.ownerId === currentUser.id);
}

function getVisibleActivities() {
  const visibleLeadIds = new Set(getVisibleLeads().map(lead => lead.id));
  return state.activities.filter(activity => visibleLeadIds.has(Number(activity.leadId)));
}

function getUserName(userId) {
  return state.users.find(user => user.id === Number(userId))?.nome || 'Não definido';
}

function populateStaticSelects() {
  const etapaSelect = document.getElementById('etapa');
  etapaSelect.innerHTML = ETAPAS.map(etapa => `<option>${etapa}</option>`).join('');

  const responsavel = document.getElementById('responsavel');
  responsavel.innerHTML = state.users
    .filter(user => user.perfil === 'Vendedor')
    .map(user => `<option value="${user.id}">${user.nome}</option>`)
    .join('');

  if (!isProfessor() && currentUser) {
    responsavel.value = String(currentUser.id);
    responsavel.disabled = true;
  } else {
    responsavel.disabled = false;
  }
}

function renderAuth() {
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');
  if (currentUser) {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    renderAll();
  } else {
    appScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
  }
}

function renderAll() {
  populateStaticSelects();
  renderProfile();
  renderMetrics();
  renderLeadsTable();
  renderKanban();
  renderActivityLeadOptions();
  renderActivities();
  renderClients();
  renderReports();
  renderTeachingQuestions();
  renderUsers();
}

function renderProfile() {
  document.getElementById('profileChip').innerHTML = `<strong>${currentUser.nome}</strong> · ${currentUser.perfil}`;
  document.getElementById('profileDetails').innerHTML = `
    <div class="info-card">
      <strong>${currentUser.nome}</strong>
      <p><span class="badge dark">${currentUser.perfil}</span></p>
      <p>Usuário: <strong>${currentUser.username}</strong></p>
      <p>Equipe: <strong>${currentUser.equipe}</strong></p>
    </div>
  `;
}

function renderMetrics() {
  const leads = getVisibleLeads();
  document.getElementById('metricLeads').textContent = leads.length;
  document.getElementById('metricClientes').textContent = leads.filter(lead => lead.etapa === 'Fechado').length;
  document.getElementById('metricAndamento').textContent = leads.filter(lead => !['Fechado', 'Perdido'].includes(lead.etapa)).length;
  document.getElementById('metricReceita').textContent = currency(leads.filter(lead => lead.etapa !== 'Perdido').reduce((sum, lead) => sum + Number(lead.valor || 0), 0));

  const funnelSummary = document.getElementById('funnelSummary');
  funnelSummary.innerHTML = '';
  ETAPAS.forEach(etapa => {
    const subset = leads.filter(lead => lead.etapa === etapa);
    const div = document.createElement('div');
    div.className = 'lead-card';
    div.innerHTML = `<strong>${etapa}</strong><p><span class="badge">${subset.length} lead(s)</span></p><small>Valor acumulado: ${currency(subset.reduce((sum, lead) => sum + Number(lead.valor || 0), 0))}</small>`;
    funnelSummary.appendChild(div);
  });
}

function renderLeadsTable() {
  const tbody = document.getElementById('leadTableBody');
  const term = leadSearchTerm.trim().toLowerCase();
  const leads = getVisibleLeads().filter(lead => {
    const text = `${lead.nome} ${lead.empresa} ${lead.origem}`.toLowerCase();
    return text.includes(term);
  });

  tbody.innerHTML = '';
  if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum lead encontrado.</td></tr>';
    return;
  }

  leads.forEach(lead => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${lead.nome}</strong><br><small>${lead.email}</small></td>
      <td>${lead.empresa}<br><small>${lead.telefone}</small></td>
      <td>${lead.origem}</td>
      <td>${lead.etapa}</td>
      <td>${getUserName(lead.ownerId)}</td>
      <td>${currency(lead.valor)}</td>
      <td>
        <div class="small-actions">
          <button onclick="moveLead(${lead.id}, -1)">◀</button>
          <button onclick="moveLead(${lead.id}, 1)">▶</button>
          ${isProfessor() ? `<button onclick="reassignLead(${lead.id})">Trocar responsável</button>` : ''}
          <button onclick="deleteLead(${lead.id})">Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderKanban() {
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = '';
  const leads = getVisibleLeads();
  ETAPAS.forEach(etapa => {
    const column = document.createElement('div');
    column.className = 'column';
    const leadsByStage = leads.filter(lead => lead.etapa === etapa);
    column.innerHTML = `<h3>${etapa}</h3><p>${leadsByStage.length} registro(s)</p>`;

    leadsByStage.forEach(lead => {
      const div = document.createElement('div');
      div.className = 'lead-card';
      div.innerHTML = `
        <strong>${lead.nome}</strong>
        <p>${lead.empresa}</p>
        <p><span class="badge">${lead.origem}</span> <span class="badge dark">${getUserName(lead.ownerId)}</span></p>
        <small>Valor: ${currency(lead.valor)}</small>
      `;
      column.appendChild(div);
    });

    board.appendChild(column);
  });
}

function renderActivityLeadOptions() {
  const select = document.getElementById('activityLead');
  const leads = getVisibleLeads();
  select.innerHTML = '<option value="">Selecione</option>' + leads.map(lead => `<option value="${lead.id}">${lead.nome} - ${lead.empresa}</option>`).join('');
}

function renderActivities() {
  const container = document.getElementById('activitiesList');
  const activities = [...getVisibleActivities()].sort((a, b) => new Date(b.data) - new Date(a.data));
  container.innerHTML = '';
  if (!activities.length) {
    container.innerHTML = '<p>Nenhuma atividade registrada nesta carteira.</p>';
    return;
  }

  activities.forEach(activity => {
    const lead = state.leads.find(lead => lead.id === Number(activity.leadId));
    const div = document.createElement('div');
    div.className = 'activity-card';
    div.innerHTML = `
      <strong>${activity.tipo}</strong> · ${activity.data}
      <p><span class="badge">${activity.status}</span> <span class="badge dark">Executado por ${getUserName(activity.userId)}</span></p>
      <small>${lead ? `${lead.nome} - ${lead.empresa}` : 'Lead removido'}</small>
      <p>${activity.notas}</p>
    `;
    container.appendChild(div);
  });
}

function renderClients() {
  const container = document.getElementById('clientesList');
  const clients = getVisibleLeads().filter(lead => lead.etapa === 'Fechado');
  container.innerHTML = '';
  if (!clients.length) {
    container.innerHTML = '<p>Nenhum cliente convertido ainda.</p>';
    return;
  }
  clients.forEach(client => {
    const div = document.createElement('div');
    div.className = 'client-card';
    const clientActivities = state.activities.filter(activity => Number(activity.leadId) === client.id).length;
    div.innerHTML = `
      <strong>${client.nome}</strong>
      <p>${client.empresa}</p>
      <p><span class="badge">Responsável: ${getUserName(client.ownerId)}</span></p>
      <p>Receita: <strong>${currency(client.valor)}</strong></p>
      <small>${clientActivities} atividade(s) registrada(s) no histórico.</small>
    `;
    container.appendChild(div);
  });
}

function bestLeadSource(leads) {
  const counts = {};
  leads.forEach(lead => counts[lead.origem] = (counts[lead.origem] || 0) + 1);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length ? `${sorted[0][0]} com ${sorted[0][1]} lead(s)` : 'Sem dados';
}

function conversionRate(leads) {
  if (!leads.length) return '0,0';
  const closed = leads.filter(lead => lead.etapa === 'Fechado').length;
  return ((closed / leads.length) * 100).toFixed(1);
}

function lossRate(leads) {
  if (!leads.length) return '0,0';
  const lost = leads.filter(lead => lead.etapa === 'Perdido').length;
  return ((lost / leads.length) * 100).toFixed(1);
}

function avgTicket(leads) {
  const closed = leads.filter(lead => lead.etapa === 'Fechado');
  if (!closed.length) return currency(0);
  return currency(closed.reduce((sum, lead) => sum + Number(lead.valor), 0) / closed.length);
}

function renderReports() {
  const container = document.getElementById('reportContent');
  const leads = getVisibleLeads();
  const activities = getVisibleActivities();
  container.innerHTML = `
    <div class="report-card"><strong>Taxa de conversão</strong><p>${conversionRate(leads)}% dos leads viraram clientes.</p></div>
    <div class="report-card"><strong>Taxa de perda</strong><p>${lossRate(leads)}% dos leads foram perdidos.</p></div>
    <div class="report-card"><strong>Ticket médio</strong><p>${avgTicket(leads)}</p></div>
    <div class="report-card"><strong>Melhor origem</strong><p>${bestLeadSource(leads)}</p></div>
    <div class="report-card"><strong>Intensidade de follow-up</strong><p>${activities.length} atividade(s) registrada(s) nesta carteira.</p></div>
  `;
}

function renderTeachingQuestions() {
  const container = document.getElementById('teachingQuestions');
  const questions = [
    'Quais etapas do funil concentram mais leads e por quê?',
    'Qual vendedor está com mais negócios em negociação?',
    'A origem do lead influencia na chance de fechamento?',
    'Um lead com muitas atividades está mais perto de fechar?',
    'Qual decisão o gestor pode tomar ao ver uma carteira parada?'
  ];
  container.innerHTML = questions.map(question => `<div class="report-card">${question}</div>`).join('');
}

function renderUsers() {
  const container = document.getElementById('usersList');
  const sellers = state.users.filter(user => user.perfil === 'Vendedor');
  container.innerHTML = state.users.map(user => {
    const portfolio = state.leads.filter(lead => lead.ownerId === user.id);
    const closed = portfolio.filter(lead => lead.etapa === 'Fechado').length;
    return `
      <div class="user-card">
        <strong>${user.nome}</strong>
        <p><span class="badge">${user.perfil}</span> <span class="badge dark">${user.equipe}</span></p>
        <p>Usuário: <strong>${user.username}</strong></p>
        <small>${user.perfil === 'Professor' ? 'Acompanha toda a operação.' : `${portfolio.length} lead(s) na carteira · ${closed} fechamento(s).`}</small>
      </div>
    `;
  }).join('');

  if (!sellers.length) {
    container.innerHTML = '<p>Nenhum vendedor cadastrado.</p>';
  }
}

function login(username, senha) {
  const user = state.users.find(item => item.username === username && item.senha === senha);
  if (!user) {
    alert('Usuário ou senha inválidos. Use as contas de demonstração.');
    return;
  }
  currentUser = { id: user.id, nome: user.nome, username: user.username, perfil: user.perfil, equipe: user.equipe };
  saveSession(currentUser);
  renderAuth();
}

function logout() {
  currentUser = null;
  clearSession();
  renderAuth();
}

function moveLead(id, direction) {
  const lead = state.leads.find(item => item.id === Number(id));
  if (!lead) return;
  if (!isProfessor() && lead.ownerId !== currentUser.id) return;
  const currentIndex = ETAPAS.indexOf(lead.etapa);
  const nextIndex = currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < ETAPAS.length) {
    lead.etapa = ETAPAS[nextIndex];
    saveState();
    renderAll();
  }
}
window.moveLead = moveLead;

function deleteLead(id) {
  const lead = state.leads.find(item => item.id === Number(id));
  if (!lead) return;
  if (!isProfessor() && lead.ownerId !== currentUser.id) return;
  state.leads = state.leads.filter(item => item.id !== Number(id));
  state.activities = state.activities.filter(activity => Number(activity.leadId) !== Number(id));
  saveState();
  renderAll();
}
window.deleteLead = deleteLead;

function reassignLead(id) {
  if (!isProfessor()) return;
  const lead = state.leads.find(item => item.id === Number(id));
  const sellers = state.users.filter(user => user.perfil === 'Vendedor');
  const options = sellers.map(user => `${user.id} - ${user.nome}`).join('\n');
  const selected = prompt(`Digite o ID do novo responsável:\n${options}`, lead.ownerId);
  if (!selected) return;
  const nextOwnerId = Number(selected);
  if (!sellers.some(user => user.id === nextOwnerId)) {
    alert('ID inválido.');
    return;
  }
  lead.ownerId = nextOwnerId;
  saveState();
  renderAll();
}
window.reassignLead = reassignLead;

function seedExampleData() {
  const sellers = state.users.filter(user => user.perfil === 'Vendedor');
  const origins = ['Instagram', 'WhatsApp', 'Indicação', 'Site', 'Feira/Evento'];
  const names = [
    ['Pedro Henrique', 'Mercado Atual'],
    ['Luiza Campos', 'Ótica Visão'],
    ['Rafaela Nunes', 'Casa Criativa'],
    ['Diego Sales', 'Max Distribuição'],
    ['Clara Teixeira', 'Ateliê Aurora']
  ];

  names.forEach((item, index) => {
    const seller = sellers[index % sellers.length];
    state.leads.push({
      id: Date.now() + index,
      nome: item[0],
      empresa: item[1],
      telefone: `(11) 98888-00${index + 10}`,
      email: `contato${index + 1}@empresa.com`,
      origem: origins[index % origins.length],
      valor: 3000 + (index * 1700),
      etapa: ETAPAS[index % ETAPAS.length],
      observacoes: 'Lead de exemplo gerado para prática em sala.',
      ownerId: seller.id,
      createdAt: '2026-03-18'
    });
  });

  saveState();
  renderAll();
}

function resetData() {
  state = structuredClone(initialState);
  saveState();
  renderAll();
}

// Eventos

document.getElementById('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  login(
    document.getElementById('loginUser').value.trim(),
    document.getElementById('loginPassword').value.trim()
  );
});

document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('seedBtn').addEventListener('click', seedExampleData);
document.getElementById('resetDataBtn').addEventListener('click', resetData);

document.getElementById('leadForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const ownerSelect = document.getElementById('responsavel');
  const ownerId = isProfessor() ? Number(ownerSelect.value) : currentUser.id;
  const lead = {
    id: Date.now(),
    nome: document.getElementById('nome').value.trim(),
    empresa: document.getElementById('empresa').value.trim(),
    telefone: document.getElementById('telefone').value.trim(),
    email: document.getElementById('email').value.trim(),
    origem: document.getElementById('origem').value,
    valor: Number(document.getElementById('valor').value),
    etapa: document.getElementById('etapa').value,
    observacoes: document.getElementById('observacoes').value.trim(),
    ownerId,
    createdAt: new Date().toISOString().slice(0, 10)
  };
  state.leads.push(lead);
  saveState();
  event.target.reset();
  populateStaticSelects();
  renderAll();
});

document.getElementById('activityForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const leadId = Number(document.getElementById('activityLead').value);
  const lead = state.leads.find(item => item.id === leadId);
  if (!lead) return;
  if (!isProfessor() && lead.ownerId !== currentUser.id) {
    alert('Você não pode registrar atividade para leads de outro vendedor.');
    return;
  }
  state.activities.push({
    id: Date.now(),
    leadId,
    userId: currentUser.id,
    tipo: document.getElementById('activityType').value,
    data: document.getElementById('activityDate').value,
    status: document.getElementById('activityStatus').value,
    notas: document.getElementById('activityNotes').value.trim()
  });
  saveState();
  event.target.reset();
  renderAll();
});

document.getElementById('leadSearch').addEventListener('input', (event) => {
  leadSearchTerm = event.target.value;
  renderLeadsTable();
});

document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

saveState();
renderAuth();
