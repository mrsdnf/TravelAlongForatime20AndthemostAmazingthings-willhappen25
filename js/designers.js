// Designer AI Competency Tracker - Data Management Module

const TOOLS = {
  gnpt: { name: 'GNPT', tier: 'internal', description: "Jabra's internal AI" },
  rovo: { name: 'Rovo', tier: 'internal', description: 'Confluence AI' },
  figmaAI: { name: 'Figma AI', tier: 'internal', description: 'Design tool AI' },
  copilot: { name: 'M365 Copilot', tier: 'internal', description: 'Microsoft 365 Copilot' },
  miroAI: { name: 'Miro AI', tier: 'internal', description: 'Collaboration board AI' },
  githubCopilot: { name: 'GitHub Copilot', tier: 'internal', description: 'Code assistant' },
  claude: { name: 'Claude', tier: 'external', description: 'Anthropic AI' },
  chatgpt: { name: 'ChatGPT', tier: 'external', description: 'OpenAI' },
  gemini: { name: 'Gemini', tier: 'external', description: 'Google AI' },
  lovable: { name: 'Lovable', tier: 'external', description: 'UI prototyping' }
};

const PROFICIENCY_LEVELS = {
  none: { label: 'Not Using', color: '#6b7280', order: 0 },
  minimal: { label: 'Tried Briefly', color: '#ef4444', order: 1 },
  learning: { label: 'Learning', color: '#f97316', order: 2 },
  occasional: { label: 'Occasional', color: '#eab308', order: 3 },
  confident: { label: 'Confident', color: '#22c55e', order: 4 },
  expert: { label: 'Expert', color: '#3b82f6', order: 5 }
};

const PRIORITIES = {
  high: { label: 'High', color: '#ef4444' },
  medium: { label: 'Medium', color: '#f97316' },
  low: { label: 'Low', color: '#6b7280' }
};

const STATUS = {
  pending: { label: 'Pending', color: '#6b7280' },
  'in-progress': { label: 'In Progress', color: '#f97316' },
  done: { label: 'Done', color: '#22c55e' }
};

// Data storage
let designersData = { designers: [] };

// Load data from JSON file
async function loadDesignersData() {
  try {
    const response = await fetch('data/designers.json');
    if (response.ok) {
      designersData = await response.json();
    }
  } catch (error) {
    console.log('No existing data found, starting fresh');
    designersData = { designers: [] };
  }
  return designersData;
}

// Save data - for static site, we'll use localStorage as backup
// In production, this would POST to a server
function saveDesignersData() {
  localStorage.setItem('designersData', JSON.stringify(designersData));
  // Download updated JSON for manual save
  console.log('Data saved to localStorage. To persist permanently, download the JSON.');
}

