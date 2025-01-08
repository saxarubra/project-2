import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Matrix = string[][];
type SwapRequest = {
  id: string;
  date: string;
  fromEmployee: string;
  toEmployee: string;
  fromShift: string;
  toShift: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export default function ShiftList() {
  const [matrix, setMatrix] = useState<Matrix>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date('2024-05-12'));
  const [swapHistory, setSwapHistory] = useState<SwapRequest[]>([]);
  const { user } = useAuth();

  const currentEmployeeCode = user?.user_metadata?.full_name;

  useEffect(() => {
    const fetchData = async () => {
      loadMatrix(currentWeekStart);
      await loadSwaps();
    };
    fetchData();

    const channel = supabase
      .channel('swaps')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shift_swaps_v2' },
        () => loadSwaps()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentWeekStart]);

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push({
        full: date.toLocaleDateString('it-IT'),
        day: days[i]
      });
    }
    return dates;
  };

  const loadMatrix = (startDate: Date) => {
    const weekDates = getWeekDates(startDate);
    const baseMatrix = [
      ["", ...weekDates.map(d => d.full)],
      ["", ...weekDates.map(d => d.day)],
      ["BO", "RI", "8.00", "05.55+", "05.55", "06.30", "05.55", "NL"],
      ["AA", "NL", "11.30", "11.30+", "06.30", "8.00", "06.30", "RI"],
      ["CP", "NL", "15.55", "11.30", "15.55", "11.30", "RI", "11.30+"],
      ["CT", "11.30", "15.55", "11.30", "NL", "RI", "05.00+", "00.00"],
      ["CH", "00.00", "00.00", "NL", "RI", "06.30", "06.30", "05.55+"],
      ["CF", "05.55+", "NL", "RI", "8.00", "05.55", "05.55", "05.55"],
      ["DV", "05.55", "RI", "NL", "05.55+", "05.55", "05.55", "09.00"],
      ["AD", "09.00", "RI", "05.55", "09.00+", "09.00", "05.55", "NL"],
      ["DM", "RI", "05.55", "05.55", "05.55", "05.00+", "00.00", "NL"],
      ["FO", "NL", "15.55-", "15.55", "11.30", "11.30", "11.30", "RI"],
      ["GM", "NL", "05.55", "05.00+", "00.00", "00.00", "RI", "09.00"],
      ["IT", "09.00+", "06.30", "06.30", "06.30", "RI", "NL", "05.55"],
      ["CA", "06.30", "05.00+", "00.00", "RI", "NL", "15.55", "11.30"],
      ["LP", "11.30", "12.45-", "RI", "NL", "11.30", "10.30", "06.30+"],
      ["LG", "15.55", "RI", "12.45-", "15.55", "15.55", "12.45", "NL"],
      ["MA", "RI", "11.30-", "15.55", "12,45", "15.55", "15.55", "NL"],
      ["MO", "NL", "15.55", "15.55", "11.30", "11.30", "11.30-", "RI"],
      ["MI", "NL", "11.30+", "06.30", "05.00", "NL", "RI", "09.00"],
      ["NF", "05.55", "05.55+", "8.00", "NL", "RI", "06.30", "06.30"],
      ["PN", "06.30", "09.00", "NL", "RI", "15.55", "15.55", "15.55-"],
      ["PC", "11.30", "NL", "RI", "15.55", "15.55", "11.30-", "15.55"],
      ["CB", "15.55", "RI", "15.55", "15.55", "12.45-", "15.55", "NL"],
      ["RS", "RI", "14.30", "10.30", "14.30", "10.30", "8.00+", "NL"],
      ["SC", "NL", "06.30", "05.00+", "00.00", "00.00", "00.00", "RI"],
      ["SI", "NL", "05.55", "05.55", "05.55", "06.30+", "RI", "14.30"],
      ["DG", "14.30", "10.30", "06.30+", "05.00", "RI", "NL", "05.00"],
      ["SG", "05.00+", "00.00", "00.00", "RI", "NL", "14.30", "11.30"],
      ["TJ", "09.00", "05.00", "RI", "NL", "05.00", "05.00+", "00.00"],
      ["VE", "00.00", "RI", "14.30", "10.30", "14.30", "11.30-", "NL"]
    ];
    setMatrix(baseMatrix);
  };

  const handlePrevWeek = () => {
    const newStartDate = new Date(currentWeekStart);
    newStartDate.setDate(newStartDate.getDate() - 7);
    setCurrentWeekStart(newStartDate);
    
    // Rotate employee shifts
    const newMatrix = [...matrix];
    const firstSigla = newMatrix[2][0];
    for (let i = 2; i < newMatrix.length - 1; i++) {
      newMatrix[i][0] = newMatrix[i + 1][0];
    }
    newMatrix[newMatrix.length - 1][0] = firstSigla;
    setMatrix(newMatrix);
  };

  const handleNextWeek = () => {
    const newStartDate = new Date(currentWeekStart);
    newStartDate.setDate(newStartDate.getDate() + 7);
    setCurrentWeekStart(newStartDate);
    
    // Rotate employee shifts
    const newMatrix = [...matrix];
    const lastSigla = newMatrix[newMatrix.length - 1][0];
    for (let i = newMatrix.length - 1; i > 2; i--) {
      newMatrix[i][0] = newMatrix[i - 1][0];
    }
    newMatrix[2][0] = lastSigla;
    setMatrix(newMatrix);
  };

  const loadSwaps = async () => {
    const { data } = await supabase
      .from('shift_swaps_v2')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setSwaps(data.map(swap => ({
        id: swap.id,
        date: swap.date,
        fromEmployee: swap.from_employee,
        toEmployee: swap.to_employee,
        fromShift: swap.from_shift,
        toShift: swap.to_shift,
        status: swap.status
      })));
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (col === 0 || matrix[row][col] === 'NL' || matrix[row][col] === 'RI') return;
    
    const employeeCode = matrix[row][0];
    
    setSelectedCells((prev) => {
      if (prev.length === 0) {
        // Only allow selecting own shifts
        if (employeeCode !== currentEmployeeCode) {
          return prev;
        }
        return [[row, col]];
      }
      
      if (prev.length === 1) {
        const [firstRow, firstCol] = prev[0];
        
        // Cancel if clicking the same cell
        if (firstRow === row && firstCol === col) {
          return [];
        }
        
        // Only allow swaps within the same day
        if (firstCol !== col) {
          return prev;
        }
        
        const fromEmployee = matrix[firstRow][0];
        const toEmployee = matrix[row][0];
        const date = matrix[0][col];
        const fromShift = matrix[firstRow][col];
        const toShift = matrix[row][col];
        
        // Create swap request
        supabase
          .from('shift_swaps_v2')
          .insert({
            date: date.split('/').reverse().join('-'),
            from_employee: fromEmployee,
            to_employee: toEmployee,
            from_shift: fromShift,
            to_shift: toShift,
            status: 'pending'
          })
          .then(({ data }) => {
            if (data) {
              setSwapHistory((prev) => [...prev, data[0]]);
              loadSwaps();
            }
          });
        
        return [];
      }
      return prev;
    });
  };

  const handleSwapResponse = async (swapId: string, accept: boolean) => {
    const status = accept ? 'accepted' : 'rejected';
    
    const { error } = await supabase
      .from('shift_swaps_v2')
      .update({ status })
      .eq('id', swapId);

    if (error) {
      console.error('Error updating swap:', error);
      return;
    }

    loadSwaps();
  };

  const handleUndo = async () => {
    const lastSwap = swapHistory.pop();
    if (lastSwap) {
      const { error } = await supabase
        .from('shift_swaps_v2')
        .delete()
        .eq('id', lastSwap.id);

      if (error) {
        console.error('Error deleting swap:', error);
        return;
      }

      setSwapHistory([...swapHistory]);
      loadSwaps();
    }
  };

  const getSwapForCell = (row: number, col: number) => {
    const date = matrix[0][col];
    const employeeCode = matrix[row][0];
    const shift = matrix[row][col];

    return swaps.find(swap => 
      swap.status === 'accepted' &&
      swap.date === date.split('/').reverse().join('-') &&
      ((swap.fromEmployee === employeeCode && swap.fromShift === shift) ||
       (swap.toEmployee === employeeCode && swap.toShift === shift))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Settimana Precedente
          </button>
          <button
            onClick={handleNextWeek}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Settimana Successiva
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        <button
          onClick={handleUndo}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Undo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {matrix[1]?.map((day, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {day}
                </th>
              ))}
            </tr>
            <tr>
              {matrix[0]?.map((date, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matrix.slice(2).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  const swap = getSwapForCell(rowIndex + 2, colIndex);
                  const isSelected = selectedCells.some(([r, c]) => r === rowIndex + 2 && c === colIndex);
                  const pendingSwap = swaps.find(s => 
                    s.status === 'pending' &&
                    s.date === matrix[0][colIndex].split('/').reverse().join('-') &&
                    ((s.fromEmployee === row[0] && s.fromShift === cell) ||
                     (s.toEmployee === row[0] && s.toShift === cell))
                  );

                  return (
                    <td
                      key={colIndex}
                      onClick={() => handleCellClick(rowIndex + 2, colIndex)}
                      className={`px-6 py-4 whitespace-nowrap relative ${
                        colIndex === 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                      } cursor-pointer ${isSelected ? 'bg-yellow-100' : ''}`}
                    >
                      {swap ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <div className="font-medium">
                            {swap.toEmployee === row[0] ? swap.fromShift : swap.toShift}
                          </div>
                          <div className="text-xs text-green-600">
                            Scambiato con {swap.toEmployee === row[0] ? swap.fromEmployee : swap.toEmployee}
                          </div>
                        </div>
                      ) : pendingSwap ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                          <div className="font-medium">{cell}</div>
                          <div className="text-xs text-yellow-600">
                            {pendingSwap.toEmployee === row[0] ? (
                              <div className="flex items-center gap-2">
                                <span>Richiesta da {pendingSwap.fromEmployee}</span>
                                {currentEmployeeCode === row[0] && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSwapResponse(pendingSwap.id, true);
                                      }}
                                      className="p-1 hover:bg-green-100 rounded"
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSwapResponse(pendingSwap.id, false);
                                      }}
                                      className="p-1 hover:bg-red-100 rounded"
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span>In attesa di {pendingSwap.toEmployee}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>{cell}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}