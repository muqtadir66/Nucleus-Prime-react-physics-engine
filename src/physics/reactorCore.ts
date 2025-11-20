// src/physics/reactorCore.ts

export interface ReactorState {
  time: number; 
  power: number; 
  fuelTemp: number; 
  coolantTemp: number; 
  reactivity: number; 
  controlRodPosition: number; 
}

export class ReactorCore {
  // --- PHYSICS CONSTANTS ---
  private readonly BETA = [0.000215, 0.001424, 0.001274, 0.002568, 0.000748, 0.000273];
  private readonly LAMBDA = [0.0124, 0.0305, 0.111, 0.301, 1.14, 3.01];
  private readonly TOTAL_BETA = 0.0065;
  private readonly GEN_TIME = 0.00008; // seconds

  // --- TUNING ---
  // Base Excess: The fuel naturally wants to go to +500 pcm (Supercritical)
  private readonly BASE_EXCESS_REACTIVITY = 0.005; 
  // Rod Worth: The rods provide -1500 pcm (Strong enough to shutdown)
  private readonly TOTAL_ROD_WORTH = 0.015; 

  // Feedback
  private readonly ALPHA_FUEL = -1.5e-5;     
  private readonly ALPHA_COOLANT = -5.0e-5;  

  // Heat Transfer
  private readonly K_FUEL_CLAD = 800.0;  
  private readonly MASS_FUEL = 1000.0; 
  private readonly CP_FUEL = 300.0; 
  private readonly CP_COOLANT = 4000.0; 
  private readonly MASS_COOLANT = 2000.0;

  // State
  private neutronDensity: number = 100.0; 
  private precursors: number[] = [0, 0, 0, 0, 0, 0];
  private fuelTemp: number = 600; 
  private coolantTemp: number = 550; 
  private time: number = 0;
  private rodPosition: number = 0; 

  constructor() {
    for (let i = 0; i < 6; i++) {
      this.precursors[i] = (this.BETA[i] * this.neutronDensity) / (this.LAMBDA[i] * this.GEN_TIME);
    }
  }

  public setControlRod(position: number) {
    this.rodPosition = Math.max(0, Math.min(100, position));
  }

  public scram() {
    this.rodPosition = 100;
  }

  public step(dt: number): ReactorState {
    this.time += dt;

    // --- STABILITY FIX: SUB-STEPPING ---
    // We slice the 16ms frame into 100 tiny 0.16ms physics steps
    // This prevents the "Explosion" caused by stiff differential equations.
    const SUB_STEPS = 100;
    const subDt = dt / SUB_STEPS;

    for (let s = 0; s < SUB_STEPS; s++) {
      this.physicsStep(subDt);
    }

    return {
      time: this.time,
      power: this.neutronDensity,
      fuelTemp: this.fuelTemp,
      coolantTemp: this.coolantTemp,
      reactivity: this.calculateReactivity() * 100000, 
      controlRodPosition: this.rodPosition
    };
  }

  // Helper to calculate current reactivity (used for display and physics)
  private calculateReactivity(): number {
    const rodInsertionFraction = this.rodPosition / 100;
    const rodReactivity = rodInsertionFraction * this.TOTAL_ROD_WORTH;
    const rhoFeedback = 
      this.ALPHA_FUEL * (this.fuelTemp - 600) + 
      this.ALPHA_COOLANT * (this.coolantTemp - 550);
    return this.BASE_EXCESS_REACTIVITY - rodReactivity + rhoFeedback;
  }

  // The actual math, run 100x per frame
  private physicsStep(dt: number) {
    const rhoTotal = this.calculateReactivity();

    // Point Kinetics
    let sumPrecursors = 0;
    for (let i = 0; i < 6; i++) {
      sumPrecursors += this.LAMBDA[i] * this.precursors[i];
    }

    const dndt = ((rhoTotal - this.TOTAL_BETA) / this.GEN_TIME) * this.neutronDensity + sumPrecursors;
    
    for (let i = 0; i < 6; i++) {
      const dCidt = (this.BETA[i] / this.GEN_TIME) * this.neutronDensity - this.LAMBDA[i] * this.precursors[i];
      this.precursors[i] += dCidt * dt;
    }

    this.neutronDensity += dndt * dt;
    if (this.neutronDensity < 1e-10) this.neutronDensity = 1e-10;

    // Thermal Hydraulics
    const power = this.neutronDensity;
    const heatTransferFuelToCoolant = this.K_FUEL_CLAD * (this.fuelTemp - this.coolantTemp);
    const heatRemovalToSink = 500.0 * (this.coolantTemp - 290.0); 

    const dTf = (power * 1000 - heatTransferFuelToCoolant) / (this.MASS_FUEL * this.CP_FUEL);
    const dTc = (heatTransferFuelToCoolant - heatRemovalToSink) / (this.MASS_COOLANT * this.CP_COOLANT);

    this.fuelTemp += dTf * dt;
    this.coolantTemp += dTc * dt;
  }
}