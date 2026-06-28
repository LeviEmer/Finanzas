import { dashboardService } from "@/services/dashboardService";
import { calendarService } from "@/services/calendarService";
import { settingsService } from "@/services/settingsService";
import { debtRepository } from "@/data/repositories/debtRepository";
import { incomeRepository } from "@/data/repositories/incomeRepository";
import { antExpenseRepository } from "@/data/repositories/antExpenseRepository";
import { calculateAntExpenseImpact } from "@/domain/antExpenses";
import {
  generateRecommendations,
  type Recommendation,
} from "@/domain/recommendations/generateRecommendations";
import type { PaymentStrategy } from "@/shared/types";

export const recommendationService = {
  async getRecommendations(
    strategy: PaymentStrategy = "minimum_plus_surplus"
  ): Promise<Recommendation[]> {
    const [summary, groups, settings, debts, incomes, antExpenses] =
      await Promise.all([
        dashboardService.getSummary(),
        calendarService.getGroups(),
        settingsService.get(),
        debtRepository.getAll(),
        incomeRepository.getAll(),
        antExpenseRepository.getAll(),
      ]);

    const periodIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const antExpenseImpact = calculateAntExpenseImpact(
      antExpenses,
      periodIncome
    );

    return generateRecommendations({
      balance: summary.balance,
      minimumCushion: settings.minimumCushion,
      debts,
      strategy,
      antExpenseImpact,
      antExpenseThresholdPercentage: settings.antExpenseThresholdPercentage,
      overdueEntries: groups.overdue,
    });
  },
};
