import React, { useEffect } from 'react';
import { SEION_TO_ROMAJI, DAKUON_TO_ROMAJI, YOON_TO_ROMAJI } from './KanaTrainer';


// Function to play pronunciation using Web Speech API
export function playPronunciation(romaji: string) {
    const utterance = new SpeechSynthesisUtterance();
    // utterance.text = 'こんにちは、世界';
    utterance.text = romaji;
    utterance.lang = 'ja-JP'; // Set language to Japanese
    utterance.volume = 1.0;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Optional: Try to select a Japanese voice
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang === 'ja-JP');
    if (japaneseVoice) {
        utterance.voice = japaneseVoice;
    }

    window.speechSynthesis.speak(utterance);
}

// Reference Table Component
export const KanaReferenceTable: React.FC = () => {

    // Helper function to chunk arrays
    const chunkArray = <T,>(array: T[], size: number): T[][] => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    // Ensure voices are loaded (some browsers need this)
    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }, []);

    return (
        <div className="reference-table">
            <h2>假名对照表</h2>
            <div className="kana-sections">
                <div className="kana-section">
                    <h3>清音 (Seion)</h3>
                    <table>
                        <tbody>
                            {chunkArray(SEION_TO_ROMAJI, 5).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map(([hiragana, katakana, romaji]) => (
                                        <td key={hiragana}
                                            className="kana-cell"
                                            onClick={() => playPronunciation(hiragana)}
                                            title={`点击播放 "${romaji}"`}
                                        >
                                            <span className="kana-char">{hiragana} {katakana}</span>
                                            <span className="kana-roma">{romaji}</span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="kana-section">
                    <h3>浊音 (Dakuon)</h3>
                    <table>
                        <tbody>
                            {chunkArray(DAKUON_TO_ROMAJI, 5).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map(([hiragana, katakana, romaji]) => (
                                        <td key={hiragana}
                                            className="kana-cell"
                                            onClick={() => playPronunciation(hiragana)}
                                            title={`点击播放 "${romaji}"`}
                                        >
                                            <span className="kana-char">{hiragana} {katakana}</span>
                                            <span className="kana-roma">{romaji}</span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="kana-section">
                    <h3>拗音 (Yoon)</h3>
                    <table>
                        <tbody>
                            {chunkArray(YOON_TO_ROMAJI, 3).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map(([hiragana, katakana, romaji]) => (
                                        <td key={hiragana}
                                            className="kana-cell"
                                            onClick={() => playPronunciation(hiragana)}
                                            title={`点击播放 "${romaji}"`}
                                        >
                                            <span className="kana-char">{hiragana} {katakana}</span>
                                            <span className="kana-roma">{romaji}</span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
