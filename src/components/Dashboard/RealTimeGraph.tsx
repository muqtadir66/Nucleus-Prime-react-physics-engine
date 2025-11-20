import React from 'react';
import { Card, Title } from '@tremor/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ReactorState } from '../../physics/reactorCore';

interface RealTimeGraphProps {
  data: ReactorState[];
}

export const RealTimeGraph: React.FC<RealTimeGraphProps> = ({ data }) => {
  return (
    <Card className="bg-slate-900 ring-slate-800 h-96">
      <Title className="text-slate-200 mb-4">Physics Telemetry</Title>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="time" 
            type="number" 
            domain={['auto', 'auto']} 
            tickFormatter={(val) => val.toFixed(1)} 
            stroke="#94a3b8"
            tick={{fill: '#94a3b8'}}
          />
          <YAxis 
            yAxisId="power" 
            stroke="#3b82f6" 
            domain={[0, 'auto']} 
            label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', fill: '#3b82f6' }}
            tick={{fill: '#3b82f6'}}
          />
          <YAxis 
            yAxisId="temp" 
            orientation="right" 
            stroke="#ef4444" 
            domain={[250, 'auto']} 
            label={{ value: 'Fuel Temp (K)', angle: 90, position: 'insideRight', fill: '#ef4444' }}
            tick={{fill: '#ef4444'}}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
            labelStyle={{ color: '#94a3b8' }}
            labelFormatter={(label) => `Time: ${Number(label).toFixed(2)}s`}
          />
          <Line 
            yAxisId="power"
            type="monotone" 
            dataKey="power" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} // Disable animation for performance live updates
          />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="fuelTemp" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
