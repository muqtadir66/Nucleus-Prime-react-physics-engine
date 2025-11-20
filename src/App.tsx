import { useState, useEffect, useRef, useCallback } from 'react';
import { ReactorCore, type ReactorState } from './physics/reactorCore';
import { StatusMonitor } from './components/Dashboard/StatusMonitor';
import { ControlPanel } from './components/Dashboard/ControlPanel';
import { RealTimeGraph } from './components/Dashboard/RealTimeGraph';
import { Title, Text } from '@tremor/react';
import { Radiation } from 'lucide-react';

function App() {
  // Reactor Instance Ref (mutable, persistent)
  const reactorRef = useRef<ReactorCore>(new ReactorCore());
  
  // React State for UI updates
  const [currentState, setCurrentState] = useState<ReactorState>(reactorRef.current.step(0));
  const [history, setHistory] = useState<ReactorState[]>([]);
  const [rodPosition, setRodPosition] = useState(0);

  // Simulation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      // Time delta in seconds
      const dt = Math.min((time - lastTime) / 1000, 0.1); // cap dt to avoid explosion if lag
      lastTime = time;

      // Physics Step
      // Run multiple substeps for stability if dt is large? 
      // For now, simple single step since dt is small (~16ms)
      const newState = reactorRef.current.step(dt);

      setCurrentState(newState);
      
      setHistory(prev => {
        const newHistory = [...prev, newState];
        // Keep last 100 points (approx 2-5 seconds of data depending on update rate)
        // Actually let's decimate or keep more for a longer graph
        if (newHistory.length > 200) return newHistory.slice(newHistory.length - 200);
        return newHistory;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Handlers
  const handleRodChange = useCallback((val: number) => {
    setRodPosition(val);
    reactorRef.current.setControlRod(val);
  }, []);

  const handleScram = useCallback(() => {
    setRodPosition(100);
    reactorRef.current.scram();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl ring-1 ring-blue-500/50">
             <Radiation className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <div>
            <Title className="text-3xl text-slate-100 font-bold tracking-tight">
              NUCLEUS <span className="text-blue-500">PRIME</span>
            </Title>
            <Text className="text-slate-400">Real-Time Point Kinetics Simulator</Text>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col: Controls & Status */}
          <div className="lg:col-span-1 space-y-6">
            <StatusMonitor state={currentState} />
            <ControlPanel 
              rodPosition={rodPosition} 
              onRodChange={handleRodChange} 
              onScram={handleScram}
            />
          </div>

          {/* Right Col: Graphs */}
          <div className="lg:col-span-2">
            <RealTimeGraph data={history} />
            
            {/* Debug/Raw Data view could go here */}
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800 font-mono text-xs text-slate-500">
               <div className="grid grid-cols-2 gap-4">
                  <div>Sim Time: {currentState.time.toFixed(2)}s</div>
                  <div>DT: ~16ms (60 FPS)</div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;