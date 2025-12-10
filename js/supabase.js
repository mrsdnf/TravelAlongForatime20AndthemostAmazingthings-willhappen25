// Supabase Configuration
const SUPABASE_URL = 'https://psbcffqpyboqujjziabv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYmNmZnFweWJvcXVqanppYWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTQ4NzUsImV4cCI6MjA4MDkzMDg3NX0.uffqISGy1z_4Pu0J645Wrwf3OHgxxqNznFwO7u2BI20';

// Supabase client helper
const supabase = {
  async fetch(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation'
    };

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase error: ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  // Get all designers
  async getDesigners() {
    return this.fetch('designers?select=*&order=name');
  },

  // Get single designer by ID
  async getDesigner(id) {
    const data = await this.fetch(`designers?id=eq.${id}`);
    return data?.[0] || null;
  },

  // Create new designer
  async createDesigner(designer) {
    const dbDesigner = this.toDbFormat(designer);
    const data = await this.fetch('designers', {
      method: 'POST',
      body: JSON.stringify(dbDesigner)
    });
    return data?.[0] ? this.fromDbFormat(data[0]) : null;
  },

  // Update designer
  async updateDesigner(id, designer) {
    const dbDesigner = this.toDbFormat(designer);
    const data = await this.fetch(`designers?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dbDesigner)
    });
    return data?.[0] ? this.fromDbFormat(data[0]) : null;
  },

  // Delete designer
  async deleteDesigner(id) {
    await this.fetch(`designers?id=eq.${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  // Convert from app format (camelCase) to DB format (snake_case)
  toDbFormat(designer) {
    return {
      id: designer.id,
      name: designer.name,
      team: designer.team || null,
      interview_date: designer.interviewDate || null,
      last_updated: designer.lastUpdated || new Date().toISOString().split('T')[0],
      tool_proficiency: designer.toolProficiency || {},
      pain_points: designer.painPoints || [],
      goals: designer.goals || [],
      action_items: designer.actionItems || [],
      progress_notes: designer.progressNotes || [],
      key_insight: designer.keyInsight || null
    };
  },

  // Convert from DB format (snake_case) to app format (camelCase)
  fromDbFormat(row) {
    return {
      id: row.id,
      name: row.name,
      team: row.team || '',
      interviewDate: row.interview_date || '',
      lastUpdated: row.last_updated || '',
      toolProficiency: row.tool_proficiency || {},
      painPoints: row.pain_points || [],
      goals: row.goals || [],
      actionItems: row.action_items || [],
      progressNotes: row.progress_notes || [],
      keyInsight: row.key_insight || ''
    };
  }
};

// Export for use in other files
window.supabaseClient = supabase;
