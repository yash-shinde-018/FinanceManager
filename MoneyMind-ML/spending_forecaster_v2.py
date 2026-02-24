# spending_forecaster_v2.py
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import joblib
import warnings
warnings.filterwarnings('ignore')

class ImprovedSpendingForecaster:
    def __init__(self):
        self.sarimax_model = None
        self.ets_model = None
        self.daily_spending = None
        self.category_models = {}
        
    def prepare_time_series(self, df, freq='D'):
        """Prepare time series with proper handling of missing dates"""
        expenses = df[df['amount'] < 0].copy()
        expenses['spending'] = abs(expenses['amount'])
        expenses['date'] = pd.to_datetime(expenses['date'])
        
        # Daily aggregation
        daily_spending = expenses.groupby('date')['spending'].sum()
        
        # Create complete date range
        date_range = pd.date_range(
            start=daily_spending.index.min(),
            end=daily_spending.index.max(),
            freq=freq
        )
        
        # Reindex to fill missing dates with 0
        daily_spending = daily_spending.reindex(date_range, fill_value=0)
        
        # Apply smoothing to reduce noise
        daily_spending = daily_spending.rolling(window=3, center=True, min_periods=1).mean()
        
        return daily_spending
    
    def train_sarimax(self, df):
        """Train SARIMAX model with weekly seasonality"""
        self.daily_spending = self.prepare_time_series(df)
        
        print(f"Training SARIMAX on {len(self.daily_spending)} days of data")
        
        # SARIMAX with weekly seasonality
        # (p,d,q) x (P,D,Q,s)
        # s=7 for weekly seasonality
        try:
            self.sarimax_model = SARIMAX(
                self.daily_spending,
                order=(1, 1, 1),  # ARIMA order
                seasonal_order=(1, 0, 1, 7),  # Weekly seasonality
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            
            self.sarimax_model = self.sarimax_model.fit(disp=False, maxiter=100)
            
            # Save model
            joblib.dump(self.sarimax_model, 'sarimax_model.pkl')
            
            print("SARIMAX model trained successfully")
            print(f"AIC: {self.sarimax_model.aic:.2f}")
            
        except Exception as e:
            print(f"SARIMAX training failed: {e}")
            print("Falling back to simpler model...")
            self._train_fallback_model(df)
    
    def _train_fallback_model(self, df):
        """Fallback to Exponential Smoothing if SARIMAX fails"""
        self.daily_spending = self.prepare_time_series(df)
        
        try:
            self.ets_model = ExponentialSmoothing(
                self.daily_spending,
                seasonal_periods=7,  # Weekly seasonality
                trend='add',
                seasonal='add',
                damped_trend=True
            ).fit()
            
            joblib.dump(self.ets_model, 'ets_model.pkl')
            print("Exponential Smoothing model trained successfully")
            
        except Exception as e:
            print(f"ETS training also failed: {e}")
    
    def forecast(self, periods=30):
        """Generate forecast with confidence intervals"""
        try:
            if self.sarimax_model:
                forecast_result = self.sarimax_model.forecast(steps=periods)
                
                # Get confidence intervals
                forecast_df = self.sarimax_model.get_forecast(steps=periods)
                conf_int = forecast_df.conf_int()
                
                forecast_dates = pd.date_range(
                    start=self.daily_spending.index[-1] + pd.Timedelta(days=1),
                    periods=periods,
                    freq='D'
                )
                
                return {
                    'dates': forecast_dates,
                    'forecast': np.maximum(forecast_result.values, 0),  # No negative spending
                    'lower_bound': np.maximum(conf_int.iloc[:, 0].values, 0),
                    'upper_bound': conf_int.iloc[:, 1].values,
                    'model': 'SARIMAX'
                }
            
            elif self.ets_model:
                forecast_values = self.ets_model.forecast(steps=periods)
                
                forecast_dates = pd.date_range(
                    start=self.daily_spending.index[-1] + pd.Timedelta(days=1),
                    periods=periods,
                    freq='D'
                )
                
                # Approximate confidence intervals (ETS doesn't provide them directly)
                std_error = self.daily_spending.std() * 0.3
                
                return {
                    'dates': forecast_dates,
                    'forecast': np.maximum(forecast_values, 0),
                    'lower_bound': np.maximum(forecast_values - 1.96 * std_error, 0),
                    'upper_bound': forecast_values + 1.96 * std_error,
                    'model': 'ETS'
                }
        
        except Exception as e:
            print(f"Forecast failed: {e}")
            return self._naive_forecast(periods)
    
    def _naive_forecast(self, periods):
        """Simple moving average forecast as last resort"""
        recent_avg = self.daily_spending.tail(14).mean()
        forecast_dates = pd.date_range(
            start=self.daily_spending.index[-1] + pd.Timedelta(days=1),
            periods=periods,
            freq='D'
        )
        
        return {
            'dates': forecast_dates,
            'forecast': np.full(periods, recent_avg),
            'lower_bound': np.full(periods, recent_avg * 0.7),
            'upper_bound': np.full(periods, recent_avg * 1.3),
            'model': 'Naive'
        }
    
    def forecast_by_category(self, df, category, periods=30):
        """Forecast spending for specific category"""
        category_df = df[df['category'] == category]
        
        if len(category_df) < 30:
            return None  # Not enough data
        
        category_spending = self.prepare_time_series(category_df)
        
        try:
            model = ExponentialSmoothing(
                category_spending,
                seasonal_periods=7,
                trend='add',
                seasonal='add'
            ).fit()
            
            forecast_values = model.forecast(steps=periods)
            
            return {
                'category': category,
                'forecast': np.maximum(forecast_values, 0)
            }
        except:
            return None
    
    def generate_insights(self, df):
        """Generate actionable insights with forecasts"""
        insights = []
        
        # Historical analysis
        expenses = df[df['amount'] < 0].copy()
        expenses['spending'] = abs(expenses['amount'])
        
        # Overall statistics
        daily_avg = expenses['spending'].sum() / len(expenses['date'].unique())
        monthly_avg = daily_avg * 30
        
        insights.append({
            'type': 'summary',
            'message': f"Your average daily spending is ₹{daily_avg:.2f} (₹{monthly_avg:.2f}/month)"
        })
        
        # Top spending categories
        top_categories = expenses.groupby('category')['spending'].sum().sort_values(ascending=False).head(3)
        
        for i, (category, amount) in enumerate(top_categories.items(), 1):
            pct = (amount / expenses['spending'].sum()) * 100
            insights.append({
                'type': 'category',
                'message': f"#{i} spending category: {category} (₹{amount:.2f}, {pct:.1f}% of total)"
            })
        
        # Forecast comparison
        forecast = self.forecast(30)
        next_month_total = forecast['forecast'].sum()
        
        if next_month_total > monthly_avg * 1.1:
            insights.append({
                'type': 'warning',
                'message': f"⚠️ Predicted spending next month (₹{next_month_total:.2f}) is {((next_month_total/monthly_avg - 1) * 100):.1f}% higher than your average",
                'severity': 'high'
            })
        elif next_month_total < monthly_avg * 0.9:
            insights.append({
                'type': 'positive',
                'message': f"✓ Predicted spending next month (₹{next_month_total:.2f}) is lower than average - great job!",
                'severity': 'low'
            })
        
        # Weekly pattern analysis
        expenses['date'] = pd.to_datetime(expenses['date'])
        expenses['day_of_week'] = expenses['date'].dt.day_name()
        weekly_spending = expenses.groupby('day_of_week')['spending'].mean()
        
        highest_day = weekly_spending.idxmax()
        lowest_day = weekly_spending.idxmin()
        
        insights.append({
            'type': 'pattern',
            'message': f"You spend most on {highest_day}s (₹{weekly_spending[highest_day]:.2f}) and least on {lowest_day}s (₹{weekly_spending[lowest_day]:.2f})"
        })
        
        # Savings recommendation
        top_category = top_categories.index[0]
        potential_savings = top_categories.values[0] * 0.15  # 15% reduction
        
        insights.append({
            'type': 'recommendation',
            'message': f"💡 Reducing {top_category} spending by 15% could save you ₹{potential_savings:.2f}/month"
        })
        
        return insights

# Example usage
if __name__ == "__main__":
    df = pd.read_csv('synthetic_transactions.csv')
    
    forecaster = ImprovedSpendingForecaster()
    
    # Train model
    print("Training forecasting model...")
    forecaster.train_sarimax(df)
    
    # Generate forecast
    print("\n" + "="*70)
    print("30-DAY SPENDING FORECAST")
    print("="*70)
    
    forecast = forecaster.forecast(30)
    
    print(f"\nModel used: {forecast['model']}")
    print(f"\nNext 7 days forecast:")
    for i in range(7):
        date = forecast['dates'][i]
        value = forecast['forecast'][i]
        lower = forecast['lower_bound'][i]
        upper = forecast['upper_bound'][i]
        print(f"{date.strftime('%Y-%m-%d (%A)')}: ${value:.2f} (range: ${lower:.2f} - ${upper:.2f})")
    
    print(f"\nTotal predicted spending (30 days): ${forecast['forecast'].sum():.2f}")
    
    # Generate insights
    print("\n" + "="*70)
    print("PERSONALIZED INSIGHTS")
    print("="*70)
    
    insights = forecaster.generate_insights(df)
    for insight in insights:
        print(f"\n[{insight['type'].upper()}] {insight['message']}")
