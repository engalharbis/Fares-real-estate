import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ReferenceLine,
} from 'recharts'
import { calcCashFlowProjection, calcTotalProjectCost, fmtCurrency } from './calculator.js'

const GOLD   = '#D4A017'
const GOLD2  = '#F0C94A'
const EMERALD = '#10B981'
const RED    = '#EF4444'
const BLUE   = '#3B82F6'
const GRAY   = '#4B5563'

export function CostBreakdownChart({ project, results }) {
  const { construction } = calcTotalProjectCost(project.costs, project.propertyInfo.builtUpArea || 0)
  const c = project.costs
  const data = [
    { name: 'الأرض',             value: c.landCost || 0 },
    { name: 'البناء',             value: construction },
    { name: 'التصميم والهندسة',  value: c.designFees || 0 },
    { name: 'التراخيص',          value: c.permitsFees || 0 },
    { name: 'البنية التحتية',    value: c.infrastructure || 0 },
    { name: 'التشطيب',           value: c.finishingCosts || 0 },
    { name: 'أخرى',              value: (c.civilDefense||0)+(c.elevators||0)+(c.marketingCosts||0)+(c.preOperating||0)+results.contingency },
  ].filter(d => d.value > 0)

  const COLORS = [GOLD, GOLD2, BLUE, EMERALD, '#8B5CF6', '#F59E0B', GRAY]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      const pct = results.totalCost > 0 ? ((d.value / results.totalCost) * 100).toFixed(1) : '0'
      return (
        <div style={{ background:'#1c1c21', border:'1px solid #3a3a43', borderRadius:'12px', padding:'10px', fontSize:'12px' }}>
          <p style={{ color:'#fff', fontWeight:600 }}>{d.name}</p>
          <p style={{ color:'#D4A017' }}>{fmtCurrency(d.value)}</p>
          <p style={{ color:'#9ca3af' }}>{pct}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-300 mb-3">توزيع التكاليف</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-gray-400 text-xs truncate">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function IncomeVsExpenseChart({ results }) {
  const data = [
    { name: 'الإيرادات',  value: Math.round(results.egi) },
    { name: 'المصاريف',   value: Math.round(results.totalOpex) },
    { name: 'NOI',        value: Math.round(results.noi) },
    { name: 'تدفق نقدي', value: Math.round(results.cashFlowAfter) },
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background:'#1c1c21', border:'1px solid #3a3a43', borderRadius:'12px', padding:'10px', fontSize:'12px' }}>
          <p style={{ color:'#fff', fontWeight:600 }}>{payload[0].payload.name}</p>
          <p style={{ color:'#D4A017' }}>{fmtCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-300 mb-3">الإيرادات مقابل المصاريف</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top:5, right:5, left:5, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e35" vertical={false} />
          <XAxis dataKey="name" tick={{ fill:'#9CA3AF', fontSize:11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6,6,0,0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.value < 0 ? RED : i === 0 ? EMERALD : i === 1 ? RED : GOLD} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CashFlowChart({ project, results }) {
  const data = calcCashFlowProjection(project, results).map(d => ({
    year:     `س${d.year}`,
    noi:      Math.round(d.noi),
    cashFlow: Math.round(d.cashFlow),
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background:'#1c1c21', border:'1px solid #3a3a43', borderRadius:'12px', padding:'10px', fontSize:'12px' }}>
          <p style={{ color:'#9ca3af' }}>{label}</p>
          {payload.map(p => (
            <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtCurrency(p.value)}</p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-300 mb-3">التدفق النقدي عبر السنوات</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top:5, right:5, left:5, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e35" />
          <XAxis dataKey="year" tick={{ fill:'#9CA3AF', fontSize:10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke={GRAY} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="noi"      stroke={EMERALD} strokeWidth={2} dot={false} name="NOI" />
          <Line type="monotone" dataKey="cashFlow" stroke={GOLD}    strokeWidth={2} dot={false} name="التدفق النقدي" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ScenarioChart({ scenarios }) {
  const data = scenarios.map(s => ({
    name: s.label,
    roi:  parseFloat(s.results.roi.toFixed(1)),
  }))
  const COLORS_S = ['#F59E0B', BLUE, EMERALD]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background:'#1c1c21', border:'1px solid #3a3a43', borderRadius:'12px', padding:'10px', fontSize:'12px' }}>
          <p style={{ color:'#fff', fontWeight:600 }}>{label}</p>
          <p style={{ color:GOLD }}>ROI: {payload[0].value}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-300 mb-3">مقارنة السيناريوهات</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top:5, right:5, left:5, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e35" vertical={false} />
          <XAxis dataKey="name" tick={{ fill:'#9CA3AF', fontSize:11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="roi" name="ROI" radius={[4,4,0,0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS_S[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
