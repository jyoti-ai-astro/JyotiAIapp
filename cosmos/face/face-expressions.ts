/**
 * Face Expressions
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * Dynamic Avatar Face Engine (E21)
 * 
 * Expression presets with blend shape values
 */

export type ExpressionName =
  | 'neutral'
  | 'warm-smile'
  | 'calm-focus'
  | 'compassion-mode'
  | 'blessing-smile';

export interface ExpressionParams {
  brow: number; // -1 (lowered) to 1 (raised)
  eye: number; // 0 (closed) to 1 (open)
  cheek: number; // 0 (relaxed) to 1 (puffed)
  mouthCurve: number; // -1 (frown) to 1 (smile)
  glow: number; // 0 to 1 (expression glow intensity)
}

export interface Expression {
  name: ExpressionName;
  params: ExpressionParams;
  priority: number; // Higher priority overrides lower
}

export class FaceExpressions {
  private expressions: Map<ExpressionName, Expression> = new Map();
  private currentExpression: ExpressionName = 'neutral';
  private targetExpression: ExpressionName = 'neutral';
  private blendProgress: number = 0;
  private blendSpeed: number = 3.0; // 0.3-0.5s transition

  constructor() {
    // Initialize expression presets
    this.expressions.set('neutral', {
      name: 'neutral',
      params: {
        brow: 0.0,
        eye: 0.7,
        cheek: 0.0,
        mouthCurve: 0.0,
        glow: 0.2,
      },
      priority: 0,
    });

    this.expressions.set('warm-smile', {
      name: 'warm-smile',
      params: {
        brow: 0.2,
        eye: 0.8,
        cheek: 0.4,
        mouthCurve: 0.6,
        glow: 0.5,
      },
      priority: 2,
    });

    this.expressions.set('calm-focus', {
      name: 'calm-focus',
      params: {
        brow: 0.1,
        eye: 0.9,
        cheek: 0.1,
        mouthCurve: 0.2,
        glow: 0.4,
      },
      priority: 3,
    });

    this.expressions.set('compassion-mode', {
      name: 'compassion-mode',
      params: {
        brow: 0.3,
        eye: 0.85,
        cheek: 0.3,
        mouthCurve: 0.4,
        glow: 0.6,
      },
      priority: 4,
    });

    this.expressions.set('blessing-smile', {
      name: 'blessing-smile',
      params: {
        brow: 0.4,
        eye: 1.0,
        cheek: 0.6,
        mouthCurve: 0.8,
        glow: 1.0,
      },
      priority: 5, // Highest priority
    });
  }

  /**
   * Set target expression
   */
  setExpression(name: ExpressionName): void {
    const expression = this.expressions.get(name);
    if (!expression) return;

    // Check priority
    const currentExpr = this.expressions.get(this.currentExpression);
    if (currentExpr && expression.priority < currentExpr.priority) {
      // Lower priority, don't override
      return;
    }

    this.targetExpression = name;
    this.blendProgress = 0;
  }

  /**
   * Get current blended expression
   */
  getCurrentExpression(deltaTime: number): ExpressionParams {
    // Update blend progress
    if (this.currentExpression !== this.targetExpression) {
      this.blendProgress += this.blendSpeed * deltaTime;
      if (this.blendProgress >= 1.0) {
        this.blendProgress = 1.0;
        this.currentExpression = this.targetExpression;
      }
    }

    const current = this.expressions.get(this.currentExpression);
    const target = this.expressions.get(this.targetExpression);

    if (!current || !target) {
      return this.expressions.get('neutral')!.params;
    }

    // Smooth lerp between expressions
    const t = this.blendProgress;
    const smoothT = t * t * (3 - 2 * t); // Smoothstep

    return {
      brow: current.params.brow + (target.params.brow - current.params.brow) * smoothT,
      eye: current.params.eye + (target.params.eye - current.params.eye) * smoothT,
      cheek: current.params.cheek + (target.params.cheek - current.params.cheek) * smoothT,
      mouthCurve: current.params.mouthCurve + (target.params.mouthCurve - current.params.mouthCurve) * smoothT,
      glow: current.params.glow + (target.params.glow - current.params.glow) * smoothT,
    };
  }

  /**
   * Trigger blessing expression
   */
  triggerBlessingExpression(): void {
    this.setExpression('blessing-smile');
  }

  /**
   * Reset to neutral
   */
  resetExpression(): void {
    this.setExpression('neutral');
  }

  /**
   * Get expression by priority
   */
  getExpressionByPriority(priority: number): ExpressionName | null {
    for (const [name, expr] of this.expressions) {
      if (expr.priority === priority) {
        return name;
      }
    }
    return null;
  }
}

