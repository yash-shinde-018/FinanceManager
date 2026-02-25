// ML-enhanced transaction operations
import { createClient } from '@/lib/supabase/client';
import { mlClient, formatTransactionForML } from '@/lib/ml/client';

export async function createTransactionWithML(transaction: {
    description: string;
    amount: number;
    date: Date;
    paymentMethod?: string;
    merchant?: string;
    accountId?: string;
}) {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Use ML to categorize and detect anomalies
    const mlTransaction = formatTransactionForML({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
    });

    let category = 'Other';
    let isAnomaly = false;
    let confidence = 0;

    try {
        const result = await mlClient.categorizeTransaction(mlTransaction);
        if (result) {
            category = result.category;
            isAnomaly = result.is_anomaly;
            confidence = result.confidence;
        }
    } catch (error) {
        console.error('ML categorization failed, using default:', error);
    }

    // Determine transaction type
    const type = transaction.amount > 0 ? 'income' : 'expense';

    // Insert into database
    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            account_id: transaction.accountId ?? null,
            description: transaction.description,
            amount: Math.abs(transaction.amount),
            type,
            category,
            payment_method: transaction.paymentMethod || 'Other',
            merchant: transaction.merchant,
            is_anomaly: isAnomaly,
            occurred_at: transaction.date.toISOString(),
        })
        .select()
        .single();

    if (error) throw error;

    // If anomaly detected, create notification
    if (isAnomaly) {
        await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Unusual Transaction Detected',
            message: `A transaction of ₹${Math.abs(transaction.amount).toFixed(2)} at ${transaction.description} was flagged as unusual.`,
            type: 'alert',
            link: '/dashboard/transactions',
        });
    }

    return { ...data, confidence };
}

export async function saveAnomalyFeedback(
    transactionId: string,
    isActuallyAnomaly: boolean,
    originalPrediction: boolean,
    confidenceScore: number,
    userNotes?: string
) {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Save feedback
    const { error } = await supabase
        .from('anomaly_feedback')
        .insert({
            transaction_id: transactionId,
            user_id: user.id,
            is_actually_anomaly: isActuallyAnomaly,
            original_ml_prediction: originalPrediction,
            confidence_score: confidenceScore,
            user_notes: userNotes || null,
        });

    if (error) {
        console.error('Error saving anomaly feedback:', error);
        throw error;
    }

    // Update transaction's is_anomaly flag based on user feedback
    const { error: updateError } = await supabase
        .from('transactions')
        .update({ is_anomaly: isActuallyAnomaly })
        .eq('id', transactionId);

    if (updateError) {
        console.error('Error updating transaction:', updateError);
        throw updateError;
    }

    return { success: true };
}

export async function batchImportTransactionsWithML(transactions: Array<{
    description: string;
    amount: number;
    date: Date;
    paymentMethod?: string;
}>) {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Format for ML API
    const mlTransactions = transactions.map(t => formatTransactionForML(t));

    // Batch categorize with ML
    let categorizedResults: any[] = [];
    try {
        categorizedResults = await mlClient.batchCategorize(mlTransactions);
    } catch (error) {
        console.error('ML batch categorization failed:', error);
    }

    // Prepare database inserts
    const dbTransactions = transactions.map((t, index) => {
        const mlResult = categorizedResults[index];
        const type = t.amount > 0 ? 'income' : 'expense';

        return {
            user_id: user.id,
            description: t.description,
            amount: Math.abs(t.amount),
            type,
            category: mlResult?.category || 'Other',
            payment_method: t.paymentMethod || 'Other',
            is_anomaly: mlResult?.is_anomaly || false,
            occurred_at: t.date.toISOString(),
        };
    });

    // Bulk insert
    const { data, error } = await supabase
        .from('transactions')
        .insert(dbTransactions)
        .select();

    if (error) throw error;

    // Count anomalies for notification
    const anomalyCount = dbTransactions.filter(t => t.is_anomaly).length;
    if (anomalyCount > 0) {
        await supabase.from('notifications').insert({
            user_id: user.id,
            title: `${anomalyCount} Unusual Transactions Detected`,
            message: `${anomalyCount} transactions were flagged during import. Review them in your transaction history.`,
            type: 'alert',
            link: '/dashboard/transactions',
        });
    }

    return data;
}

export async function getMLInsights() {
    try {
        const insights = await mlClient.getInsights();
        return insights?.insights || [];
    } catch (error) {
        console.error('Error fetching ML insights:', error);
        return [];
    }
}

export async function getSpendingForecast(days: number = 30) {
    try {
        const forecast = await mlClient.getForecast(days);
        return forecast;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        return null;
    }
}
