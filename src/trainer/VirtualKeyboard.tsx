// Add this new component before the KanaTrainer component
const VirtualKeyboard: React.FC<{
    onKeyPress: (key: string) => void;
    disabled?: boolean;
  }> = ({ onKeyPress, disabled }) => {
    const keys = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
    //   ['Backspace', 'Enter', 'Space']
    ];
  
    return (
      <div className="virtual-keyboard">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={`keyboard-key ${key.length > 1 ? 'special' : ''}`}
                onClick={() => onKeyPress(key)}
                disabled={disabled}
              >
                {key === 'Backspace' ? '⌫' : key === 'Enter' ? '↵' : key === 'Space' ? '␣' : key.toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  export default VirtualKeyboard;