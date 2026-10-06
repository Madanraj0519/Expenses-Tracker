import React, { useEffect, useState } from 'react';
import axiosInstance from '../Constant/Backend/axiosInstance';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../Context/CurrencyContext';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const SmartInsights = () => {
  const { formatCurrency } = useCurrency();
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadInsights = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await axiosInstance.get('/api/insights/spending', {
          params: { month },
          signal: controller.signal,
        });
        if (isMounted) setData(response.data);
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          toast.error(error.friendlyMessage || 'Unable to load spending insights.');
          setData(null);
          setLoadError(error.friendlyMessage || 'Unable to load spending insights.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInsights();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [month, retryCount]);

  return (
    <section className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-md" aria-labelledby="smart-insights-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 id="smart-insights-heading" className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Smart spending insights</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Explainable comparisons from your own spending and budgets. No external AI service is used.
          </p>
        </div>
        <label htmlFor="insights-month" className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Month
          <input
            id="insights-month"
            type="month"
            required
            max={currentMonth()}
            value={month}
            onChange={(event) => {
              if (event.target.value) setMonth(event.target.value);
            }}
            className="ml-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1.5"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="py-5 text-center text-sm text-slate-500">Analyzing your spending…</p>
      ) : loadError ? (
        <div role="alert" className="rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
          <p>{loadError}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-2 font-semibold underline">Try again</button>
        </div>
      ) : data?.insights?.length ? (
        <div className="space-y-3">
          {data.insights.map((insight, index) => {
            const { evidence = {} } = insight;
            const message = insight.type === 'budget_pace' && Number.isFinite(evidence.spent) && Number.isFinite(evidence.budget)
              ? evidence.spent >= evidence.budget
                ? `${insight.category || 'Overall spending'} spending is ${formatCurrency(evidence.spent)} against a ${formatCurrency(evidence.budget)} budget.`
                : `At this pace, ${insight.category?.toLowerCase() || 'overall'} spending may reach ${formatCurrency(evidence.projected)} against a ${formatCurrency(evidence.budget)} budget.`
              : insight.type === 'month_over_month' && Number.isFinite(evidence.currentAmount) && Number.isFinite(evidence.previousComparable)
                ? `${insight.category} spending is ${formatCurrency(evidence.currentAmount)} over the first ${evidence.comparableDays} days, compared with ${formatCurrency(evidence.previousComparable)} over the same days in ${evidence.previousMonth}.`
                : insight.type === 'unusual_spending' && Number.isFinite(evidence.projected) && Number.isFinite(evidence.historicalAverage)
                  ? `At the current pace, ${insight.category?.toLowerCase()} spending may reach ${formatCurrency(evidence.projected)} this month; your average for the previous three months was ${formatCurrency(evidence.historicalAverage)}.`
                  : insight.message;
            const tone = insight.severity === 'positive'
              ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-500/10'
              : insight.severity === 'warning'
                ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-500/10'
                : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-500/10';
            return (
              <article key={`${insight.type}-${insight.category || 'overall'}-${index}`} className={`rounded-xl border p-3 ${tone}`}>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{insight.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{message}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="py-5 text-center text-sm text-slate-500 dark:text-slate-400">
          No notable spending changes or budget risks for this month.
        </p>
      )}

      {!isLoading && data?.dataSufficiency?.message && (
        <p className="mt-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 p-3 text-xs text-slate-600 dark:text-slate-300">
          {data.dataSufficiency.message}
        </p>
      )}
    </section>
  );
};

export default SmartInsights;
