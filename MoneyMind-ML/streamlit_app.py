# streamlit_app.py
import streamlit as st
import requests
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import json

# Page config
st.set_page_config(
    page_title="MoneyMind AI",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# API base URL
API_BASE_URL = "http://localhost:8000"

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .anomaly-high {
        background-color: #ffebee;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #f44336;
    }
    .anomaly-medium {
        background-color: #fff3e0;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #ff9800;
    }
    .anomaly-low {
        background-color: #e8f5e9;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #4caf50;
    }
    .stButton>button {
        width: 100%;
        background-color: #1f77b4;
        color: white;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-header">💰 MoneyMind AI</div>', unsafe_allow_html=True)
st.markdown('<p style="text-align: center; color: #666; font-size: 1.2rem;">AI-Powered Personal Finance Manager</p>', unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/000000/money-bag-rupee.png", width=100)
    st.title("Navigation")
    
    page = st.radio(
        "Choose a feature:",
        ["🏠 Home", "📝 Categorize Transaction", "🔍 Anomaly Detection", "📊 Spending Forecast", "💡 Insights Dashboard"]
    )
    
    st.markdown("---")
    
    # API Health Check
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            st.success("✅ API Connected")
        else:
            st.error("❌ API Error")
    except:
        st.error("❌ API Offline")
    
    st.markdown("---")
    st.markdown("### About")
    st.info("MoneyMind AI uses machine learning to categorize expenses, detect anomalies, and predict spending patterns.")

# Home Page
if page == "🏠 Home":
    st.header("Welcome to MoneyMind AI! 🎉")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <h3>📝 Categorize</h3>
            <p>Automatically categorize your transactions using AI</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <h3>🔍 Detect</h3>
            <p>Identify unusual transactions and potential fraud</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <h3>📊 Forecast</h3>
            <p>Predict future spending with confidence intervals</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    st.subheader("🚀 Quick Start")
    st.markdown("""
    1. **Categorize Transaction**: Enter a transaction to see its category and confidence score
    2. **Anomaly Detection**: Check if a transaction is unusual or suspicious
    3. **Spending Forecast**: View predictions for the next 7-30 days
    4. **Insights Dashboard**: Get personalized financial insights and recommendations
    """)
    
    st.markdown("---")
    
    st.subheader("📊 Sample Transactions")
    
    sample_data = pd.DataFrame([
        {"Description": "Swiggy biryani order", "Amount": "₹450", "Category": "Food & Dining"},
        {"Description": "Flipkart electronics", "Amount": "₹45,999", "Category": "Shopping"},
        {"Description": "Ola ride to airport", "Amount": "₹850", "Category": "Transportation"},
        {"Description": "DMart groceries", "Amount": "₹2,500", "Category": "Groceries"},
        {"Description": "Netflix subscription", "Amount": "₹649", "Category": "Entertainment"},
    ])
    
    st.dataframe(sample_data, use_container_width=True)

# Categorize Transaction Page
elif page == "📝 Categorize Transaction":
    st.header("📝 Categorize Transaction")
    st.markdown("Enter transaction details to get AI-powered categorization")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        description = st.text_input(
            "Transaction Description",
            placeholder="e.g., Swiggy biryani order",
            help="Enter the merchant name or transaction description"
        )
        
        amount = st.number_input(
            "Amount (₹)",
            min_value=0.0,
            value=450.0,
            step=10.0,
            help="Enter the transaction amount (positive number)"
        )
        
        date = st.date_input(
            "Transaction Date",
            value=datetime.now(),
            help="Select the transaction date"
        )
        
        categorize_btn = st.button("🔍 Categorize Transaction", type="primary")
    
    with col2:
        st.markdown("### Quick Examples")
        if st.button("🍔 Swiggy Order"):
            description = "swiggy biryani order"
            amount = 450.0
        if st.button("🛒 Flipkart Shopping"):
            description = "flipkart electronics"
            amount = 45999.0
        if st.button("🚗 Ola Ride"):
            description = "ola ride to airport"
            amount = 850.0
        if st.button("🏪 DMart Groceries"):
            description = "dmart groceries"
            amount = 2500.0
    
    if categorize_btn and description:
        with st.spinner("Analyzing transaction..."):
            try:
                response = requests.post(
                    f"{API_BASE_URL}/categorize",
                    json={
                        "date": date.strftime("%Y-%m-%d"),
                        "description": description,
                        "amount": -amount
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    st.success("✅ Transaction Categorized!")
                    
                    # Main results
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.metric("Category", result['category'])
                    
                    with col2:
                        confidence = result['confidence'] * 100
                        st.metric("Confidence", f"{confidence:.1f}%")
                    
                    with col3:
                        anomaly_status = "🚨 Anomaly" if result['is_anomaly'] else "✅ Normal"
                        st.metric("Status", anomaly_status)
                    
                    # Top 3 predictions
                    st.markdown("### 🎯 Top 3 Predictions")
                    top_3_df = pd.DataFrame(
                        result['top_3_predictions'],
                        columns=["Category", "Confidence"]
                    )
                    top_3_df['Confidence'] = (top_3_df['Confidence'] * 100).round(1).astype(str) + '%'
                    st.dataframe(top_3_df, use_container_width=True, hide_index=True)
                    
                    # Confidence chart
                    fig = go.Figure(data=[
                        go.Bar(
                            x=[cat for cat, _ in result['top_3_predictions']],
                            y=[conf * 100 for _, conf in result['top_3_predictions']],
                            marker_color=['#1f77b4', '#ff7f0e', '#2ca02c']
                        )
                    ])
                    fig.update_layout(
                        title="Prediction Confidence",
                        xaxis_title="Category",
                        yaxis_title="Confidence (%)",
                        height=300
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    
                else:
                    st.error(f"Error: {response.status_code}")
            
            except Exception as e:
                st.error(f"Error connecting to API: {str(e)}")

# Anomaly Detection Page
elif page == "🔍 Anomaly Detection":
    st.header("🔍 Anomaly Detection")
    st.markdown("Check if a transaction is unusual or potentially fraudulent")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        description = st.text_input(
            "Transaction Description",
            placeholder="e.g., Flipkart laptop purchase",
            help="Enter the transaction description"
        )
        
        amount = st.number_input(
            "Amount (₹)",
            min_value=0.0,
            value=75000.0,
            step=100.0,
            help="Enter the transaction amount"
        )
        
        date = st.date_input(
            "Transaction Date",
            value=datetime.now()
        )
        
        detect_btn = st.button("🔍 Check for Anomalies", type="primary")
    
    with col2:
        st.markdown("### Test Cases")
        if st.button("💰 Large Purchase"):
            description = "flipkart laptop purchase"
            amount = 75000.0
        if st.button("🔄 Round Number"):
            description = "cash withdrawal"
            amount = 50000.0
        if st.button("✅ Normal Transaction"):
            description = "swiggy dinner order"
            amount = 450.0
    
    if detect_btn and description:
        with st.spinner("Analyzing for anomalies..."):
            try:
                response = requests.post(
                    f"{API_BASE_URL}/categorize",
                    json={
                        "date": date.strftime("%Y-%m-%d"),
                        "description": description,
                        "amount": -amount
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Anomaly status
                    if result['is_anomaly']:
                        severity = result.get('anomaly_severity', 'unknown')
                        
                        if severity == 'high':
                            st.markdown(f"""
                            <div class="anomaly-high">
                                <h2>🚨 HIGH RISK ANOMALY DETECTED</h2>
                                <p style="font-size: 1.2rem;">This transaction shows multiple suspicious patterns</p>
                            </div>
                            """, unsafe_allow_html=True)
                        elif severity == 'medium':
                            st.markdown(f"""
                            <div class="anomaly-medium">
                                <h2>⚠️ MEDIUM RISK ANOMALY</h2>
                                <p style="font-size: 1.2rem;">This transaction is unusual but may be legitimate</p>
                            </div>
                            """, unsafe_allow_html=True)
                        else:
                            st.markdown(f"""
                            <div class="anomaly-low">
                                <h2>⚡ LOW RISK ANOMALY</h2>
                                <p style="font-size: 1.2rem;">Minor deviation from normal patterns</p>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        # Anomaly details
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            st.metric("Amount", f"₹{amount:,.2f}")
                        
                        with col2:
                            st.metric("Category", result['category'])
                        
                        with col3:
                            score = result.get('anomaly_score', 0)
                            st.metric("Anomaly Score", f"{score:.3f}")
                        
                        # Explanations
                        if result.get('anomaly_explanation'):
                            explanation = result['anomaly_explanation']
                            
                            st.markdown("### 📋 Why is this flagged?")
                            for i, exp in enumerate(explanation.get('explanations', []), 1):
                                st.warning(f"**{i}.** {exp}")
                            
                            st.markdown("### 🏴 Flags")
                            flags = explanation.get('flags', [])
                            flag_cols = st.columns(len(flags))
                            for i, flag in enumerate(flags):
                                with flag_cols[i]:
                                    st.info(flag.replace('_', ' ').title())
                    
                    else:
                        st.success("✅ No Anomaly Detected")
                        st.markdown("""
                        <div class="metric-card">
                            <h3>This transaction appears normal</h3>
                            <p>The amount and pattern match your typical spending behavior</p>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.metric("Amount", f"₹{amount:,.2f}")
                        with col2:
                            st.metric("Category", result['category'])
                
                else:
                    st.error(f"Error: {response.status_code}")
            
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Spending Forecast Page
elif page == "📊 Spending Forecast":
    st.header("📊 Spending Forecast")
    st.markdown("Predict your future spending with AI-powered forecasting")
    
    days = st.slider(
        "Forecast Period (days)",
        min_value=7,
        max_value=30,
        value=7,
        help="Select how many days to forecast"
    )
    
    forecast_btn = st.button("📈 Generate Forecast", type="primary")
    
    if forecast_btn:
        with st.spinner("Generating forecast..."):
            try:
                response = requests.post(
                    f"{API_BASE_URL}/forecast",
                    json={"days": days},
                    timeout=15
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    st.success(f"✅ {days}-Day Forecast Generated!")
                    
                    # Summary metrics
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        total = result['total_predicted']
                        st.metric("Total Predicted", f"₹{total:,.2f}")
                    
                    with col2:
                        avg_daily = total / days
                        st.metric("Avg Daily", f"₹{avg_daily:,.2f}")
                    
                    with col3:
                        st.metric("Model Used", result['model_used'])
                    
                    # Forecast chart
                    st.markdown("### 📈 Spending Forecast")
                    
                    df = pd.DataFrame({
                        'Date': result['dates'],
                        'Forecast': result['forecast'],
                        'Lower Bound': result['lower_bound'],
                        'Upper Bound': result['upper_bound']
                    })
                    
                    fig = go.Figure()
                    
                    # Add confidence interval
                    fig.add_trace(go.Scatter(
                        x=df['Date'],
                        y=df['Upper Bound'],
                        fill=None,
                        mode='lines',
                        line_color='rgba(0,0,0,0)',
                        showlegend=False
                    ))
                    
                    fig.add_trace(go.Scatter(
                        x=df['Date'],
                        y=df['Lower Bound'],
                        fill='tonexty',
                        mode='lines',
                        line_color='rgba(0,0,0,0)',
                        fillcolor='rgba(31, 119, 180, 0.2)',
                        name='Confidence Interval'
                    ))
                    
                    # Add forecast line
                    fig.add_trace(go.Scatter(
                        x=df['Date'],
                        y=df['Forecast'],
                        mode='lines+markers',
                        name='Forecast',
                        line=dict(color='#1f77b4', width=3),
                        marker=dict(size=8)
                    ))
                    
                    fig.update_layout(
                        title=f"{days}-Day Spending Forecast",
                        xaxis_title="Date",
                        yaxis_title="Amount (₹)",
                        height=500,
                        hovermode='x unified'
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Data table
                    st.markdown("### 📋 Detailed Forecast")
                    df['Forecast'] = df['Forecast'].apply(lambda x: f"₹{x:,.2f}")
                    df['Lower Bound'] = df['Lower Bound'].apply(lambda x: f"₹{x:,.2f}")
                    df['Upper Bound'] = df['Upper Bound'].apply(lambda x: f"₹{x:,.2f}")
                    st.dataframe(df, use_container_width=True, hide_index=True)
                
                else:
                    st.error(f"Error: {response.status_code}")
            
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Insights Dashboard Page
elif page == "💡 Insights Dashboard":
    st.header("💡 Insights Dashboard")
    st.markdown("Get personalized financial insights and recommendations")
    
    insights_btn = st.button("🔄 Generate Insights", type="primary")
    
    if insights_btn:
        with st.spinner("Analyzing your spending patterns..."):
            try:
                response = requests.get(f"{API_BASE_URL}/insights", timeout=15)
                
                if response.status_code == 200:
                    result = response.json()
                    insights = result['insights']
                    
                    st.success("✅ Insights Generated!")
                    
                    # Categorize insights
                    summary = [i for i in insights if i['type'] == 'summary']
                    categories = [i for i in insights if i['type'] == 'category']
                    patterns = [i for i in insights if i['type'] == 'pattern']
                    warnings = [i for i in insights if i['type'] == 'warning']
                    recommendations = [i for i in insights if i['type'] == 'recommendation']
                    
                    # Summary
                    if summary:
                        st.markdown("### 📊 Spending Summary")
                        for insight in summary:
                            st.info(insight['message'])
                    
                    # Top categories
                    if categories:
                        st.markdown("### 🏆 Top Spending Categories")
                        for insight in categories:
                            st.success(insight['message'])
                    
                    # Patterns
                    if patterns:
                        st.markdown("### 📅 Spending Patterns")
                        for insight in patterns:
                            st.info(insight['message'])
                    
                    # Warnings
                    if warnings:
                        st.markdown("### ⚠️ Warnings")
                        for insight in warnings:
                            st.warning(insight['message'])
                    
                    # Recommendations
                    if recommendations:
                        st.markdown("### 💡 Recommendations")
                        for insight in recommendations:
                            st.success(insight['message'])
                    
                    # Visualization
                    st.markdown("### 📊 Category Breakdown")
                    
                    # Extract category data from insights
                    category_data = []
                    for insight in categories:
                        msg = insight['message']
                        # Parse: "#1 spending category: Shopping (₹2393918.84, 25.5% of total)"
                        if ':' in msg and '(' in msg:
                            parts = msg.split(':')[1].split('(')
                            category = parts[0].strip()
                            amount_str = parts[1].split(',')[0].strip().replace('₹', '').replace(',', '')
                            try:
                                amount = float(amount_str)
                                category_data.append({'Category': category, 'Amount': amount})
                            except:
                                pass
                    
                    if category_data:
                        df = pd.DataFrame(category_data)
                        
                        fig = px.pie(
                            df,
                            values='Amount',
                            names='Category',
                            title='Spending by Category',
                            hole=0.4
                        )
                        fig.update_traces(textposition='inside', textinfo='percent+label')
                        st.plotly_chart(fig, use_container_width=True)
                
                else:
                    st.error(f"Error: {response.status_code}")
            
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666;">
    <p>MoneyMind AI - Powered by Machine Learning 🤖</p>
    <p>Built with Streamlit • FastAPI • scikit-learn</p>
</div>
""", unsafe_allow_html=True)
