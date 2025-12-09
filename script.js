/**
 * AI Adoption in UX - Interactive Dashboard
 * Navigation and interaction handling
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const quickLinks = document.querySelectorAll('.quick-link');
    const timelineItems = document.querySelectorAll('.timeline-item');

    // Initialize
    init();

    async function init() {
        // Set up event listeners
        setupNavigation();
        setupSidebarToggle();
        setupMobileMenu();
        setupHashNavigation();

        // Load designer data
        if (window.designerTracker) {
            await window.designerTracker.loadDesignersData();
        }

        // Handle initial hash
        handleHash();
    }

    /**
     * Navigation Setup
     */
    function setupNavigation() {
        // Sidebar nav items
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                navigateToPage(page);

                // Close mobile menu
                if (window.innerWidth <= 768) {
                    closeMobileMenu();
                }
            });
        });

        // Quick links on dashboard
        quickLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                navigateToPage(page);
            });
        });

        // Timeline items
        timelineItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                navigateToPage(page);
            });
        });
    }

    /**
     * Navigate to a specific page
     */
    function navigateToPage(pageId) {
        // Update URL hash
        window.location.hash = pageId;

        // Handle designer profile pages
        let actualPageId = pageId;
        let designerId = null;
        if (pageId.startsWith('designer/')) {
            designerId = pageId.replace('designer/', '');
            actualPageId = 'designer-profile';
        }

        // Update active states
        navItems.forEach(item => {
            item.classList.remove('active');
            const itemPage = item.getAttribute('data-page');
            if (itemPage === pageId || (itemPage === 'team-overview' && actualPageId === 'designer-profile')) {
                item.classList.add('active');
            }
        });

        // Show/hide pages with animation
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === actualPageId) {
                page.classList.add('active');
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Load designer tracker content
        if (window.designerTracker) {
            if (actualPageId === 'team-overview') {
                document.getElementById('team-overview-content').innerHTML = window.designerTracker.renderTeamOverview();
            } else if (actualPageId === 'designer-profile' && designerId) {
                const designer = window.designerTracker.getDesignerById(designerId);
                if (designer) {
                    document.getElementById('designer-profile-content').innerHTML = window.designerTracker.renderDesignerProfile(designer);
                } else {
                    document.getElementById('designer-profile-content').innerHTML = '<div class="empty-state glass-card"><p>Designer not found</p></div>';
                }
            }
        }
    }

    /**
     * Sidebar Toggle
     */
    function setupSidebarToggle() {
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
                const isCollapsed = sidebar.classList.contains('collapsed');

                // Update aria-expanded for accessibility
                this.setAttribute('aria-expanded', !isCollapsed);

                // Store preference
                localStorage.setItem('sidebarCollapsed', isCollapsed);
            });
        }

        // Restore sidebar state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed && window.innerWidth > 768) {
            sidebar.classList.add('collapsed');
            if (sidebarToggle) {
                sidebarToggle.setAttribute('aria-expanded', 'false');
            }
        }
    }

    /**
     * Mobile Menu
     */
    function setupMobileMenu() {
        // Create mobile toggle button
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.setAttribute('aria-label', 'Toggle menu');
        document.body.appendChild(mobileToggle);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Toggle menu
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            this.innerHTML = sidebar.classList.contains('open')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        // Close on overlay click
        overlay.addEventListener('click', closeMobileMenu);

        // Close on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });

        // Handle resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    function closeMobileMenu() {
        const overlay = document.querySelector('.sidebar-overlay');
        const mobileToggle = document.querySelector('.mobile-toggle');

        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        if (mobileToggle) mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }

    /**
     * Hash Navigation
     */
    function setupHashNavigation() {
        window.addEventListener('hashchange', handleHash);
    }

    function handleHash() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        navigateToPage(hash);
    }

    /**
     * Copy to Clipboard
     */
    window.copyPrompt = function(button) {
        const promptCard = button.closest('.prompt-card');
        const promptContent = promptCard.querySelector('.prompt-content');
        const text = promptContent.innerText;

        navigator.clipboard.writeText(text).then(() => {
            // Visual feedback
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.color = 'var(--status-success)';

            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    /**
     * Intersection Observer for animations
     */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards for scroll animation
    document.querySelectorAll('.glass-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    /**
     * Checklist interaction
     */
    document.querySelectorAll('.checklist-items li').forEach(item => {
        item.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-square')) {
                icon.classList.remove('fa-square');
                icon.classList.add('fa-square-check');
                icon.style.color = 'var(--status-success)';
            } else {
                icon.classList.remove('fa-square-check');
                icon.classList.add('fa-square');
                icon.style.color = '';
            }
        });
    });

    /**
     * Keyboard Navigation
     */
    document.addEventListener('keydown', function(e) {
        // Number keys for quick navigation
        if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const index = parseInt(e.key) - 1;
            const targetItem = navItems[index];
            if (targetItem) {
                const page = targetItem.getAttribute('data-page');
                navigateToPage(page);
            }
        }
    });

    /**
     * Smooth scrolling for anchor links
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.length > 1) {
                const target = document.querySelector(href);
                if (target && target.classList.contains('page')) {
                    // Already handled by navigation
                    return;
                }
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /**
     * Print styles helper
     */
    window.addEventListener('beforeprint', function() {
        // Show all pages for printing
        pages.forEach(page => page.classList.add('active'));
    });

    window.addEventListener('afterprint', function() {
        // Restore current page
        handleHash();
    });

    // Expose navigateTo globally for designer cards
    window.navigateTo = function(pageId) {
        navigateToPage(pageId);
    };
});