// Export data as downloadable JSON
function exportDesignersData() {
  const dataStr = JSON.stringify(designersData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'designers.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Get all designers
function getDesigners() {
  return designersData.designers;
}

// Get designer by ID
function getDesignerById(id) {
  return designersData.designers.find(d => d.id === id);
}

// Add new designer
function addDesigner(designer) {
  designer.id = designer.name.toLowerCase().replace(/\s+/g, '-');
  designer.lastUpdated = new Date().toISOString().split('T')[0];
  designersData.designers.push(designer);
  saveDesignersData();
  return designer;
}

// Update designer
function updateDesigner(id, updates) {
  const index = designersData.designers.findIndex(d => d.id === id);
  if (index !== -1) {
    designersData.designers[index] = {
      ...designersData.designers[index],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    saveDesignersData();
    return designersData.designers[index];
  }
  return null;
}

// Delete designer
function deleteDesigner(id) {
  const index = designersData.designers.findIndex(d => d.id === id);
  if (index !== -1) {
    designersData.designers.splice(index, 1);
    saveDesignersData();
    return true;
  }
  return false;
}

// Add progress note
function addProgressNote(designerId, note) {
  const designer = getDesignerById(designerId);
  if (designer) {
    designer.progressNotes.push({
      date: new Date().toISOString().split('T')[0],
      note: note
    });
    saveDesignersData();
    return true;
  }
  return false;
}

// Update action item status
function updateActionItemStatus(designerId, actionIndex, newStatus) {
  const designer = getDesignerById(designerId);
  if (designer && designer.actionItems[actionIndex]) {
    designer.actionItems[actionIndex].status = newStatus;
    saveDesignersData();
    return true;
  }
  return false;
}

// Get summary statistics
function getSummaryStats() {
  const designers = getDesigners();
  const totalDesigners = 10; // Target count
  const interviewedCount = designers.length;

  // Count pending action items
  let pendingActions = 0;
  let myActions = 0;
  designers.forEach(d => {
    d.actionItems.forEach(a => {
      if (a.status !== 'done') {
        pendingActions++;
        if (a.owner === 'ditte') myActions++;
      }
    });
  });

  // Most common pain points
  const painPointCounts = {};
  designers.forEach(d => {
    d.painPoints.forEach(p => {
      painPointCounts[p.issue] = (painPointCounts[p.issue] || 0) + 1;
    });
  });

  // Most requested tools/goals
  const goalCounts = {};
  designers.forEach(d => {
    d.goals.forEach(g => {
      goalCounts[g.goal] = (goalCounts[g.goal] || 0) + 1;
    });
  });

  return {
    totalDesigners,
    interviewedCount,
    pendingActions,
    myActions,
    painPointCounts,
    goalCounts
  };
}

// Get all action items across all designers
function getAllActionItems() {
  const items = [];
  getDesigners().forEach(d => {
    d.actionItems.forEach((a, index) => {
      items.push({
        ...a,
        designerId: d.id,
        designerName: d.name,
        actionIndex: index
      });
    });
  });
  return items;
}

// Render functions

function renderProficiencyBadge(level) {
  const prof = PROFICIENCY_LEVELS[level] || PROFICIENCY_LEVELS.none;
  return `<span class="proficiency-badge" style="background-color: ${prof.color}20; color: ${prof.color}; border: 1px solid ${prof.color}40;">${prof.label}</span>`;
}

function renderPriorityBadge(priority) {
  const prio = PRIORITIES[priority] || PRIORITIES.low;
  return `<span class="priority-badge" style="background-color: ${prio.color}20; color: ${prio.color};">${prio.label}</span>`;
}

function renderStatusBadge(status) {
  const stat = STATUS[status] || STATUS.pending;
  return `<span class="status-badge" style="background-color: ${stat.color}20; color: ${stat.color};">${stat.label}</span>`;
}

function renderOwnerBadge(owner) {
  const isMe = owner === 'ditte';
  const color = isMe ? '#8b5cf6' : '#6366f1';
  const label = isMe ? 'Ditte' : owner.charAt(0).toUpperCase() + owner.slice(1);
  return `<span class="owner-badge" style="background-color: ${color}20; color: ${color};">${label}</span>`;
}

function renderCompetencyMatrix() {
  const designers = getDesigners();
  const toolKeys = Object.keys(TOOLS);

  let html = `
    <div class="competency-matrix-wrapper">
      <table class="competency-matrix">
        <thead>
          <tr>
            <th class="designer-col">Designer</th>
            ${toolKeys.map(key => `<th class="tool-col" title="${TOOLS[key].description}">${TOOLS[key].name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  designers.forEach(d => {
    html += `<tr>
      <td class="designer-name"><a href="#designer/${d.id}">${d.name}</a><span class="team-label">${d.team}</span></td>
      ${toolKeys.map(key => {
        const prof = d.toolProficiency[key] || { level: 'none', notes: '' };
        const levelInfo = PROFICIENCY_LEVELS[prof.level];
        return `<td class="proficiency-cell" style="background-color: ${levelInfo.color}30;" title="${prof.notes || 'No notes'}">${levelInfo.label}</td>`;
      }).join('')}
    </tr>`;
  });

  html += `</tbody></table></div>`;
  return html;
}

function renderDesignerCard(designer) {
  const topAction = designer.actionItems.find(a => a.status !== 'done');
  return `
    <div class="designer-card glass-card clickable" onclick="navigateTo('designer/${designer.id}')">
      <div class="designer-card-header">
        <h3>${designer.name}</h3>
        <span class="team-badge">${designer.team}</span>
      </div>
      <p class="key-insight">${designer.keyInsight}</p>
      ${topAction ? `
        <div class="top-action">
          <span class="action-label">Next action:</span>
          ${renderOwnerBadge(topAction.owner)}
          <span class="action-text">${topAction.action}</span>
        </div>
      ` : '<p class="no-actions">No pending actions</p>'}
      <div class="card-footer">
        <span class="interview-date">Interviewed: ${designer.interviewDate}</span>
      </div>
    </div>
  `;
}

function renderActionItemsList(items, showDesigner = true) {
  if (items.length === 0) {
    return '<p class="empty-state">No action items</p>';
  }

  return `
    <div class="action-items-list">
      ${items.map(item => `
        <div class="action-item-row ${item.status === 'done' ? 'completed' : ''}">
          <button class="status-toggle" onclick="toggleActionStatus('${item.designerId}', ${item.actionIndex})" title="Toggle status">
            ${item.status === 'done' ? '✓' : '○'}
          </button>
          <div class="action-content">
            ${showDesigner ? `<span class="action-designer">${item.designerName}</span>` : ''}
            <span class="action-text">${item.action}</span>
          </div>
          ${renderOwnerBadge(item.owner)}
          ${renderStatusBadge(item.status)}
        </div>
      `).join('')}
    </div>
  `;
}

function renderDesignerProfile(designer) {
  const toolKeys = Object.keys(TOOLS);

  return `
    <div class="designer-profile">
      <div class="profile-header glass-card">
        <div class="profile-title">
          <h1>${designer.name}</h1>
          <span class="team-badge large">${designer.team}</span>
        </div>
        <div class="profile-meta">
          <span>Interviewed: ${designer.interviewDate}</span>
          <span>Updated: ${designer.lastUpdated}</span>
        </div>
        <button class="edit-btn" onclick="openEditModal('${designer.id}')">Edit Profile</button>
      </div>

      <div class="profile-insight glass-card">
        <h3>Key Insight</h3>
        <p>${designer.keyInsight}</p>
      </div>

      <div class="profile-section glass-card">
        <h3>Tool Proficiency</h3>
        <div class="tool-proficiency-grid">
          ${toolKeys.map(key => {
            const prof = designer.toolProficiency[key] || { level: 'none', notes: '' };
            return `
              <div class="tool-item">
                <div class="tool-header">
                  <span class="tool-name">${TOOLS[key].name}</span>
                  ${renderProficiencyBadge(prof.level)}
                </div>
                ${prof.notes ? `<p class="tool-notes">${prof.notes}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="profile-section glass-card">
        <h3>Pain Points</h3>
        <div class="pain-points-list">
          ${designer.painPoints.map(p => `
            <div class="pain-point-item">
              <strong>${p.issue}</strong>
              <p>${p.details}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="profile-section glass-card">
        <h3>Goals</h3>
        <div class="goals-list">
          ${designer.goals.map(g => `
            <div class="goal-item">
              ${renderPriorityBadge(g.priority)}
              <span>${g.goal}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="profile-section glass-card">
        <h3>Action Items</h3>
        ${renderActionItemsList(designer.actionItems.map((a, i) => ({
          ...a,
          designerId: designer.id,
          actionIndex: i
        })), false)}
        <button class="add-btn" onclick="openAddActionModal('${designer.id}')">+ Add Action</button>
      </div>

      <div class="profile-section glass-card">
        <h3>Progress Notes</h3>
        <div class="progress-timeline">
          ${designer.progressNotes.map(n => `
            <div class="progress-note">
              <span class="note-date">${n.date}</span>
              <p>${n.note}</p>
            </div>
          `).join('')}
        </div>
        <button class="add-btn" onclick="openAddNoteModal('${designer.id}')">+ Add Note</button>
      </div>
    </div>
  `;
}

function renderTeamOverview() {
  const stats = getSummaryStats();
  const designers = getDesigners();
  const allActions = getAllActionItems();

  return `
    <div class="team-overview">
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <span class="stat-number">${stats.interviewedCount}/${stats.totalDesigners}</span>
          <span class="stat-label">Designers Interviewed</span>
        </div>
        <div class="stat-card glass-card">
          <span class="stat-number">${stats.pendingActions}</span>
          <span class="stat-label">Pending Actions</span>
        </div>
        <div class="stat-card glass-card">
          <span class="stat-number">${stats.myActions}</span>
          <span class="stat-label">My Actions</span>
        </div>
      </div>

      <div class="section-header">
        <h2>Competency Matrix</h2>
      </div>
      ${renderCompetencyMatrix()}

      <div class="section-header">
        <h2>Designers</h2>
      </div>
      <div class="designers-grid">
        ${designers.map(d => renderDesignerCard(d)).join('')}
        ${designers.length < 10 ? `
          <div class="designer-card glass-card clickable empty-card" onclick="openAddDesignerModal()">
            <span class="add-icon">+</span>
            <span>Add Designer</span>
          </div>
        ` : ''}
      </div>

      <div class="section-header">
        <h2>All Actions</h2>
        <div class="filter-buttons">
          <button class="filter-btn active" onclick="filterActions('all')">All</button>
          <button class="filter-btn" onclick="filterActions('ditte')">Mine</button>
        </div>
      </div>
      ${renderActionItemsList(allActions)}
    </div>
  `;
}

// Action handlers
function toggleActionStatus(designerId, actionIndex) {
  const designer = getDesignerById(designerId);
  if (designer && designer.actionItems[actionIndex]) {
    const current = designer.actionItems[actionIndex].status;
    // Simple toggle: done <-> pending
    const newStatus = current === 'done' ? 'pending' : 'done';
    updateActionItemStatus(designerId, actionIndex, newStatus);
    refreshCurrentPage();
  }
}

function filterActions(filter) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const allActions = getAllActionItems();
  const filtered = filter === 'all' ? allActions : allActions.filter(a => a.owner === filter);

  const container = document.querySelector('.action-items-list').parentElement;
  container.innerHTML = renderActionItemsList(filtered);
}

// Navigation helper
function refreshCurrentPage() {
  const hash = window.location.hash || '#team-overview';
  if (hash === '#team-overview') {
    document.getElementById('team-overview-content').innerHTML = renderTeamOverview();
  } else if (hash.startsWith('#designer/')) {
    const id = hash.replace('#designer/', '');
    const designer = getDesignerById(id);
    if (designer) {
      document.getElementById('designer-profile-content').innerHTML = renderDesignerProfile(designer);
    }
  }
}

// Export for use in main script
window.designerTracker = {
  TOOLS,
  PROFICIENCY_LEVELS,
  PRIORITIES,
  STATUS,
  loadDesignersData,
  saveDesignersData,
  exportDesignersData,
  getDesigners,
  getDesignerById,
  addDesigner,
  updateDesigner,
  deleteDesigner,
  addProgressNote,
  updateActionItemStatus,
  getSummaryStats,
  getAllActionItems,
  renderTeamOverview,
  renderDesignerProfile,
  renderCompetencyMatrix,
  toggleActionStatus,
  filterActions,
  refreshCurrentPage
};
