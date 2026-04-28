import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, useToast } from '../../components/UI';

export default function FinancialsManager() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      const { data } = await supabaseAdmin
        .from('content_blocks')
        .select('value')
        .eq('section_key', 'financials')
        .eq('block_key', 'sheet_url')
        .single();
      if (data?.value) {
        setSheetUrl(data.value);
        setSheetId(extractSheetId(data.value));
      }
    }
    load();
  }, []);

  function extractSheetId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  }

  function handleUrlChange(val) {
    setSheetUrl(val);
    setSheetId(extractSheetId(val));
    setTestResult(null);
  }

  async function testConnection() {
    if (!sheetId) {
      toast('Please enter a sheet URL first', 'error');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Overview`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text.toLowerCase().includes('key') ||
            text.includes('capital_committed')) {
          setTestResult({
            success: true,
            message: 'Connected successfully! Overview tab found and readable.'
          });
        } else {
          setTestResult({
            success: false,
            message: 'Sheet is accessible but Overview tab was not found. Check tab names match exactly.'
          });
        }
      } else {
        setTestResult({
          success: false,
          message: 'Cannot access sheet. Make sure sharing is set to Anyone with the link can view.'
        });
      }
    } catch(e) {
      setTestResult({
        success: false,
        message: 'Connection failed. Check the URL and sharing settings.'
      });
    }
    setTesting(false);
  }

  async function save() {
    if (!sheetUrl) {
      toast('Please enter a sheet URL', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabaseAdmin
      .from('content_blocks')
      .upsert({
        section_key: 'financials',
        block_key: 'sheet_url',
        value: sheetUrl,
        value_type: 'url',
        label: 'Google Sheet URL',
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_key,block_key' });
    setSaving(false);
    if (error) {
      toast('Save failed: ' + error.message, 'error');
    } else {
      toast('Sheet URL saved ✓');
    }
  }

  const TABS = [
    { name: 'Overview', cols: 'Key, Value, Label, Currency' },
    { name: 'Deployment', cols: 'Year, Deployed, Committed' },
    { name: 'Portfolio', cols: 'Stage, Count, Color' },
    { name: 'IRR', cols: 'Month, IRR' },
    { name: 'PL (P&L)', cols: 'Metric, FY25, FY26, FY27, Growth_FY26, Type' },
    { name: 'Funds', cols: 'Name, Stage, Status, Investments, Color' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 17, fontWeight: 500,
          color: 'var(--text)', marginBottom: 6 }}>
          Financials Manager
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)',
          lineHeight: 1.6 }}>
          Connect your Google Sheet to power the financial
          dashboard shown to investors. Update the Google Sheet
          data directly — changes reflect on the investor portal
          within 1 minute.
        </div>
      </div>

      {/* Connection Card */}
      <div style={{ background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: 24,
        marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 500,
          color: 'var(--text)', marginBottom: 16 }}>
          Google Sheet Connection
        </div>

        {/* URL Input */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 500,
            color: 'var(--text3)', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 6 }}>
            Google Sheet URL
          </div>
          <input
            type="text"
            value={sheetUrl}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: 8, color: 'var(--text)',
              fontSize: 13, outline: 'none',
              fontFamily: 'var(--sans)',
              marginBottom: 6
            }}
            onFocus={e =>
              e.target.style.borderColor = 'var(--gold)'}
            onBlur={e =>
              e.target.style.borderColor = 'var(--border2)'}
          />
          <div style={{ fontSize: 11,
            color: 'var(--text3)', marginBottom: 4 }}>
            Paste the full Google Sheet URL. Make sure
            sharing is set to Anyone with the link can view.
          </div>
          {sheetId && (
            <div style={{ fontSize: 12,
              color: 'var(--gold)',
              fontFamily: 'var(--mono)' }}>
              Sheet ID: {sheetId}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex',
          gap: 12, marginTop: 16 }}>
          <Btn variant="ghost"
            disabled={testing}
            onClick={testConnection}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Btn>
          <Btn variant="gold"
            disabled={saving}
            onClick={save}>
            {saving ? 'Saving...' : 'Save'}
          </Btn>
        </div>

        {/* Test Result */}
        {testResult && (
          <div style={{
            marginTop: 12, padding: '10px 16px',
            borderRadius: 8, fontSize: 13,
            background: testResult.success
              ? 'rgba(74,174,140,0.1)'
              : 'rgba(224,92,74,0.1)',
            border: `1px solid ${testResult.success
              ? 'rgba(74,174,140,0.3)'
              : 'rgba(224,92,74,0.3)'}`,
            color: testResult.success
              ? '#6fcfb0' : '#f08070'
          }}>
            {testResult.success ? '✓ ' : '✕ '}
            {testResult.message}
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: 24,
        marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500,
          color: 'var(--text)', marginBottom: 16 }}>
          How it works
        </div>
        {[
          'Create your Google Sheet with the 6 required tabs shown below',
          'Set sharing to Anyone with the link can view in Google Sheets',
          'Paste the sheet URL above and click Save',
          'Click Test Connection to verify it works',
          'Investors see live data — update the sheet anytime for instant changes',
          'Finance team manages all data in Google Sheets, no admin login needed',
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12,
            alignItems: 'flex-start',
            marginBottom: 12 }}>
            <div style={{
              width: 24, height: 24,
              borderRadius: '50%', flexShrink: 0,
              background: 'rgba(0,180,166,0.1)',
              border: '1px solid rgba(0,180,166,0.3)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12, color: '#00B4A6',
              fontWeight: 500
            }}>{i + 1}</div>
            <div style={{ fontSize: 13,
              color: 'var(--text2)',
              lineHeight: 1.6, paddingTop: 2 }}>
              {step}
            </div>
          </div>
        ))}
      </div>

      {/* Sheet Structure */}
      <div style={{
        background: 'rgba(0,180,166,0.04)',
        border: '1px solid rgba(0,180,166,0.15)',
        borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500,
          color: '#00B4A6', marginBottom: 12 }}>
          Required Sheet Structure
        </div>
        <table style={{
          width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Tab Name', 'Required Columns'].map(h => (
                <th key={h} style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 11, fontWeight: 500,
                  color: 'var(--text3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg3)'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABS.map(tab => (
              <tr key={tab.name}>
                <td style={{
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#00B4A6',
                  fontFamily: 'var(--mono)',
                  borderBottom: '1px solid var(--border)',
                  fontWeight: 500
                }}>{tab.name}</td>
                <td style={{
                  padding: '10px 12px',
                  fontSize: 12,
                  color: 'var(--text2)',
                  borderBottom: '1px solid var(--border)',
                  fontFamily: 'var(--mono)'
                }}>{tab.cols}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
