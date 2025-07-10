import React, { useEffect } from 'react';
import { ColorOption } from '../types/database';
import { Trophy, TrendingDown, Sparkles } from 'lucide-react';

interface BetResultProps {
  winningColor: ColorOption;
  isWin: boolean;
  payout: number;
  onClose: () => void;
}

export function BetResult({ winningColor, isWin, payout, onClose }: BetResultProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Animated background */}
        {isWin && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa]/10 to-[#00b4d8]/10 animate-pulse" />
        )}
        
        <div className="relative z-10">
          <div className="mb-6">
            {isWin ? (
              <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-10 w-10 text-white" />
              </div>
            )}
            
            <h2 className={`text-3xl font-bold mb-2 ${isWin ? 'text-[#00d4aa]' : 'text-red-400'}`}>
              {isWin ? 'Big Win!' : 'Better Luck Next Time'}
            </h2>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-[#b1bad3]">Winning color:</span>
              <div className={`w-6 h-6 rounded-full ${
                winningColor === 'red' ? 'bg-red-500' :
                winningColor === 'green' ? 'bg-emerald-500' :
                winningColor === 'blue' ? 'bg-blue-500' :
                'bg-yellow-500'
              }`} />
              <span className="font-semibold capitalize text-white">{winningColor}</span>
            </div>
            
            {isWin && (
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="h-5 w-5 text-[#00d4aa]" />
                <p className="text-2xl font-bold text-[#00d4aa]">
                  +${payout.toFixed(2)}
                </p>
                <Sparkles className="h-5 w-5 text-[#00d4aa]" />
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] text-[#0f212e] font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
}