/**
 * Designer Tracker - Modal and Form Functions
 */

let currentEditDesignerId = null;

// Modal functions
function openAddDesignerModal() {
    currentEditDesignerId = null;
    document.getElementById('modal-title').textContent = 'Add Designer';
    document.getElementById('designer-form').reset();
    initializeToolProficiencyForm();
    initializeDynamicLists();
    document.getElementById('designer-modal').classList.add('active');
}

function openEditModal(designerId) {
    currentEditDesignerId = designerId;
    document.getElementById('modal-title').textContent = 'Edit Designer';
    const designer = window.designerTracker.getDesignerById(designerId);
    if (designer) {
        populateFormWithDesigner(designer);
    }
    document.getElementById('designer-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('designer-modal').classList.remove('active');
    currentEditDesignerId = null;
}

function openAddNoteModal(designerId) {
    document.getElementById('note-designer-id').value = designerId;
    document.getElementById('note-content').value = '';
    document.getElementById('note-modal').classList.add('active');
}

function closeNoteModal() {
    document.getElementById('note-modal').classList.remove('active');
}

function openAddActionModal(designerId) {
    document.getElementById('action-designer-id').value = designerId;
    document.getElementById('action-content').value = '';
    document.getElementById('action-owner').value = 'ditte';
    document.getElementById('action-modal').classList.add('active');
}

function closeActionModal() {
    document.getElementById('action-modal').classList.remove('active');
}

// Initialize tool proficiency form inputs
function initializeToolProficiencyForm() {
    const container = document.getElementById('tool-proficiency-inputs');
    if (!container || !window.designerTracker) return;

    const { TOOLS, PROFICIENCY_LEVELS } = window.designerTracker;
    let html = '';

    Object.keys(TOOLS).forEach(key => {
        const tool = TOOLS[key];
        html += `
            <div class="tool-input-group">
                <label>${tool.name}</label>
                <select id="tool-${key}-level">
                    ${Object.keys(PROFICIENCY_LEVELS).map(level =>
                        `<option value="${level}">${PROFICIENCY_LEVELS[level].label}</option>`
                    ).join('')}
                </select>
                <input type="text" id="tool-${key}-notes" placeholder="Notes...">
            </div>
        `;
    });

    container.innerHTML = html;
}

// Initialize dynamic lists with empty items
function initializeDynamicLists() {
    document.getElementById('pain-points-list').innerHTML = '';
    document.getElementById('goals-list').innerHTML = '';
    document.getElementById('action-items-list').innerHTML = '';
}

// Add pain point input
function addPainPoint(issue = '', details = '') {
    const container = document.getElementById('pain-points-list');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Issue</label>
            <input type="text" class="pain-issue" value="${issue}" placeholder="What's the problem?">
        </div>
        <div class="form-group">
            <label>Details</label>
            <input type="text" class="pain-details" value="${details}" placeholder="More context...">
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(div);
}

// Add goal input
function addGoal(goal = '', priority = 'medium') {
    const container = document.getElementById('goals-list');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Goal</label>
            <input type="text" class="goal-text" value="${goal}" placeholder="What do they want to achieve?">
        </div>
        <div class="form-group">
            <label>Priority</label>
            <select class="goal-priority">
                <option value="high" ${priority === 'high' ? 'selected' : ''}>High</option>
                <option value="medium" ${priority === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="low" ${priority === 'low' ? 'selected' : ''}>Low</option>
            </select>
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(div);
}

// Add action item input
function addActionItem(action = '', owner = 'ditte', status = 'pending') {
    const container = document.getElementById('action-items-list');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Action</label>
            <input type="text" class="action-text" value="${action}" placeholder="What needs to be done?">
        </div>
        <div class="form-group">
            <label>Owner</label>
            <select class="action-owner">
                <option value="ditte" ${owner === 'ditte' ? 'selected' : ''}>Ditte</option>
                <option value="designer" ${owner !== 'ditte' ? 'selected' : ''}>Designer</option>
            </select>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select class="action-status">
                <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="done" ${status === 'done' ? 'selected' : ''}>Done</option>
            </select>
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(div);
}

// Populate form with existing designer data
function populateFormWithDesigner(designer) {
    document.getElementById('designer-name').value = designer.name;
    document.getElementById('designer-team').value = designer.team;
    document.getElementById('designer-interview-date').value = designer.interviewDate;
    document.getElementById('designer-insight').value = designer.keyInsight || '';

    // Tool proficiency
    initializeToolProficiencyForm();
    Object.keys(designer.toolProficiency || {}).forEach(key => {
        const prof = designer.toolProficiency[key];
        const levelSelect = document.getElementById(`tool-${key}-level`);
        const notesInput = document.getElementById(`tool-${key}-notes`);
        if (levelSelect) levelSelect.value = prof.level || 'none';
        if (notesInput) notesInput.value = prof.notes || '';
    });

    // Pain points
    initializeDynamicLists();
    (designer.painPoints || []).forEach(p => addPainPoint(p.issue, p.details));

    // Goals
    (designer.goals || []).forEach(g => addGoal(g.goal, g.priority));

    // Action items
    (designer.actionItems || []).forEach(a => {
        const owner = a.owner === 'ditte' ? 'ditte' : 'designer';
        addActionItem(a.action, owner, a.status);
    });
}

// Handle designer form submit
function handleDesignerSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('designer-name').value;
    const team = document.getElementById('designer-team').value;
    const interviewDate = document.getElementById('designer-interview-date').value;
    const keyInsight = document.getElementById('designer-insight').value;

    // Collect tool proficiency
    const toolProficiency = {};
    Object.keys(window.designerTracker.TOOLS).forEach(key => {
        const level = document.getElementById(`tool-${key}-level`)?.value || 'none';
        const notes = document.getElementById(`tool-${key}-notes`)?.value || '';
        toolProficiency[key] = { level, notes };
    });

    // Collect pain points
    const painPoints = [];
    document.querySelectorAll('#pain-points-list .dynamic-list-item').forEach(item => {
        const issue = item.querySelector('.pain-issue')?.value;
        const details = item.querySelector('.pain-details')?.value;
        if (issue) painPoints.push({ issue, details });
    });

    // Collect goals
    const goals = [];
    document.querySelectorAll('#goals-list .dynamic-list-item').forEach(item => {
        const goal = item.querySelector('.goal-text')?.value;
        const priority = item.querySelector('.goal-priority')?.value;
        if (goal) goals.push({ goal, priority });
    });

    // Collect action items
    const actionItems = [];
    document.querySelectorAll('#action-items-list .dynamic-list-item').forEach(item => {
        const action = item.querySelector('.action-text')?.value;
        let owner = item.querySelector('.action-owner')?.value;
        const status = item.querySelector('.action-status')?.value;
        if (owner === 'designer') owner = name.toLowerCase();
        if (action) actionItems.push({ action, owner, status });
    });

    const designerData = {
        name,
        team,
        interviewDate,
        toolProficiency,
        painPoints,
        goals,
        actionItems,
        progressNotes: [],
        keyInsight
    };

    if (currentEditDesignerId) {
        // Update existing
        const existing = window.designerTracker.getDesignerById(currentEditDesignerId);
        designerData.progressNotes = existing.progressNotes || [];
        window.designerTracker.updateDesigner(currentEditDesignerId, designerData);
    } else {
        // Add new
        designerData.progressNotes = [{ date: new Date().toISOString().split('T')[0], note: 'Initial interview completed' }];
        window.designerTracker.addDesigner(designerData);
    }

    closeModal();
    window.designerTracker.refreshCurrentPage();
}

// Handle note form submit
function handleNoteSubmit(event) {
    event.preventDefault();
    const designerId = document.getElementById('note-designer-id').value;
    const note = document.getElementById('note-content').value;

    if (designerId && note) {
        window.designerTracker.addProgressNote(designerId, note);
        closeNoteModal();
        window.designerTracker.refreshCurrentPage();
    }
}

// Handle action form submit
function handleActionSubmit(event) {
    event.preventDefault();
    const designerId = document.getElementById('action-designer-id').value;
    const action = document.getElementById('action-content').value;
    let owner = document.getElementById('action-owner').value;

    const designer = window.designerTracker.getDesignerById(designerId);
    if (designer && action) {
        if (!owner) owner = designer.name.toLowerCase();
        designer.actionItems.push({ action, owner, status: 'pending' });
        window.designerTracker.saveDesignersData();
        closeActionModal();
        window.designerTracker.refreshCurrentPage();
    }
}

// Toggle action item status
function toggleActionStatus(designerId, actionIndex) {
    window.designerTracker.toggleActionStatus(designerId, actionIndex);
}

// Filter actions
function filterActions(filter) {
    window.designerTracker.filterActions(filter);
}

// Close modals on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
        closeNoteModal();
        closeActionModal();
    }
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
            closeNoteModal();
            closeActionModal();
        }
    });
});
