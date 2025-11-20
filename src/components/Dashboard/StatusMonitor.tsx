import React from 'react';
import { Card, Metric, Text, Flex, ProgressBar, Badge } from '@tremor/react';
import { Activity, Thermometer, Zap, AlertTriangle } from 'lucide-react';
import type { ReactorState } from '../../physics/reactorCore';

interface StatusMonitorProps {
  state: ReactorState;
}

export const StatusMonitor: React.FC<StatusMonitorProps> = ({ state }) => {
  // Helper to determine status color
  const getStatusColor = (val: number, type: 'temp' | 'power' | 'reactivity') => {
    if (type === 'temp') {
      if (val > 1000) return 'red';
      if (val > 800) return 'orange';
      return 'emerald';
    }
    if (type === 'power') {
      if (val > 110) return 'red';
      if (val > 100) return 'orange';
      return 'blue';
    }
    if (type === 'reactivity') {
      if (Math.abs(val) > 500) return 'yellow';
      return 'slate';
    }
    return 'slate';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* Power Card */}
      <Card className="bg-slate-900 ring-slate-800">
        <Flex alignItems="start">
          <div>
            <Text className="text-slate-400">Reactor Power</Text>
            <Metric className="text-slate-100">{state.power.toFixed(1)} MW</Metric>
          </div>
          <Zap className={`w-8 h-8 ${state.power > 100 ? 'text-red-500' : 'text-blue-500'}`} />
        </Flex>
        <ProgressBar 
          value={Math.min(state.power, 120)} 
          color={getStatusColor(state.power, 'power')} 
          className="mt-3" 
        />
      </Card>

      {/* Fuel Temp Card */}
      <Card className="bg-slate-900 ring-slate-800">
        <Flex alignItems="start">
          <div>
            <Text className="text-slate-400">Fuel Temperature</Text>
            <Metric className="text-slate-100">{state.fuelTemp.toFixed(0)} K</Metric>
          </div>
          <Thermometer className={`w-8 h-8 ${state.fuelTemp > 800 ? 'text-red-500' : 'text-emerald-500'}`} />
        </Flex>
        <ProgressBar 
          value={(state.fuelTemp / 1200) * 100} 
          color={getStatusColor(state.fuelTemp, 'temp')} 
          className="mt-3" 
        />
      </Card>

      {/* Reactivity Card */}
      <Card className="bg-slate-900 ring-slate-800">
        <Flex alignItems="start">
          <div>
            <Text className="text-slate-400">Net Reactivity</Text>
            <Flex justifyContent="start" className="space-x-2">
              <Metric className="text-slate-100">{state.reactivity.toFixed(0)} pcm</Metric>
              {Math.abs(state.reactivity) > 50 && (
                 <Badge color={state.reactivity > 0 ? 'red' : 'emerald'}>
                   {state.reactivity > 0 ? 'SUPER' : 'SUB'}
                 </Badge>
              )}
            </Flex>
          </div>
          <Activity className="w-8 h-8 text-slate-500" />
        </Flex>
        <div className="mt-4 flex justify-between text-slate-500 text-sm font-mono">
           <span>Control Rods:</span>
           <span>{state.controlRodPosition.toFixed(1)}%</span>
        </div>
      </Card>
    </div>
  );
};
