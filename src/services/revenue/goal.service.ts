import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';

export class GoalService {
  constructor(private eventBus: EventBus, private logger: Logger) {}

  async createGoal(
    companyId: string,
    metric: string,
    targetValue: number,
    period: 'monthly' | 'quarterly' | 'yearly',
    endDate: Date
  ) {
    const goal = await prisma.revenueGoal.create({
      data: {
        companyId,
        metric,
        targetValue: new Decimal(targetValue),
        currentValue: new Decimal(0),
        period,
        endDate,
        status: 'IN_PROGRESS',
      },
    });

    this.eventBus.emit('goal:created', { companyId, goalId: goal.id, metric });
    return goal;
  }

  async getGoal(goalId: string, companyId: string) {
    const goal = await prisma.revenueGoal.findUnique({ where: { id: goalId } });
    if (!goal || goal.companyId !== companyId) return null;
    return goal;
  }

  async listGoals(companyId: string, status?: 'IN_PROGRESS' | 'ACHIEVED' | 'FAILED') {
    return prisma.revenueGoal.findMany({
      where: { companyId, status },
      orderBy: { endDate: 'asc' },
    });
  }

  async updateProgress(goalId: string, currentValue: number) {
    const goal = await prisma.revenueGoal.findUnique({ where: { id: goalId } });
    if (!goal) return null;

    const newCurrent = new Decimal(currentValue);
    const isAchieved = newCurrent.gte(goal.targetValue);
    const progress = newCurrent.div(goal.targetValue).times(100).toNumber();

    const updated = await prisma.revenueGoal.update({
      where: { id: goalId },
      data: {
        currentValue: newCurrent,
        status: isAchieved ? 'ACHIEVED' : 'IN_PROGRESS',
      },
    });

    if (progress >= 100) {
      this.eventBus.emit('goal:achieved', {
        companyId: goal.companyId,
        goalId,
        metric: goal.metric,
      });
    }

    return { ...updated, progress };
  }

  async completeGoal(goalId: string, companyId: string) {
    const goal = await this.getGoal(goalId, companyId);
    if (!goal) return null;

    const updated = await prisma.revenueGoal.update({
      where: { id: goalId },
      data: { status: 'ACHIEVED' },
    });

    this.eventBus.emit('goal:completed', { companyId, goalId, metric: goal.metric });
    return updated;
  }

  async failGoal(goalId: string, companyId: string, reason?: string) {
    const goal = await this.getGoal(goalId, companyId);
    if (!goal) return null;

    const updated = await prisma.revenueGoal.update({
      where: { id: goalId },
      data: { status: 'FAILED' },
    });

    this.eventBus.emit('goal:failed', { companyId, goalId, metric: goal.metric, reason });
    return updated;
  }

  async getProgress(companyId: string) {
    const goals = await this.listGoals(companyId, 'IN_PROGRESS');
    return goals.map((g) => ({
      id: g.id,
      metric: g.metric,
      target: g.targetValue.toNumber(),
      current: g.currentValue.toNumber(),
      progress: (g.currentValue.toNumber() / g.targetValue.toNumber()) * 100,
      remaining: (g.targetValue.toNumber() - g.currentValue.toNumber()) / g.targetValue.toNumber() * 100,
      daysRemaining: Math.ceil((g.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    }));
  }

  async deleteGoal(goalId: string, companyId: string) {
    const goal = await this.getGoal(goalId, companyId);
    if (!goal) return null;

    await prisma.revenueGoal.delete({ where: { id: goalId } });
    this.eventBus.emit('goal:deleted', { companyId, goalId });
    return true;
  }
}
