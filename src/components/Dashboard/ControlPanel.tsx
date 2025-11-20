import React from 'react';
import { Card, Title, Text, Button } from '@tremor/react';
import { AlertOctagon } from 'lucide-react';

interface ControlPanelProps {
  rodPosition: number;
  onRodChange: (value: number) => void;
  onScram: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  rodPosition,
  onRodChange,
  onScram
}) => {
  return (
    <Card className="bg-slate-900 ring-slate-800">
      <div className="flex justify-between items-center mb-4">
        <Title className="text-slate-200">Control Rod Actuation System</Title>
        <Button 
          size="xl" 
          color="red" 
          variant="primary"
          onClick={onScram}
          className="font-bold tracking-wider animate-pulse hover:animate-none"
        >
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-6 h-6" />
            SCRAM
          </div>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <Text className="text-slate-400">Rod Insertion Level</Text>
            <Text className="text-slate-200 font-mono">{rodPosition.toFixed(1)}%</Text>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.1"
            value={rodPosition} 
            onChange={(e) => onRodChange(parseFloat(e.target.value))}
            className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
            <span>WITHDRAWN (0%)</span>
            <span>INSERTED (100%)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {[0, 25, 50, 75, 100].map((val) => (
            <Button 
              key={val}
              size="xs" 
              variant="secondary" 
              color="slate"
              onClick={() => onRodChange(val)}
            >
              {val}%
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
