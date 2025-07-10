import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bet, ColorOption } from '../types/database';
import QRCode from 'qrcode';

export function useBets() {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBets();
    }
  }, [user]);

  const fetchBets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async (color: ColorOption, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const betId = crypto.randomUUID();
    const colors: ColorOption[] = ['red', 'green', 'blue', 'yellow'];
    const winningColor = colors[Math.floor(Math.random() * colors.length)];
    const isWin = color === winningColor;
    const payout = isWin ? amount * 3 : 0;

    // Generate QR code data
    const qrData = {
      betId,
      userId: user.id,
      color,
      amount,
      timestamp: new Date().toISOString(),
      winningColor,
      result: isWin ? 'win' : 'loss',
      payout,
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    try {
      const { error } = await supabase
        .from('bets')
        .insert([
          {
            id: betId,
            user_id: user.id,
            color,
            amount,
            winning_color: winningColor,
            result: isWin ? 'win' : 'loss',
            payout,
            qr_code_data: qrCodeDataUrl,
          },
        ]);

      if (error) throw error;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: isWin ? 'win' : 'loss',
            amount: isWin ? payout : -amount,
            description: `${isWin ? 'Won' : 'Lost'} $${amount} betting on ${color}`,
          },
        ]);

      await fetchBets();
      return { winningColor, isWin, payout };
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  };

  const getStats = () => {
    const totalBets = bets.length;
    const wins = bets.filter((bet) => bet.result === 'win').length;
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;
    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWon = bets.reduce((sum, bet) => sum + bet.payout, 0);
    const netProfit = totalWon - totalWagered;

    return {
      totalBets,
      wins,
      losses: totalBets - wins,
      winRate,
      totalWagered,
      totalWon,
      netProfit,
    };
  };

  return {
    bets,
    loading,
    placeBet,
    getStats,
    refetch: fetchBets,
  };
}